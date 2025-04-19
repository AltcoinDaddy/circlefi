'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useWalletStore } from '@/store/wallet-store';
import { formatAddress } from '@/lib/algorand/utils';

export function WalletConnect() {
  const { 
    connected, 
    activeAccount, 
    fetching,
    error,
    connect, 
    disconnect
  } = useWalletStore();

  const handleConnect = async () => {
    try {
      await connect('pera');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleCopyAddress = () => {
    if (activeAccount) {
      navigator.clipboard.writeText(activeAccount.address);
    }
  };

  if (!connected || !activeAccount) {
    return (
      <Button
        onClick={handleConnect}
        disabled={fetching}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {fetching ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {formatAddress(activeAccount.address, 4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleCopyAddress}
          className="cursor-pointer"
        >
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}