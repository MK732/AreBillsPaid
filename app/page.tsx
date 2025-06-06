'use client';

import { useState } from "react";
import BillsChecklist from "@/components/BillChecklist";
import Analytics from "@/components/Analytics";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'bills' | 'analytics'>('bills');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      {/* Navigation */}
      <div className="pt-8 pb-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex space-x-1 bg-white/80 p-1 rounded-2xl backdrop-blur-md border border-gray-200 shadow-lg">
            <button
              onClick={() => setActiveTab('bills')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'bills'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span role="img" aria-label="bills">💸</span> Bills Checklist
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span role="img" aria-label="chart">📊</span> Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-8">
        {activeTab === 'bills' ? <BillsChecklist /> : <Analytics />}
      </div>
    </div>
  );
};