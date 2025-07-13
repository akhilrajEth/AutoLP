"use client";

import { useState } from "react";
import Header from "../components/Header";
import PositionsList from "../components/PositionsList";
import DepositForm from "../components/DepositForm";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"positions" | "deposit">(
    "positions"
  );

  const handleTabChange = (tab: "positions" | "deposit") => {
    setActiveTab(tab);
    // Smooth scroll to top when switching tabs
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          <button
            onClick={() => handleTabChange("positions")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "positions"
                ? "bg-primary-100 text-primary-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Positions
          </button>
          <button
            onClick={() => handleTabChange("deposit")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "deposit"
                ? "bg-primary-100 text-primary-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Add Liquidity
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === "positions" && <PositionsList />}
          {activeTab === "deposit" && (
            <div className="max-w-2xl mx-auto">
              <DepositForm />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
