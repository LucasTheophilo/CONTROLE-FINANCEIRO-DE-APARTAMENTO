import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Expense } from '@/types/expense';

interface AddExpenseDialogProps {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
}

export function AddExpenseDialog({ onAdd }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [periodicity, setPeriodicity] = useState<Expense['periodicity']>('monthly');
  const [dueDay, setDueDay] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAdd({
      name,
      value: parseFloat(value) || 0,
      category: 'other',
      periodicity,
      dueDay: parseInt(dueDay) || undefined,
      totalInstallments: parseInt(totalInstallments) || 1,
      currentInstallment: 1,
    });

    setName('');
    setValue('');
    setPeriodicity('monthly');
    setDueDay('');
    setTotalInstallments('1');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Despesa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: IPTU, Internet, Luz..."
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
              <SelectContent className="max-h-48">
                {/* Opções básicas de 1 a 10 */}
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} parcela{i + 1 !== 1 ? 's' : ''}
                  </SelectItem>
                ))}

                {/* Intervalos maiores */}
                {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} parcelas
                  </SelectItem>
                ))}

                {/* Final até 250 com intervalos maiores */}
                {[150, 180, 200, 220, 240, 250].map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} parcelas
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Máximo: 250 parcelas
            </p>
          </div>

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
