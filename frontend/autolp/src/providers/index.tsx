"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppID) {
    console.error("Environment variable NEXT_PUBLIC_PRIVY_APP_ID is not set!");
    return (
      <div>
        Error: Privy App ID not configured. Please check your .env.local file.
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppID}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#3b82f6",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PrivyProvider>
  );
}
