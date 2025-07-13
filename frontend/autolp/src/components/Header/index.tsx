import WalletConnect from "../WalletConnect";

interface HeaderProps {
  activeTab: "positions" | "deposit";
  onTabChange: (tab: "positions" | "deposit") => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AutoLP</h1>
              <p className="text-xs text-gray-500">Liquidity Pool Manager</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onTabChange("positions")}
              className={`text-sm font-medium transition-colors ${
                activeTab === "positions"
                  ? "text-primary-600"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Positions
            </button>
            <button
              onClick={() => onTabChange("deposit")}
              className={`text-sm font-medium transition-colors ${
                activeTab === "deposit"
                  ? "text-primary-600"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Add Liquidity
            </button>
          </nav>

          {/* Wallet Connect */}
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
