import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { calculateDashboardStats, formatCurrency } from '../utils/calculations';
import { TrendingUp, DollarSign, FileText, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const { invoices, stats } = state;

  useEffect(() => {
    const newStats = calculateDashboardStats(invoices);
    dispatch({ type: 'SET_STATS', payload: newStats });
  }, [invoices, dispatch]);

  const statCards = [
    {
      name: 'Total Revenue',
      value: formatCurrency(stats.total_revenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Pending Amount',
      value: formatCurrency(stats.pending_amount),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Paid Invoices',
      value: stats.paid_invoices.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Pending Invoices',
      value: stats.pending_invoices.toString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of your business performance and key metrics.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`rounded-md p-3 ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthly_revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {stats.top_products.length > 0 ? (
              stats.top_products.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800">{index + 1}</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.quantity} sold</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No product data available yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Invoices</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {invoices.slice(0, 5).map((invoice) => (
            <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.invoice_number}</p>
                  <p className="text-sm text-gray-500">{invoice.client_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.total)}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : invoice.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-gray-500">No invoices yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;