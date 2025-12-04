import { useState, useCallback, useEffect } from 'react';
import { Owner, Expense, RentalIncome, OwnerBalance, MonthlyData } from '@/types/expense';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const getMonthKey = (date: Date) => format(date, 'yyyy-MM');

const createDefaultMonthData = (): MonthlyData => ({
  expenses: [],
  rentalIncome: {
    id: `rental-${Date.now()}`,
    name: 'Receita de Aluguel',
    value: 0,
    isActive: false,
    contractDuration: undefined,
    contractStartDate: undefined,
    startDate: undefined
  },
});

const defaultOwners: Owner[] = [
  { id: '1', name: 'Proprietário 1', percentage: 33.33, imageUrl: undefined },
  { id: '2', name: 'Proprietário 2', percentage: 33.33, imageUrl: undefined },
  { id: '3', name: 'Proprietário 3', percentage: 33.34, imageUrl: undefined },
];

export function useExpenseStore() {
  const { user } = useAuth();
  const [owners, setOwners] = useState<Owner[]>(defaultOwners);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthlyData>>({});
  const [loading, setLoading] = useState(true);

  // Load owners from database
  const loadOwners = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .eq('user_id', user.id)
      .order('position');
    
    if (error) {
      console.error('Error loading owners:', error);
      return;
    }
    
    if (data && data.length > 0) {
      setOwners(data.map(o => ({
        id: o.id,
        name: o.name,
        percentage: Number(o.percentage),
        imageUrl: o.image_url || undefined
      })));
    } else {
      // Create default owners for new user
      const ownersToCreate = defaultOwners.map((o, index) => ({
        user_id: user.id,
        name: o.name,
        percentage: o.percentage,
        position: index
      }));
      
      const { data: newOwners, error: createError } = await supabase
        .from('owners')
        .insert(ownersToCreate)
        .select();
      
      if (createError) {
        console.error('Error creating owners:', createError);
      } else if (newOwners) {
        setOwners(newOwners.map(o => ({
          id: o.id,
          name: o.name,
          percentage: Number(o.percentage),
          imageUrl: o.image_url || undefined
        })));
      }
    }
  }, [user]);

  // Load transactions and rental income from database
  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);
    
    const { data: rentalData, error: rentalError } = await supabase
      .from('rental_income')
      .select('*')
      .eq('user_id', user.id);
    
    if (transError || rentalError) {
      console.error('Error loading data:', transError || rentalError);
      setLoading(false);
      return;
    }
    
    const newMonthlyData: Record<string, MonthlyData> = {};
    
    // Process transactions
    transactions?.forEach(t => {
      if (!newMonthlyData[t.month_key]) {
        newMonthlyData[t.month_key] = createDefaultMonthData();
      }
      newMonthlyData[t.month_key].expenses.push({
        id: t.id,
        name: t.name,
        value: Number(t.value),
        category: t.category as Expense['category'],
        periodicity: t.periodicity as Expense['periodicity'],
        type: t.type as 'expense' | 'income',
        dueDay: t.due_day || undefined,
        totalInstallments: t.total_installments || 1,
        currentInstallment: t.current_installment || 1,
        parentId: t.parent_id || undefined
      });
    });
    
    // Process rental income
    rentalData?.forEach(r => {
      if (!newMonthlyData[r.month_key]) {
        newMonthlyData[r.month_key] = createDefaultMonthData();
      }
      newMonthlyData[r.month_key].rentalIncome = {
        id: r.id,
        name: r.name || 'Receita de Aluguel',
        value: Number(r.value),
        isActive: r.is_active,
        contractDuration: r.contract_duration || undefined,
        contractStartDate: r.contract_start_date || undefined
      };
    });
    
    setMonthlyData(newMonthlyData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadOwners();
      loadData();
    }
  }, [user, loadOwners, loadData]);

  const getCurrentMonthData = useCallback((): MonthlyData => {
    const key = getMonthKey(currentMonth);
    return monthlyData[key] || createDefaultMonthData();
  }, [currentMonth, monthlyData]);

  const expenses = getCurrentMonthData().expenses;
  const rentalIncome = getCurrentMonthData().rentalIncome;

  const updateOwner = useCallback(async (id: string, updates: Partial<Owner>) => {
    if (!user) return;
    
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.percentage !== undefined) dbUpdates.percentage = updates.percentage;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    
    const { error } = await supabase
      .from('owners')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      toast.error('Erro ao atualizar proprietário');
      return;
    }
    
    setOwners(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, [user]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    
    const totalInstallments = expense.totalInstallments || 1;
    const parentId = Date.now().toString();
    
    const transactionsToInsert = [];
    
    for (let i = 0; i < totalInstallments; i++) {
      const installmentDate = new Date(currentMonth);
      installmentDate.setMonth(installmentDate.getMonth() + i);
      const monthKey = getMonthKey(installmentDate);
      
      transactionsToInsert.push({
        user_id: user.id,
        name: expense.name,
        value: expense.value,
        category: expense.category,
        periodicity: expense.periodicity,
        type: expense.type || 'expense',
        due_day: expense.dueDay,
        total_installments: totalInstallments,
        current_installment: i + 1,
        parent_id: totalInstallments > 1 ? parentId : null,
        month_key: monthKey
      });
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionsToInsert)
      .select();
    
    if (error) {
      toast.error('Erro ao adicionar lançamento');
      return;
    }
    
    // Update local state
    setMonthlyData(prev => {
      const newData = { ...prev };
      
      data?.forEach(t => {
        if (!newData[t.month_key]) {
          newData[t.month_key] = createDefaultMonthData();
        }
        newData[t.month_key].expenses.push({
          id: t.id,
          name: t.name,
          value: Number(t.value),
          category: t.category as Expense['category'],
          periodicity: t.periodicity as Expense['periodicity'],
          type: t.type as 'expense' | 'income',
          dueDay: t.due_day || undefined,
          totalInstallments: t.total_installments || 1,
          currentInstallment: t.current_installment || 1,
          parentId: t.parent_id || undefined
        });
      });
      
      return newData;
    });
    
    toast.success('Lançamento adicionado!');
  }, [user, currentMonth]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    if (!user) return;
    
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.value !== undefined) dbUpdates.value = updates.value;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.periodicity !== undefined) dbUpdates.periodicity = updates.periodicity;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    
    const { error } = await supabase
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      toast.error('Erro ao atualizar lançamento');
      return;
    }
    
    const key = getMonthKey(currentMonth);
    setMonthlyData(prev => ({
      ...prev,
      [key]: {
        ...prev[key] || createDefaultMonthData(),
        expenses: (prev[key]?.expenses || []).map(e => e.id === id ? { ...e, ...updates } : e),
      },
    }));
  }, [user, currentMonth]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      toast.error('Erro ao excluir lançamento');
      return;
    }
    
    const key = getMonthKey(currentMonth);
    setMonthlyData(prev => ({
      ...prev,
      [key]: {
        ...prev[key] || createDefaultMonthData(),
        expenses: (prev[key]?.expenses || []).filter(e => e.id !== id),
      },
    }));
    
    toast.success('Lançamento excluído!');
  }, [user, currentMonth]);

  const setRentalIncome = useCallback(async (income: RentalIncome) => {
    if (!user) return;
    
    const key = getMonthKey(currentMonth);
    
    const { data: existing } = await supabase
      .from('rental_income')
      .select('id')
      .eq('user_id', user.id)
      .eq('month_key', key)
      .maybeSingle();
    
    if (existing) {
      const { error } = await supabase
        .from('rental_income')
        .update({
          name: income.name,
          value: income.value,
          is_active: income.isActive,
          contract_duration: income.contractDuration,
          contract_start_date: income.contractStartDate
        })
        .eq('id', existing.id);
      
      if (error) {
        toast.error('Erro ao atualizar receita de aluguel');
        return;
      }
    } else {
      const { error } = await supabase
        .from('rental_income')
        .insert({
          user_id: user.id,
          month_key: key,
          name: income.name,
          value: income.value,
          is_active: income.isActive,
          contract_duration: income.contractDuration,
          contract_start_date: income.contractStartDate
        });
      
      if (error) {
        toast.error('Erro ao salvar receita de aluguel');
        return;
      }
    }
    
    setMonthlyData(prev => ({
      ...prev,
      [key]: {
        ...prev[key] || createDefaultMonthData(),
        rentalIncome: income,
      },
    }));
  }, [user, currentMonth]);

  const calculateTotalExpenses = useCallback(() => {
    return expenses.reduce((sum, exp) => sum + exp.value, 0);
  }, [expenses]);

  const calculateOwnerBalances = useCallback((): OwnerBalance[] => {
    const totalExpenses = calculateTotalExpenses();
    const effectiveRental = rentalIncome.isActive ? rentalIncome.value : 0;
    const netBalance = totalExpenses - effectiveRental;
    const balancePerOwner = netBalance / owners.length;

    return owners.map(owner => {
      const ownerExpenseShare = totalExpenses / owners.length;
      const rentalCredit = effectiveRental / owners.length;

      return {
        ownerId: owner.id,
        ownerName: owner.name,
        totalExpenses: ownerExpenseShare,
        rentalCredit,
        finalBalance: balancePerOwner,
        percentage: owner.percentage,
      };
    });
  }, [owners, expenses, rentalIncome, calculateTotalExpenses]);

  const calculateProjections = useCallback((year?: number) => {
    const projections = [];
    const targetYear = year || selectedYear;
    const startDate = new Date(targetYear, 0, 1);

    for (let i = 0; i < 12; i++) {
      const projectionDate = new Date(startDate);
      projectionDate.setMonth(i);
      const monthKey = getMonthKey(projectionDate);
      const monthData = monthlyData[monthKey] || createDefaultMonthData();

      let totalExpenses = 0;
      let totalRevenue = 0;

      monthData.expenses.forEach(expense => {
        let shouldInclude = true;
        if (expense.startDate) {
          const transactionStartDate = new Date(expense.startDate + '-01');
          if (projectionDate < transactionStartDate) {
            shouldInclude = false;
          }
        }

        if (shouldInclude) {
          if (expense.type === 'expense') {
            totalExpenses += expense.value;
          } else if (expense.type === 'income') {
            totalRevenue += expense.value;
          }
        }
      });

      const rentalIncomeData = monthData.rentalIncome;
      if (rentalIncomeData.isActive && rentalIncomeData.value > 0) {
        if (rentalIncomeData.contractDuration && rentalIncomeData.contractStartDate) {
          const contractStart = new Date(rentalIncomeData.contractStartDate + '-01');
          const contractEnd = new Date(contractStart);
          contractEnd.setMonth(contractStart.getMonth() + rentalIncomeData.contractDuration);

          if (projectionDate >= contractStart && projectionDate < contractEnd) {
            totalRevenue += rentalIncomeData.value;
          }
        } else if (rentalIncomeData.contractDuration === undefined) {
          totalRevenue += rentalIncomeData.value;
        }
      }

      projections.push({
        month: format(projectionDate, 'MMM'),
        expenses: totalExpenses,
        revenue: totalRevenue,
        date: projectionDate,
      });
    }

    return projections;
  }, [monthlyData, selectedYear]);

  return {
    owners,
    expenses,
    rentalIncome,
    currentMonth,
    setCurrentMonth,
    selectedYear,
    setSelectedYear,
    updateOwner,
    addExpense,
    updateExpense,
    deleteExpense,
    setRentalIncome,
    calculateTotalExpenses,
    calculateOwnerBalances,
    calculateProjections,
    loading,
  };
}
