import React from "react";
import { ConnectWallet } from "@/components/ui/ConnectWallet";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-800 p-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        {/* <div className="text-white text-lg font-bold">CTRL+x</div> */}
        <div className="text-white text-lg font-bold">
          <img src="/ctrlxicon.png" alt="CTRL+x Icon" className="h-8 w-8" />
        </div>
        <div className="space-x-4 flex items-center">
          <a href="/" className="text-gray-300 hover:text-white">
            Home
          </a>
          <a href="/import" className="text-gray-300 hover:text-white">
            Import
          </a>
          <a href="/briefcase" className="text-gray-300 hover:text-white">
            Briefcase
          </a>
          <a href="/reader" className="text-gray-300 hover:text-white">
            Reader
          </a>
          <a href="/about" className="text-gray-300 hover:text-white">
            About
          </a>

          <ConnectWallet />
        </div>
      </div>
    </nav>
  );
}
