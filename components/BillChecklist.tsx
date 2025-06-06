import { useState, useEffect } from "react";

type Bill = {
  id: number;
  name: string;
  category: string;
  dueDate: string | null;
  amount: number | null;
  createdAt: string;
};

const CATEGORIES = [
  "Utilities", "Rent/Mortgage", "Insurance", "Subscriptions", 
  "Phone/Internet", "Credit Cards", "Loans", "Other"
];

const CATEGORY_ICONS = {
  "Utilities": "⚡",
  "Rent/Mortgage": "🏠",
  "Insurance": "🛡️",
  "Subscriptions": "📱",
  "Phone/Internet": "📡",
  "Credit Cards": "💳",
  "Loans": "🏦",
  "Other": "📋"
};

// Company domain mapping for logo API
const getCompanyDomain = (billName: string): string | null => {
  const name = billName.toLowerCase();
  
  // Telecom/Internet
  if (name.includes('verizon')) return 'verizon.com';
  if (name.includes('att') || name.includes('at&t')) return 'att.com';
  if (name.includes('tmobile') || name.includes('t-mobile')) return 't-mobile.com';
  if (name.includes('sprint')) return 'sprint.com';
  if (name.includes('xfinity')) return 'xfinity.com';
  if (name.includes('comcast')) return 'comcast.com';
  if (name.includes('spectrum')) return 'spectrum.com';
  if (name.includes('charter')) return 'charter.com';
  if (name.includes('cox')) return 'cox.com';
  if (name.includes('optimum')) return 'optimum.com';
  if (name.includes('altice')) return 'alticeusa.com';
  
  // Credit Cards & Banks
  if (name.includes('chase')) return 'chase.com';
  if (name.includes('discover')) return 'discover.com';
  if (name.includes('capital one') || name.includes('capitalone')) return 'capitalone.com';
  if (name.includes('american express') || name.includes('amex')) return 'americanexpress.com';
  if (name.includes('citi') || name.includes('citibank')) return 'citibank.com';
  if (name.includes('wells fargo') || name.includes('wellsfargo')) return 'wellsfargo.com';
  if (name.includes('bank of america') || name.includes('boa')) return 'bankofamerica.com';
  if (name.includes('usaa')) return 'usaa.com';
  if (name.includes('navy federal')) return 'navyfederal.org';
  
  // Utilities
  if (name.includes('pge') || name.includes('pacific gas')) return 'pge.com';
  if (name.includes('edison') || name.includes('sce')) return 'sce.com';
  if (name.includes('duke energy')) return 'duke-energy.com';
  if (name.includes('georgia power')) return 'georgiapower.com';
  if (name.includes('pepco')) return 'pepco.com';
  if (name.includes('sdge')) return 'sdge.com';
  if (name.includes('con ed') || name.includes('coned')) return 'coned.com';
  
  // Streaming/Subscriptions
  if (name.includes('netflix')) return 'netflix.com';
  if (name.includes('spotify')) return 'spotify.com';
  if (name.includes('apple') && (name.includes('music') || name.includes('tv') || name.includes('icloud'))) return 'apple.com';
  if (name.includes('amazon') && name.includes('prime')) return 'amazon.com';
  if (name.includes('disney') || name.includes('disney+')) return 'disney.com';
  if (name.includes('hulu')) return 'hulu.com';
  if (name.includes('hbo')) return 'hbo.com';
  if (name.includes('max') && (name.includes('streaming') || name.includes('tv'))) return 'max.com';
  if (name.includes('youtube')) return 'youtube.com';
  if (name.includes('twitch')) return 'twitch.tv';
  if (name.includes('paramount')) return 'paramount.com';
  if (name.includes('peacock')) return 'peacocktv.com';
  
  // Insurance
  if (name.includes('geico')) return 'geico.com';
  if (name.includes('state farm')) return 'statefarm.com';
  if (name.includes('allstate')) return 'allstate.com';
  if (name.includes('progressive')) return 'progressive.com';
  if (name.includes('farmers')) return 'farmers.com';
  if (name.includes('liberty mutual')) return 'libertymutual.com';
  
  // Additional popular companies
  if (name.includes('microsoft')) return 'microsoft.com';
  if (name.includes('google')) return 'google.com';
  if (name.includes('adobe')) return 'adobe.com';
  if (name.includes('dropbox')) return 'dropbox.com';
  if (name.includes('slack')) return 'slack.com';
  if (name.includes('zoom')) return 'zoom.us';
  if (name.includes('bestbuy') || name.includes('best buy')) return 'bestbuy.com';
  
  return null;
};

