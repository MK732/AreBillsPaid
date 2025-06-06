import { useState, useEffect } from "react";

type AnalyticsData = {
  summary: {
    totalBills: number;
    paidBills: number;
    unpaidBills: number;
    totalSpent: number;
    totalDue: number;
    billsPaidThisMonth: number;
    billsDueThisMonth: number;
    overdueBills: number;
  };
  spendingByCategory: Record<string, number>;
  monthlySpending: Array<{ month: string; amount: number }>;
  upcomingBills: Array<{
    id: number;
    name: string;
    category: string;
    dueDate: string;
    amount: number | null;
  }>;
  overdueBills: Array<{
    id: number;
    name: string;
    category: string;
    dueDate: string;
    amount: number | null;
  }>;
};

const CATEGORY_COLORS = {
  "Utilities": "bg-blue-600",
  "Rent/Mortgage": "bg-red-600",
  "Insurance": "bg-green-600",
  "Subscriptions": "bg-purple-600",
  "Phone/Internet": "bg-orange-600",
  "Credit Cards": "bg-pink-600",
  "Loans": "bg-yellow-600",
  "Other": "bg-slate-600"
};

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <h1 className="text-3xl font-bold text-slate-900">
              Financial Analytics
            </h1>
            <p className="text-slate-600 mt-1">
              Comprehensive spending insights and bill tracking
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="text-center text-slate-500 py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-lg">Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <h1 className="text-3xl font-bold text-slate-900">
              Financial Analytics
            </h1>
            <p className="text-slate-600 mt-1">
              Comprehensive spending insights and bill tracking
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="text-center text-red-600 py-20">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Failed to load analytics</h3>
            <p className="text-slate-600">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const maxCategorySpending = Math.max(...Object.values(data.spendingByCategory));
  const maxMonthlySpending = Math.max(...data.monthlySpending.map(m => m.amount));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Financial Analytics
              </h1>
              <p className="text-slate-600 mt-1">
                Comprehensive spending insights and bill tracking
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Total Tracked</div>
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(data.summary.totalSpent + data.summary.totalDue)}</div>
              </div>
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Bills</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {data.summary.totalBills}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Spent</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {formatCurrency(data.summary.totalSpent)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Due</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {formatCurrency(data.summary.totalDue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {data.summary.overdueBills}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending by Category */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Spending by Category</h2>
            </div>
            <div className="p-6">
              {Object.keys(data.spendingByCategory).length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-900 mb-1">No spending data</p>
                  <p className="text-sm">Start paying bills to see category breakdown</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(data.spendingByCategory)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, amount]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other
                            }`}></div>
                            <span className="text-slate-700 font-medium">{category}</span>
                          </div>
                          <span className="text-slate-900 font-semibold">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other
                            }`}
                            style={{ width: `${(amount / maxCategorySpending) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Spending Trend */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Monthly Spending Trend</h2>
            </div>
            <div className="p-6">
              {data.monthlySpending.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-900 mb-1">No monthly data</p>
                  <p className="text-sm">Spending trends will appear here over time</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.monthlySpending.map((month, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">{month.month}</span>
                        <span className="text-slate-900 font-semibold">{formatCurrency(month.amount)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-slate-900"
                          style={{ width: `${maxMonthlySpending > 0 ? (month.amount / maxMonthlySpending) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming and Overdue Bills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Bills */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Bills</h2>
            </div>
            <div className="p-6">
              {data.upcomingBills.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-900 mb-1">No upcoming bills</p>
                  <p className="text-sm">You're all caught up for now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.upcomingBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{bill.name}</div>
                        <div className="text-sm text-slate-600">{bill.category}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-blue-600 font-medium">
                          {new Date(bill.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        {bill.amount && (
                          <div className="text-sm font-semibold text-slate-900">
                            {formatCurrency(bill.amount)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Overdue Bills */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Overdue Bills</h2>
            </div>
            <div className="p-6">
              {data.overdueBills.length === 0 ? (
                <div className="text-center text-green-600 py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-900 mb-1">All caught up!</p>
                  <p className="text-sm text-slate-600">No overdue bills to worry about</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.overdueBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{bill.name}</div>
                        <div className="text-sm text-slate-600">{bill.category}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-red-600 font-medium">
                          Due: {new Date(bill.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        {bill.amount && (
                          <div className="text-sm font-semibold text-slate-900">
                            {formatCurrency(bill.amount)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 