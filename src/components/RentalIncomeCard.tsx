import { RentalIncome } from '@/types/expense';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RentalIncomeCardProps {
  rentalIncome: RentalIncome;
  onChange: (rental: RentalIncome) => void;
}

export function RentalIncomeCard({ rentalIncome, onChange }: RentalIncomeCardProps) {
  const [showContractOptions, setShowContractOptions] = useState(false);

  return (
    <div className={cn(
      "rounded-xl p-6 shadow-card transition-all duration-300 animate-fade-in",
      rentalIncome.isActive ? "bg-income/5 border-2 border-income/30" : "bg-card"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "rounded-lg p-2.5 transition-colors",
            rentalIncome.isActive ? "bg-income/20" : "bg-secondary"
          )}>
            <Home className={cn(
              "h-5 w-5 transition-colors",
              rentalIncome.isActive ? "text-income" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h3 className="font-semibold">Receita de Aluguel</h3>
            <p className="text-sm text-muted-foreground">Configurar contrato e compensação automática</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="rental-active" className="text-sm text-muted-foreground">
            {rentalIncome.isActive ? 'Ativo' : 'Inativo'}
          </Label>
          <Switch
            id="rental-active"
            checked={rentalIncome.isActive}
            onCheckedChange={(checked) => onChange({ ...rentalIncome, isActive: checked })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <TrendingUp className={cn(
            "h-5 w-5",
            rentalIncome.isActive ? "text-income" : "text-muted-foreground"
          )} />
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
            <Input
              type="number"
              value={rentalIncome.value || ''}
              onChange={(e) => onChange({ ...rentalIncome, value: parseFloat(e.target.value) || 0 })}
              className={cn(
                "pl-10 text-lg font-semibold",
                rentalIncome.isActive && "border-income/30 focus-visible:ring-income"
              )}
              placeholder="0,00"
              disabled={!rentalIncome.isActive}
            />
          </div>
        </div>

        {rentalIncome.isActive && (
          <div className="space-y-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setShowContractOptions(!showContractOptions)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" />
              Opções do contrato
              <span className={`transform transition-transform ${showContractOptions ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>

            {showContractOptions && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="contract-duration" className="text-xs text-muted-foreground mb-1 block">
                      Duração do contrato
                    </Label>
                    <Select
                      value={rentalIncome.contractDuration?.toString() || 'indefinido'}
                      onValueChange={(value) => onChange({
                        ...rentalIncome,
                        contractDuration: value === 'indefinido' ? undefined : parseInt(value)
                      })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Selecionar duração" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indefinido">Indefinido</SelectItem>
                        <SelectItem value="6">6 meses</SelectItem>
                        <SelectItem value="12">12 meses</SelectItem>
                        <SelectItem value="24">24 meses</SelectItem>
                        <SelectItem value="36">36 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contract-start" className="text-xs text-muted-foreground mb-1 block">
                      Data de início
                    </Label>
                    <Input
                      id="contract-start"
                      type="month"
                      value={rentalIncome.contractStartDate || ''}
                      onChange={(e) => onChange({ ...rentalIncome, contractStartDate: e.target.value })}
                      className="h-8"
                    />
                  </div>
                </div>

                {rentalIncome.contractDuration && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                    O contrato expira em {rentalIncome.contractDuration} meses
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {rentalIncome.isActive && rentalIncome.value > 0 && (
        <p className="mt-3 text-sm text-income flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-income" />
          O valor será descontado proporcionalmente de cada proprietário
        </p>
      )}
    </div>
  );
}