// Get company logo URL using Clearbit Logo API
const getCompanyLogoUrl = (billName: string): string | null => {
  const domain = getCompanyDomain(billName);
  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }
  return null;
};

// Fallback emoji for when logo fails to load
const getFallbackIcon = (billName: string, category: string): string => {
  const name = billName.toLowerCase();
  
  // Category-based fallbacks
  if (category === 'Phone/Internet' || name.includes('phone') || name.includes('internet')) return '📱';
  if (category === 'Credit Cards' || name.includes('credit') || name.includes('card')) return '💳';
  if (category === 'Utilities' || name.includes('electric') || name.includes('gas') || name.includes('water')) return '⚡';
  if (category === 'Insurance' || name.includes('insurance')) return '🛡️';
  if (category === 'Subscriptions' || name.includes('subscription') || name.includes('streaming')) return '📺';
  if (category === 'Rent/Mortgage' || name.includes('rent') || name.includes('mortgage')) return '🏠';
  if (category === 'Loans' || name.includes('loan')) return '🏦';
  
  return '📄';
};

export default function BillsChecklist() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [newBill, setNewBill] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [newDueDate, setNewDueDate] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Edit state
  const [editingBillId, setEditingBillId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editAmount, setEditAmount] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    const res = await fetch("/api/getbills");
    const data = await res.json();
    setBills(data);
    setLoading(false);
  };

  const handleMarkAsPaid = async (bill: Bill) => {
    const res = await fetch("/api/getbills", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: bill.id,
        markAsPaid: true,
      }),
    });

    if (res.ok) {
      fetchBills();
    } else {
      console.error("Failed to mark bill as paid");
    }
  };

  const handleAddBill = async () => {
    const trimmed = newBill.trim();
    if (!trimmed) return;
    
    await fetch("/api/getbills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: trimmed,
        category: newCategory,
        dueDate: newDueDate || null,
        amount: newAmount ? parseFloat(newAmount) : null
      }),
    });
    
    setNewBill("");
    setNewCategory("Other");
    setNewDueDate("");
    setNewAmount("");
    setShowAddForm(false);
    fetchBills();
  };

  const handleRemoveBill = async (id: number) => {
    await fetch("/api/getbills", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchBills();
  };

  const startEditing = (bill: Bill) => {
    setEditingBillId(bill.id);
    setEditName(bill.name);
    setEditCategory(bill.category);
    setEditDueDate(bill.dueDate ? bill.dueDate.split('T')[0] : "");
    setEditAmount(bill.amount ? bill.amount.toString() : "");
  };

  const cancelEditing = () => {
    setEditingBillId(null);
    setEditName("");
    setEditCategory("");
    setEditDueDate("");
    setEditAmount("");
  };

  const saveEdit = async (billId: number) => {
    const res = await fetch("/api/getbills", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: billId,
        name: editName.trim(),
        category: editCategory,
        dueDate: editDueDate || null,
        amount: editAmount ? parseFloat(editAmount) : null
      }),
    });

    if (res.ok) {
      cancelEditing();
      fetchBills();
    } else {
      console.error("Failed to update bill");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (bill: Bill) => {
    if (!bill.dueDate) return false;
    return new Date(bill.dueDate) < new Date();
  };

  // Calculate total due this month
  const getTotalDueThisMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return bills
      .filter(bill => {
        if (!bill.dueDate || !bill.amount) return false;
        const dueDate = new Date(bill.dueDate);
        return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
      })
      .reduce((total, bill) => total + (bill.amount || 0), 0);
  };

  // Count bills due this month
  const getBillsDueThisMonthCount = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return bills.filter(bill => {
      if (!bill.dueDate) return false;
      const dueDate = new Date(bill.dueDate);
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
    }).length;
  };

  // Calculate current balance (total unpaid bills for the month)
  const getCurrentBalance = () => {
    return getTotalDueThisMonth();
  };

  // Group bills by category and sort within each category
  const groupedBills = bills.reduce((groups, bill) => {
    const category = bill.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(bill);
    return groups;
  }, {} as Record<string, Bill[]>);

  // Sort bills within each category (overdue first, then by due date)
  Object.keys(groupedBills).forEach(category => {
    groupedBills[category].sort((a, b) => {
      if (isOverdue(a) && !isOverdue(b)) return -1;
      if (!isOverdue(a) && isOverdue(b)) return 1;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  const totalDueThisMonth = getTotalDueThisMonth();
  const billsDueThisMonthCount = getBillsDueThisMonthCount();
  const currentBalance = getCurrentBalance();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Financial Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Manage expenses and track payment schedules
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Outstanding This Month</div>
                <div className="text-2xl font-bold text-red-600">${currentBalance.toFixed(2)}</div>
              </div>
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="text-white font-semibold">MC</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Financial Overview */}
        {bills.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Due This Month</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    ${totalDueThisMonth.toFixed(2)}
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
                  <p className="text-sm font-medium text-slate-600">Bills Due</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {billsDueThisMonthCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Bills</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {bills.length}
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
                  <p className="text-sm font-medium text-slate-600">Overdue</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {bills.filter(isOverdue).length}
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
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Bill
              </button>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900">Add New Bill</h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewBill("");
                      setNewCategory("Other");
                      setNewDueDate("");
                      setNewAmount("");
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bill Name</label>
                    <input
                      type="text"
                      value={newBill}
                      onChange={(e) => setNewBill(e.target.value)}
                      placeholder="Electric Bill, Rent, etc."
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                      <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewBill("");
                      setNewCategory("Other");
                      setNewDueDate("");
                      setNewAmount("");
                    }}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBill}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Add Bill
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bills by Category */}
        {loading ? (
          <div className="text-center text-slate-500 py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-lg">Loading financial data...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No bills to track</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first bill above</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Bill Categories</h2>
              <div className="text-sm text-slate-600">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
              {CATEGORIES.filter(category => groupedBills[category]?.length > 0).map(category => (
                <div key={category} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
                        <h3 className="text-lg font-semibold text-slate-900">{category}</h3>
                      </div>
                      <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                        {groupedBills[category].length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-grow divide-y divide-slate-100">
                    {groupedBills[category].map((bill) => (
                      <div
                        key={bill.id}
                        className={`p-6 transition-all duration-200 ${
                          isOverdue(bill)
                            ? "bg-red-50 border-l-4 border-l-red-500"
                            : editingBillId === bill.id
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {editingBillId === bill.id ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                              placeholder="Bill name"
                            />
                            
                            <div className="space-y-3">
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                              >
                                {CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              
                              <input
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                              />
                              
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                placeholder="Amount ($)"
                                step="0.01"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                              />
                            </div>
                            
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={cancelEditing}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEdit(bill.id)}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                                      {getCompanyLogoUrl(bill.name) ? (
                                        <img
                                          src={getCompanyLogoUrl(bill.name)!}
                                          alt={`${bill.name} logo`}
                                          className="w-10 h-10 rounded object-contain"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLSpanElement;
                                            if (fallback) fallback.style.display = 'inline';
                                          }}
                                        />
                                      ) : null}
                                      <span 
                                        className="text-2xl"
                                        style={{ display: getCompanyLogoUrl(bill.name) ? 'none' : 'inline' }}
                                      >
                                        {getFallbackIcon(bill.name, bill.category)}
                                      </span>
                                    </div>
                                    <h4 className="text-base font-semibold text-slate-900 truncate">{bill.name}</h4>
                                  </div>
                                  {isOverdue(bill) && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex-shrink-0">
                                      Overdue
                                    </span>
                                  )}
                                </div>
                                
                                <div className="space-y-2 text-sm text-slate-600">
                                  {bill.dueDate && (
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span>Due {formatDate(bill.dueDate)}</span>
                                    </div>
                                  )}
                                  {bill.amount && (
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                      </svg>
                                      <span className="font-medium">${bill.amount.toFixed(2)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {bill.amount && (
                                <button
                                  onClick={() => handleMarkAsPaid(bill)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Mark Paid
                                </button>
                              )}
                              <button
                                onClick={() => startEditing(bill)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                                title="Edit bill"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemoveBill(bill.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                                title="Remove"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}