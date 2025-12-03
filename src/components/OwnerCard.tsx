import { Owner, OwnerBalance } from '@/types/expense';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, TrendingDown, TrendingUp, Camera } from 'lucide-react';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OwnerCardProps {
  owner: Owner;
  balance: OwnerBalance;
  onUpdate: (id: string, updates: Partial<Owner>) => void;
  delay?: number;
}

export function OwnerCard({ owner, balance, onUpdate, delay = 0 }: OwnerCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(owner.id, { imageUrl: reader.result as string });
        setIsDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div
      className="bg-card rounded-xl p-5 shadow-card transition-all duration-300 hover:shadow-card-hover animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={owner.imageUrl} alt={owner.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </Dialog>

        <Input
          value={owner.name}
          onChange={(e) => onUpdate(owner.id, { name: e.target.value })}
          className="font-semibold text-lg border-none bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Nome do proprietário"
        />
      </div>

      <div className="space-y-3">
        <div className="h-px bg-border" />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5 text-expense" />
            Total despesas
          </span>
          <span className="font-medium text-expense">{formatCurrency(balance.totalExpenses)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-income" />
            Crédito aluguel
          </span>
          <span className="font-medium text-income">- {formatCurrency(balance.rentalCredit)}</span>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between">
          <span className="font-medium">Saldo a pagar</span>
          <span className={cn(
            "text-lg font-bold",
            balance.finalBalance > 0 ? "text-expense" : "text-income"
          )}>
            {formatCurrency(balance.finalBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}
