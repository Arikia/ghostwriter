"use client";

import React, { useMemo, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

// Define the props interface
interface WalletConnectionProviderProps {
  children: ReactNode;
}

export const WalletConnectionProvider: React.FC<
  WalletConnectionProviderProps
> = ({ children }) => {
  const endpoint = useMemo(() => "https://api.devnet.solana.com", []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
