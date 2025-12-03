import { useState, useCallback } from 'react';
import { Owner, Expense, RentalIncome, OwnerBalance, MonthlyData } from '@/types/expense';
import { format } from 'date-fns';

const defaultOwners: Owner[] = [
  { id: '1', name: 'Proprietário 1', percentage: 33.33, imageUrl: undefined },
  { id: '2', name: 'Proprietário 2', percentage: 33.33, imageUrl: undefined },
  { id: '3', name: 'Proprietário 3', percentage: 33.34, imageUrl: undefined },
];

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

export function useExpenseStore() {
  const [owners, setOwners] = useState<Owner[]>(defaultOwners);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthlyData>>(() => {
    const key = getMonthKey(new Date());
    return {
      [key]: {
        expenses: [],
        rentalIncome: { value: 0, isActive: false },
      },
    };
  });

  const getCurrentMonthData = useCallback((): MonthlyData => {
    const key = getMonthKey(currentMonth);
    return monthlyData[key] || createDefaultMonthData();
  }, [currentMonth, monthlyData]);

  const expenses = getCurrentMonthData().expenses;
  const rentalIncome = getCurrentMonthData().rentalIncome;

  const updateOwner = useCallback((id: string, updates: Partial<Owner>) => {
    setOwners(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const totalInstallments = expense.totalInstallments || 1;
    const parentId = Date.now().toString();
    
    setMonthlyData(prev => {
      const newMonthlyData = { ...prev };
      
      for (let i = 0; i < totalInstallments; i++) {
        // Calculate the month for this installment
        const installmentDate = new Date(currentMonth);
        installmentDate.setMonth(installmentDate.getMonth() + i);
        const key = getMonthKey(installmentDate);
        
        const newExpense: Expense = {
          ...expense,
          id: `${parentId}-${i}`,
          currentInstallment: i + 1,
          totalInstallments,
          parentId: totalInstallments > 1 ? parentId : undefined,
        };
        
        const existingData = newMonthlyData[key] || createDefaultMonthData();
        newMonthlyData[key] = {
          ...existingData,
          expenses: [...existingData.expenses, newExpense],
        };
      }
      
      return newMonthlyData;
    });
  }, [currentMonth]);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    const key = getMonthKey(currentMonth);
    setMonthlyData(prev => ({
      ...prev,
      [key]: {
        ...prev[key] || createDefaultMonthData(),
        expenses: (prev[key]?.expenses || []).map(e => e.id === id ? { ...e, ...updates } : e),
      },
    }));
  }, [currentMonth]);

  const deleteExpense = useCallback((id: string) => {
    const key = getMonthKey(currentMonth);
    setMonthlyData(prev => ({
      ...prev,
      [key]: {
        ...prev[key] || createDefaultMonthData(),
        expenses: (prev[key]?.expenses || []).filter(e => e.id !== id),
      },
    }));
  }, [currentMonth]);

  const setRentalIncome = useCallback((income: RentalIncome) => {
    const key = getMonthKey(currentMonth);
    setMonthlyData(prev => ({
      ...prev,
      [key]: {
        ...prev[key] || createDefaultMonthData(),
        rentalIncome: income,
      },
    }));
  }, [currentMonth]);

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
    const startDate = new Date(targetYear, 0, 1); // Janeiro do ano selecionado

    for (let i = 0; i < 12; i++) { // Sempre 12 meses: Janeiro a Dezembro
      const projectionDate = new Date(startDate);
      projectionDate.setMonth(i);
      const monthKey = getMonthKey(projectionDate);
      const monthData = monthlyData[monthKey] || createDefaultMonthData();

      // Calculate total expenses and revenues based on transaction types
      let totalExpenses = 0;
      let totalRevenue = 0;

      monthData.expenses.forEach(expense => {
        // Check if transaction should be included based on start date
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

      // Also include legacy rental income (if still configured)
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
        month: format(projectionDate, 'MMM'), // Só mês, sem ano
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
  };
}
