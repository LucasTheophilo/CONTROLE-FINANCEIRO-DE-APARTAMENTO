import { RentalIncome } from '@/types/expense';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Home, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RentalIncomeItemProps {
  rentalIncome: RentalIncome;
  onUpdate: (rental: RentalIncome) => void;
}

export function RentalIncomeItem({ rentalIncome, onUpdate }: RentalIncomeItemProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleStartDateChange = (date: string) => {
    onUpdate({
      ...rentalIncome,
      startDate: date
    });
  };

  const handleContractStartChange = (date: string) => {
    onUpdate({
      ...rentalIncome,
      contractStartDate: date
    });
  };

  const handleContractDurationChange = (duration: string) => {
    onUpdate({
      ...rentalIncome,
      contractDuration: duration === 'indefinido' ? undefined : parseInt(duration)
    });
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:shadow-sm">
      {/* Header com ícone e nome */}
      <div className="flex items-center gap-4">
        <div className="rounded-lg p-2.5 bg-income/20">
          <Home className="h-5 w-5 text-income" />
        </div>

        <div className="flex-1 min-w-0">
          <Input
            value={rentalIncome.name || 'Receita de Aluguel'}
            onChange={(e) => onUpdate({ ...rentalIncome, name: e.target.value })}
            className="font-medium border-none bg-transparent p-0 h-auto focus-visible:ring-0"
            placeholder="Nome do contrato/locatário"
          />
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>Receita mensal de aluguel</span>
            {rentalIncome.contractDuration && (
              <>
                <span>•</span>
                <span>Contrato de {rentalIncome.contractDuration} meses</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Campos de edição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valor */}
        <div className="space-y-2">
          <Label htmlFor="rental-value" className="text-xs text-muted-foreground">Valor (R$)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
            <Input
              id="rental-value"
              type="number"
              value={rentalIncome.value || ''}
              onChange={(e) => onUpdate({ ...rentalIncome, value: parseFloat(e.target.value) || 0 })}
              className="pl-10 font-semibold"
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Data de início */}
        <div className="space-y-2">
          <Label htmlFor="rental-start" className="text-xs text-muted-foreground">Quando começa a valer</Label>
          <Input
            id="rental-start"
            type="month"
            value={rentalIncome.startDate || ''}
            onChange={(e) => handleStartDateChange(e.target.value)}
            placeholder="Mês/Ano"
          />
        </div>

        {/* Duração do contrato */}
        <div className="space-y-2">
          <Label htmlFor="contract-duration" className="text-xs text-muted-foreground">Duração do contrato</Label>
          <Select
            value={rentalIncome.contractDuration?.toString() || 'indefinido'}
            onValueChange={handleContractDurationChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar duração" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indefinido">Indefinido</SelectItem>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
              <SelectItem value="24">24 meses</SelectItem>
              <SelectItem value="36">36 meses</SelectItem>
              <SelectItem value="48">48 meses</SelectItem>
              <SelectItem value="60">60 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data início do contrato */}
        <div className="space-y-2">
          <Label htmlFor="contract-start" className="text-xs text-muted-foreground">Data início do contrato</Label>
          <Input
            id="contract-start"
            type="month"
            value={rentalIncome.contractStartDate || ''}
            onChange={(e) => handleContractStartChange(e.target.value)}
            placeholder="Mês/Ano"
          />
        </div>
      </div>

      {/* Status e informações */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-income" />
          <span className={cn(
            "font-medium",
            rentalIncome.isActive ? "text-income" : "text-muted-foreground"
          )}>
            {rentalIncome.isActive ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <Button
          variant={rentalIncome.isActive ? "destructive" : "default"}
          size="sm"
          onClick={() => onUpdate({ ...rentalIncome, isActive: !rentalIncome.isActive })}
        >
          {rentalIncome.isActive ? 'Desativar' : 'Ativar'}
        </Button>
      </div>
    </div>
  );
}
