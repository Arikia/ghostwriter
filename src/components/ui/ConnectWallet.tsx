"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"; // UI button for connecting wallets
import "@solana/wallet-adapter-react-ui/styles.css";

export const ConnectWallet: React.FC = () => {
  const { wallet, connect, disconnect, connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // This ensures that the component only renders after mounting on the client -> prevent hydration errors
  }, []);

  useEffect(() => {
    if (connected) {
      console.log("Connected to Phantom Wallet", publicKey?.toString());
    }
  }, [connected, publicKey]);

  if (!mounted) return null; // Prevent rendering on the server

  return (
    <div className="flex justify-end p-8">
      <WalletMultiButton className="wallet-adapter-button-trigger" />
    </div>
  );
};
