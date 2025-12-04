-- Table for transactions (expenses and income)
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'other',
  periodicity TEXT NOT NULL DEFAULT 'monthly',
  type TEXT NOT NULL DEFAULT 'expense',
  due_day INTEGER,
  total_installments INTEGER DEFAULT 1,
  current_installment INTEGER DEFAULT 1,
  parent_id TEXT,
  month_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for rental income per month
CREATE TABLE public.rental_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Receita de Aluguel',
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false,
  contract_duration INTEGER,
  contract_start_date TEXT,
  month_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key)
);

-- Table for owners
CREATE TABLE public.owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 33.33,
  image_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- RLS policies for transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for rental_income
CREATE POLICY "Users can view their own rental income"
ON public.rental_income FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rental income"
ON public.rental_income FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rental income"
ON public.rental_income FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rental income"
ON public.rental_income FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for owners
CREATE POLICY "Users can view their own owners"
ON public.owners FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own owners"
ON public.owners FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own owners"
ON public.owners FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own owners"
ON public.owners FOR DELETE
USING (auth.uid() = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rental_income_updated_at
BEFORE UPDATE ON public.rental_income
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_owners_updated_at
BEFORE UPDATE ON public.owners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_transactions_user_month ON public.transactions(user_id, month_key);
CREATE INDEX idx_rental_income_user_month ON public.rental_income(user_id, month_key);
CREATE INDEX idx_owners_user ON public.owners(user_id);