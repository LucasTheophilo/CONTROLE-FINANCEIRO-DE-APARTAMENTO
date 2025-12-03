import { useExpenseStore } from '@/hooks/useExpenseStore';
import { SummaryCard } from '@/components/SummaryCard';
import { OwnerCard } from '@/components/OwnerCard';
import { ExpenseItem } from '@/components/ExpenseItem';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { RentalIncomeItem } from '@/components/RentalIncomeItem';
import { MonthSelector } from '@/components/MonthSelector';
import ProjectionChart from '@/components/ProjectionChart';
import ThemeToggle from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Wallet, TrendingDown, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';

const Index = () => {
  const {
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
  } = useExpenseStore();

  const totalExpenses = calculateTotalExpenses();
  const ownerBalances = calculateOwnerBalances();
  const netBalance = (rentalIncome.isActive ? rentalIncome.value : 0) - totalExpenses;

  const projections = useMemo(() => calculateProjections(selectedYear), [calculateProjections, selectedYear]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl gradient-primary p-2.5 shadow-glow">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Controle de Despesas</h1>
                <p className="text-sm text-muted-foreground">Gerenciamento do apartamento</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="projections" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Projeções
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Month Selector */}
            <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
            {/* Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard
                title="Total de Despesas"
                value={formatCurrency(totalExpenses)}
                icon={TrendingDown}
                variant="expense"
                delay={0}
              />
              <SummaryCard
                title="Receita de Aluguel"
                value={formatCurrency(rentalIncome.isActive ? rentalIncome.value : 0)}
                icon={Wallet}
                variant="income"
                delay={100}
              />
              <SummaryCard
                title="Saldo Líquido"
                value={formatCurrency(netBalance)}
                icon={Building2}
                variant="primary"
                delay={200}
              />
            </section>

            {/* Rental Income */}
            <section>
              <RentalIncomeItem
                rentalIncome={rentalIncome}
                onUpdate={setRentalIncome}
              />
            </section>

            {/* Owner Balances */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Rateio por Proprietário</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {owners.map((owner, index) => {
                  const balance = ownerBalances.find(b => b.ownerId === owner.id)!;
                  return (
                    <OwnerCard
                      key={owner.id}
                      owner={owner}
                      balance={balance}
                      onUpdate={updateOwner}
                      delay={index * 100}
                    />
                  );
                })}
              </div>
            </section>

            {/* Expenses List */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Lançamentos</h2>
                <AddExpenseDialog onAdd={addExpense} />
              </div>
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    onUpdate={updateExpense}
                    onDelete={deleteExpense}
                  />
                ))}
              </div>

              {expenses.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground">Nenhuma despesa cadastrada</p>
                  <p className="text-sm text-muted-foreground mt-1">Clique em "Nova Despesa" para adicionar</p>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="projections" className="space-y-6">
            {/* Projection Chart */}
            <ProjectionChart projections={projections} onYearChange={setSelectedYear} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
