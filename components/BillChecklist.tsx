import { useState, useEffect } from "react";

type Bill = {
  id: number;
  name: string;
  paidAt: string | null;
};

export default function BillsChecklist() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [newBill, setNewBill] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleCheck = async (bill: Bill) => {
  // Optimistically update local state
  setBills((prevBills) =>
    prevBills.map((b) =>
      b.id === bill.id
        ? { ...b, paidAt: b.paidAt ? null : new Date().toISOString() }
        : b
    )
  );

  // Send PATCH request in background
  const res = await fetch("/api/getbills", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: bill.id,
      paid: !bill.paidAt,
    }),
  });

  // If server returns error, re-fetch to sync
  if (!res.ok) {
    fetchBills();
  }
};

  const handleAddBill = async () => {
    const trimmed = newBill.trim();
    if (!trimmed) return;
    await fetch("/api/getbills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    setNewBill("");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto p-8 bg-white/90 rounded-3xl shadow-2xl backdrop-blur-md border border-gray-200">
   <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-800  drop-shadow-lg">
  <span role="img" aria-label="bills">💸</span> Bills Checklist
</h1> 

        <div className="flex mb-6">
          <input
            type="text"
            value={newBill}
            onChange={(e) => setNewBill(e.target.value)}
            placeholder="Add new bill"
            className="flex-1 border border-gray-300 rounded-l-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-700 transition"
            onKeyDown={e => { if (e.key === "Enter") handleAddBill(); }}
          />
          <button
            onClick={handleAddBill}
            className="hover:cursor-pointer bg-gradient-to-r from-blue-500 to-pink-500 text-white px-6 py-3 rounded-r-xl font-semibold shadow hover:scale-105 hover:from-blue-600 hover:to-pink-600 transition-all duration-150"
          >
            <span role="img" aria-label="add" >➕</span> Add
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500 py-8 animate-pulse">Loading...</div>
        ) : bills.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No bills yet. Add your first bill!</div>
        ) : (
          <ul className="space-y-4">
            {bills.map((bill) => (
              <li
                key={bill.id}
                className={`flex items-center justify-between p-4 rounded-2xl shadow-sm border transition-all duration-150 ${
                  bill.paidAt
                    ? "bg-gradient-to-r from-green-100 to-green-50 border-green-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={!!bill.paidAt}
                    onChange={() => handleCheck(bill)}
                    className="form-checkbox h-6 w-6 text-blue-600 transition-all duration-150"
                  />
                  <span className={`text-lg font-medium transition-all duration-150 ${
                    bill.paidAt
                      ? "line-through text-gray-400 group-hover:text-green-700"
                      : "text-gray-700 group-hover:text-blue-700"
                  }`}>
                    {bill.name}
                  </span>
                </label>
                <div className="flex items-center space-x-3">
                  {bill.paidAt && (
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg shadow-inner">
                      <span role="img" aria-label="paid">✅</span> {new Date(bill.paidAt).toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveBill(bill.id)}
                    className="ml-2 text-red-400 hover:text-red-600 text-lg rounded-full p-1 transition-all duration-150 hover:bg-red-50"
                    title="Remove"
                  >
                    <span role="img" aria-label="remove" className="hover:cursor-pointer">🗑️</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}