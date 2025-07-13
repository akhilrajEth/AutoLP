import { usePrivy } from "@privy-io/react-auth";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

export default function WalletConnect() {
  const { login, logout, authenticated, user, ready } = usePrivy();

  if (!ready) {
    return (
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (authenticated && user) {
    return (
      <div className="relative group">
        <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
          <Wallet className="w-4 h-4 text-primary-600" />
          <span className="font-medium">
            {user.wallet?.address
              ? shortenAddress(user.wallet.address)
              : "Connected"}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
            {user.email?.address || "Wallet Connected"}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors rounded-lg"
          >
            <LogOut className="w-4 h-4 text-gray-500" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={login} className="btn-primary flex items-center gap-2">
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}
