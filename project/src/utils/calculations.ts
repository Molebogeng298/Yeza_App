import { Invoice, InvoiceItem, DashboardStats } from '../types';

export const calculateInvoiceTotal = (
  items: InvoiceItem[],
  taxRate: number
): { subtotal: number; taxAmount: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

export const generateInvoiceNumber = (existingInvoices: Invoice[]): string => {
  const year = new Date().getFullYear();
  const existingNumbers = existingInvoices
    .map(inv => inv.invoice_number)
    .filter(num => num.startsWith(`INV-${year}`))
    .map(num => parseInt(num.split('-')[2]) || 0);

  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `INV-${year}-${nextNumber.toString().padStart(4, '0')}`;
};

export const calculateDashboardStats = (invoices: Invoice[]): DashboardStats => {
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Calculate top products
  const productStats = new Map<string, { revenue: number; quantity: number }>();
  
  paidInvoices.forEach(invoice => {
    invoice.items.forEach(item => {
      const existing = productStats.get(item.product_name) || { revenue: 0, quantity: 0 };
      productStats.set(item.product_name, {
        revenue: existing.revenue + item.total,
        quantity: existing.quantity + item.quantity,
      });
    });
  });

  const topProducts = Array.from(productStats.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Calculate monthly revenue for the last 6 months
  const monthlyRevenue = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const monthRevenue = paidInvoices
      .filter(inv => {
        const invDate = new Date(inv.issue_date);
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    monthlyRevenue.push({ month: monthName, revenue: monthRevenue });
  }

  return {
    total_revenue: Math.round(totalRevenue * 100) / 100,
    pending_amount: Math.round(pendingAmount * 100) / 100,
    paid_invoices: paidInvoices.length,
    pending_invoices: pendingInvoices.length,
    top_products: topProducts,
    monthly_revenue: monthlyRevenue,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};