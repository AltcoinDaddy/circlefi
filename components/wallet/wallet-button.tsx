"use client";

import React, { useState } from 'react';
import { useWallet } from './wallet-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Wallet, LogOut } from 'lucide-react';

export const WalletButton: React.FC = () => {
  const { walletState, connectWallet, disconnectWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  console.log('Wallet is Connecting', walletState)
  
  // Format address for display (e.g., "ABC...XYZ")
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };
  
  // If wallet is connecting, show loading state
  if (walletState.connecting) {
    return (
      <Button disabled variant="outline" className="w-[180px]">
        <span className="animate-pulse">Connecting...</span>
      </Button>
    );
  }
  
  // If wallet is connected, show address and disconnect option
  if (walletState.connected && walletState.address) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-between">
            <span>{formatAddress(walletState.address)}</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer flex items-center"
            onClick={() => {
              navigator.clipboard.writeText(walletState.address || '');
              setIsOpen(false);
            }}
          >
            <span>Copy Address</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-500 flex items-center"
            onClick={() => {
              disconnectWallet();
              setIsOpen(false);
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  // If wallet is not connected, show connect options
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-between">
          <span className="flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            connectWallet('pera');
            setIsOpen(false);
          }}
        >
          Pera Wallet
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            connectWallet('myalgo');
            setIsOpen(false);
          }}
        >
          MyAlgo Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};