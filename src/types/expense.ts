export interface Owner {
  id: string;
  name: string;
  percentage: number;
  imageUrl?: string;
}

export interface Expense {
  id: string;
  name: string;
  value: number;
  category: 'financing_bank' | 'financing_builder' | 'condominium' | 'other';
  periodicity: 'monthly' | 'yearly' | 'one_time';
  dueDay?: number;
  startDate?: string;
  endDate?: string;
  ownerPercentages?: Record<string, number>;
  totalInstallments?: number;
  currentInstallment?: number;
  parentId?: string; // Links installments to the original expense
}

export interface RentalIncome {
  id?: string; // adicionar ID para identificação única
  name?: string; // nome do contrato/locatário
  value: number;
  isActive: boolean;
  contractDuration?: number; // em meses
  contractStartDate?: string; // data de início do contrato
  startDate?: string; // data quando começa a valer (igual ao das despesas)
}

export interface OwnerBalance {
  ownerId: string;
  ownerName: string;
  totalExpenses: number;
  rentalCredit: number;
  finalBalance: number;
  percentage: number;
}

export interface MonthlyData {
  expenses: Expense[];
  rentalIncome: RentalIncome;
}

export interface ProjectionData {
  month: string;
  expenses: number;
  revenue: number;
  date: Date;
}
