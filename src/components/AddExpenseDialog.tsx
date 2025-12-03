import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Expense } from '@/types/expense';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AddExpenseDialogProps {
  onAdd: (transaction: Omit<Expense, 'id'>) => void;
}

export function AddTransactionDialog({ onAdd }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [periodicity, setPeriodicity] = useState<Expense['periodicity']>('monthly');
  const [dueDay, setDueDay] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('1');
  const [startDate, setStartDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAdd({
      name,
      value: parseFloat(value) || 0,
      category: type === 'income' ? 'other' : 'other', // categorias diferentes para receitas
      periodicity,
      dueDay: parseInt(dueDay) || undefined,
      totalInstallments: type === 'income' ? 1 : parseInt(totalInstallments) || 1, // receitas não têm parcelas
      currentInstallment: 1,
      type,
      startDate: startDate || undefined,
    });

    setName('');
    setValue('');
    setType('expense');
    setPeriodicity('monthly');
    setDueDay('');
    setTotalInstallments('1');
    setStartDate('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Despesa ou Receita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'expense' ? 'Adicionar Nova Despesa' : 'Adicionar Nova Receita'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Seleção de Tipo */}
          <div className="space-y-3">
            <Label>Tipo de Lançamento</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as 'expense' | 'income')} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-sm font-normal">Despesa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-sm font-normal">Receita</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da {type === 'expense' ? 'Despesa' : 'Receita'}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'expense' ? "Ex: IPTU, Luz, Água..." : "Ex: Salário, Aluguel, Freelance..."}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0,00"
              step="0.01"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Periodicidade</Label>
              <Select value={periodicity} onValueChange={(v) => setPeriodicity(v as Expense['periodicity'])}>
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
              <Label htmlFor="start-date">Quando começa a valer</Label>
              <Input
                id="start-date"
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Mês/Ano"
              />
            </div>
          </div>

          {/* Campos específicos para despesas */}
          {type === 'expense' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dueDay">Dia de Vencimento</Label>
                <Input
                  id="dueDay"
                  type="number"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  placeholder="1-31"
                  min="1"
                  max="31"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalInstallments">Total de Parcelas</Label>
                <Select value={totalInstallments} onValueChange={setTotalInstallments}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar parcelas" />
                  </SelectTrigger>
                  <SelectContent className="max-h-32">
                    {Array.from({ length: 30 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} parcela{i + 1 !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Máximo: 30 parcelas (Para mais, use recorrências mensais)
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
