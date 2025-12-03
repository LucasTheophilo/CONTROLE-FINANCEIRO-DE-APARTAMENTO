import { Expense } from '@/types/expense';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Building2, Landmark, Home, Receipt, Edit, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ExpenseItemProps {
  expense: Expense;
  onUpdate: (id: string, updates: Partial<Expense>) => void;
  onDelete: (id: string) => void;
  canDelete?: boolean;
}

const categoryIcons = {
  financing_bank: Landmark,
  financing_builder: Building2,
  condominium: Home,
  other: Receipt,
};

const categoryColors = {
  financing_bank: 'bg-blue-500/10 text-blue-600',
  financing_builder: 'bg-purple-500/10 text-purple-600',
  condominium: 'bg-amber-500/10 text-amber-600',
  other: 'bg-slate-500/10 text-slate-600',
};

export function ExpenseItem({ expense, onUpdate, onDelete, canDelete = true }: ExpenseItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const Icon = categoryIcons[expense.category];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className={cn("rounded-lg p-2.5", categoryColors[expense.category])}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <Input
            value={expense.name}
            onChange={(e) => onUpdate(expense.id, { name: e.target.value })}
            className="font-medium border-none bg-transparent p-0 h-auto focus-visible:ring-0"
            placeholder="Nome da despesa"
          />
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>Venc. dia {expense.dueDay || '-'}</span>
            <span>•</span>
            <span>{expense.periodicity === 'monthly' ? 'Mensal' : expense.periodicity === 'yearly' ? 'Anual' : 'Única'}</span>
            {expense.totalInstallments && expense.totalInstallments > 1 && (
              <>
                <span>•</span>
                <span className="text-primary font-medium">
                  {expense.currentInstallment || 1}/{expense.totalInstallments} parcelas
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
            <Input
              type="number"
              value={expense.value || ''}
              onChange={(e) => onUpdate(expense.id, { value: parseFloat(e.target.value) || 0 })}
              className="w-32 pl-10 text-right font-semibold"
              placeholder="0,00"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditModalOpen(true)}
            className="text-muted-foreground hover:text-primary"
          >
            <Edit className="h-4 w-4" />
          </Button>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(expense.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Modal de edição completa */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Despesa</Label>
              <Input
                id="edit-name"
                value={expense.name}
                onChange={(e) => onUpdate(expense.id, { name: e.target.value })}
                placeholder="Ex: IPTU, Internet, Luz..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-value">Valor (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="edit-value"
                    type="number"
                    value={expense.value || ''}
                    onChange={(e) => onUpdate(expense.id, { value: parseFloat(e.target.value) || 0 })}
                    className="pl-10"
                    placeholder="0,00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Quando começa a valer</Label>
                <Input
                  id="edit-start-date"
                  type="month"
                  value={expense.startDate || ''}
                  onChange={(e) => onUpdate(expense.id, { startDate: e.target.value })}
                  placeholder="Mês/Ano"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Periodicidade</Label>
                <Select
                  value={expense.periodicity}
                  onValueChange={(value: Expense['periodicity']) => onUpdate(expense.id, { periodicity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="one_time">Única</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-due-day">Dia de Vencimento</Label>
                <Input
                  id="edit-due-day"
                  type="number"
                  value={expense.dueDay || ''}
                  onChange={(e) => onUpdate(expense.id, { dueDay: parseInt(e.target.value) || undefined })}
                  placeholder="1-31"
                  min="1"
                  max="31"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={expense.category}
                  onValueChange={(value: Expense['category']) => onUpdate(expense.id, { category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financing_bank">Financiamento Banco</SelectItem>
                    <SelectItem value="financing_builder">Financiamento Construtora</SelectItem>
                    <SelectItem value="condominium">Condomínio</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-installments">Total de Parcelas</Label>
                <Select
                  value={expense.totalInstallments?.toString() || '1'}
                  onValueChange={(value) => onUpdate(expense.id, { totalInstallments: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-32">
                    {Array.from({ length: 30 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} parcela{i + 1 !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
