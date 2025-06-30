export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  created_at: string;
}

export interface Settings {
  supabase_url?: string;
  supabase_key?: string;
  elevenlabs_key?: string;
  tax_rate: number;
  business_name: string;
  business_email: string;
  business_address?: string;
}

export interface DashboardStats {
  total_revenue: number;
  pending_amount: number;
  paid_invoices: number;
  pending_invoices: number;
  top_products: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  monthly_revenue: Array<{
    month: string;
    revenue: number;
  }>;
}