import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ProjectionData } from '@/types/expense';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProjectionChartProps {
  projections: ProjectionData[];
  onYearChange?: (year: number) => void;
}

const ProjectionChart = ({ projections, onYearChange }: ProjectionChartProps) => {
  const [selectedYear, setSelectedYearState] = useState<number>(new Date().getFullYear());

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr);
    setSelectedYearState(year);
    if (onYearChange) {
      onYearChange(year);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateNet = (expenses: number, revenue: number) => revenue - expenses;

  const chartData = projections.map(proj => ({
    ...proj,
    net: calculateNet(proj.expenses, proj.revenue),
  }));

  const chartConfig = {
    expenses: {
      label: 'Despesas',
      color: '#ef4444', // vermelho
    },
    revenue: {
      label: 'Receita do Aluguel',
      color: '#22c55e', // verde
    },
    net: {
      label: 'Saldo Líquido',
      color: '#3b82f6', // azul para o saldo
    },
  };

  // Calculate summary statistics
  const totalProjectedRevenue = projections.reduce((sum, proj) => sum + proj.revenue, 0);
  const totalProjectedExpenses = projections.reduce((sum, proj) => sum + proj.expenses, 0);
  const averageMonthlyNet = totalProjectedRevenue - totalProjectedExpenses;

  // Gerar opções de ano (do ano atual para 10 anos no futuro)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-200" />
            </div>
            <div>
              <CardTitle>Projeção de Despesas e Receitas</CardTitle>
              <CardDescription>
                Visão geral de 12 meses projetados - {selectedYear}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ano:</span>
            <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium text-muted-foreground">Receita Projetada (12 meses)</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalProjectedRevenue)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium text-muted-foreground">Despesas Projetadas (12 meses)</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalProjectedExpenses)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium text-muted-foreground">Saldo Médio Mensal</p>
            <p className={`text-2xl font-bold ${averageMonthlyNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(averageMonthlyNet / 12)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(value: any) => formatCurrency(value)} />}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={3}
              dot={false}
              name="Receita do Aluguel"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="var(--color-expenses)"
              strokeWidth={3}
              dot={false}
              name="Despesas"
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="var(--color-net)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Saldo Líquido"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ProjectionChart;
