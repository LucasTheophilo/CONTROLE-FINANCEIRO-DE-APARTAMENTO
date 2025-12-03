import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthSelectorProps {
  currentMonth: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ currentMonth, onChange }: MonthSelectorProps) {
  const handlePrevMonth = () => {
    onChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onChange(addMonths(currentMonth, 1));
  };

  const handleCurrentMonth = () => {
    onChange(new Date());
  };

  const isCurrentMonth = format(currentMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border/50">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevMonth}
        className="hover:bg-secondary"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-primary" />
        <span className="text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </span>
        {!isCurrentMonth && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCurrentMonth}
            className="text-xs"
          >
            Mês atual
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextMonth}
        className="hover:bg-secondary"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
