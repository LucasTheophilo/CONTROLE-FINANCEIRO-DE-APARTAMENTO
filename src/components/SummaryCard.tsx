import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: 'default' | 'income' | 'expense' | 'primary';
  delay?: number;
}

export function SummaryCard({ title, value, icon: Icon, variant = 'default', delay = 0 }: SummaryCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl p-6 shadow-card transition-all duration-300 hover:shadow-card-hover animate-fade-in",
        variant === 'default' && "bg-card",
        variant === 'income' && "bg-card border-l-4 border-l-income",
        variant === 'expense' && "bg-card border-l-4 border-l-expense",
        variant === 'primary' && "gradient-primary text-primary-foreground"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === 'primary' ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-2xl font-bold tracking-tight",
            variant === 'primary' && "text-primary-foreground"
          )}>
            {value}
          </p>
        </div>
        <div className={cn(
          "rounded-lg p-3",
          variant === 'default' && "bg-secondary",
          variant === 'income' && "bg-income/10",
          variant === 'expense' && "bg-expense/10",
          variant === 'primary' && "bg-primary-foreground/20"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            variant === 'default' && "text-muted-foreground",
            variant === 'income' && "text-income",
            variant === 'expense' && "text-expense",
            variant === 'primary' && "text-primary-foreground"
          )} />
        </div>
      </div>
    </div>
  );
}
