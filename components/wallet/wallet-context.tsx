"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletState, WalletType } from '@/lib/algorand/types';
import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

interface WalletContextProps {
  walletState: WalletState;
  connectWallet: (type: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  signTransactions: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>;
}

const initialWalletState: WalletState = {
  connected: false,
  address: null,
  type: null,
  connecting: false,
  error: null,
};

const WalletContext = createContext<WalletContextProps>({
  walletState: initialWalletState,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  signTransactions: async () => [],
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>(initialWalletState);
  const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null);
  
  // Initialize wallets
  useEffect(() => {
    // Initialize Pera Wallet
    const pera = new PeraWalletConnect();
    setPeraWallet(pera);
    
    // Check if we have a previously connected account
    const savedWalletType = localStorage.getItem('walletType');
    const savedWalletAddress = localStorage.getItem('walletAddress');
    
    if (savedWalletType && savedWalletAddress) {
      setWalletState({
        connected: true,
        address: savedWalletAddress,
        type: savedWalletType as WalletType,
        connecting: false,
        error: null,
      });
    }
    
    // Cleanup function
    return () => {
      if (pera) {
        pera.disconnect();
      }
    };
  }, []);
  
  // Connect to wallet
  const connectWallet = async (type: WalletType) => {
    setWalletState(prev => ({ ...prev, connecting: true, error: null }));
    
    try {
      if (type === 'pera') {
        if (!peraWallet) {
          throw new Error('Pera wallet not initialized');
        }
        
        const accounts = await peraWallet.connect();
        
        if (accounts && accounts.length > 0) {
          // Save to localStorage for persistence
          localStorage.setItem('walletType', 'pera');
          localStorage.setItem('walletAddress', accounts[0]);
          
          setWalletState({
            connected: true,
            address: accounts[0],
            type: 'pera',
            connecting: false,
            error: null,
          });
        } else {
          throw new Error('No accounts returned from wallet');
        }
      } else if (type === 'myalgo') {
        // For MyAlgo wallet, you'd implement similar logic
        // This would require importing the MyAlgo wallet SDK
        throw new Error('MyAlgo wallet not implemented yet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletState({
        connected: false,
        address: null,
        type: null,
        connecting: false,
        error: error instanceof Error ? error.message : 'Unknown error connecting wallet',
      });
    }
  };
  
  // Disconnect from wallet
  const disconnectWallet = () => {
    if (walletState.type === 'pera' && peraWallet) {
      peraWallet.disconnect();
    }
    
    // Clear local storage
    localStorage.removeItem('walletType');
    localStorage.removeItem('walletAddress');
    
    // Reset state
    setWalletState(initialWalletState);
  };
  
  // Sign transactions
  const signTransactions = async (txns: algosdk.Transaction[]): Promise<Uint8Array[]> => {
    if (!walletState.connected || !walletState.address) {
      throw new Error('Wallet not connected');
    }
    
    // Encode transactions to make them compatible with Pera Wallet
    const encodedTxns = txns.map(txn => algosdk.encodeUnsignedTransaction(txn));
    
    if (walletState.type === 'pera' && peraWallet) {
      try {
        // For Pera wallet, we need to create an array of SignerTransaction objects
        const signerTransactions = encodedTxns.map((txn, idx) => ({
          txn: txns[idx],
          signers: [walletState.address as string],
        }));
        
        // Sign the transactions
        const signedTxns = await peraWallet.signTransaction([signerTransactions]);
        return signedTxns;
      } catch (error) {
        console.error('Error signing transaction:', error);
        throw new Error('Failed to sign transactions with Pera wallet');
      }
    } else if (walletState.type === 'myalgo') {
      // MyAlgo wallet signing implementation would go here
      throw new Error('MyAlgo wallet not implemented yet');
    }
    
    throw new Error(`Unsupported wallet type: ${walletState.type}`);
  };
  
  return (
    <WalletContext.Provider
      value={{
        walletState,
        connectWallet,
        disconnectWallet,
        signTransactions,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};