import { Expense } from '@/types/expense';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, ArrowUpRight, ArrowDownLeft, Landmark, Building2, Home, Receipt, Edit, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TransactionItemProps {
  transaction: Expense;
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

export function TransactionItem({ transaction, onUpdate, onDelete, canDelete = true }: TransactionItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const Icon = categoryIcons[transaction.category];
  const isIncome = transaction.type === 'income';

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
      <div className={cn(
        "flex items-center gap-4 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:shadow-sm",
        isIncome ? "bg-income/5 border-income/30" : "bg-card"
      )}>
        <div className={cn("rounded-lg p-2.5", isIncome ? "bg-income/20" : categoryColors[transaction.category])}>
          {isIncome ? (
            <ArrowUpRight className="h-5 w-5 text-income" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Input
            value={transaction.name}
            onChange={(e) => onUpdate(transaction.id, { name: e.target.value })}
            className={cn(
              "font-medium border-none bg-transparent p-0 h-auto focus-visible:ring-0",
              isIncome && "text-income"
            )}
            placeholder="Nome da transação"
          />
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className={cn("flex items-center gap-1", isIncome ? "text-income" : "")}>
              {isIncome ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
              Receita
            </span>
            <span>•</span>
            <span>{transaction.periodicity === 'monthly' ? 'Mensal' : transaction.periodicity === 'yearly' ? 'Anual' : 'Única'}</span>
            {transaction.totalInstallments && transaction.totalInstallments > 1 && (
              <>
                <span>•</span>
                <span className="text-primary font-medium">
                  {transaction.currentInstallment || 1}/{transaction.totalInstallments} parcelas
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
              value={transaction.value || ''}
              onChange={(e) => onUpdate(transaction.id, { value: parseFloat(e.target.value) || 0 })}
              className={cn(
                "w-32 pl-10 text-right font-semibold",
                isIncome && "text-income border-income/30"
              )}
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
              onClick={() => onDelete(transaction.id)}
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
            <DialogTitle>Editar {isIncome ? 'Receita' : 'Despesa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da {isIncome ? 'Receita' : 'Despesa'}</Label>
              <Input
                id="edit-name"
                value={transaction.name}
                onChange={(e) => onUpdate(transaction.id, { name: e.target.value })}
                placeholder={isIncome ? "Ex: Salário, Freelance..." : "Ex: IPTU, Luz, Água..."}
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
                    value={transaction.value || ''}
                    onChange={(e) => onUpdate(transaction.id, { value: parseFloat(e.target.value) || 0 })}
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
                  value={transaction.startDate || ''}
                  onChange={(e) => onUpdate(transaction.id, { startDate: e.target.value })}
                  placeholder="Mês/Ano"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Periodicidade</Label>
                <Select
                  value={transaction.periodicity}
                  onValueChange={(value: Expense['periodicity']) => onUpdate(transaction.id, { periodicity: value })}
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

              {!isIncome && (
                <div className="space-y-2">
                  <Label htmlFor="edit-due-day">Dia de Vencimento</Label>
                  <Input
                    id="edit-due-day"
                    type="number"
                    value={transaction.dueDay || ''}
                    onChange={(e) => onUpdate(transaction.id, { dueDay: parseInt(e.target.value) || undefined })}
                    placeholder="1-31"
                    min="1"
                    max="31"
                  />
                </div>
              )}
            </div>

            {!isIncome && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={transaction.category}
                      onValueChange={(value: Expense['category']) => onUpdate(transaction.id, { category: value })}
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
                    <Input
                      id="edit-installments"
                      type="number"
                      value={transaction.totalInstallments?.toString() || '1'}
                      onChange={(e) => onUpdate(transaction.id, { totalInstallments: parseInt(e.target.value) || 1 })}
                      placeholder="1"
                      min="1"
                      max="250"
                    />
                  </div>
                </div>
              </>
            )}

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
