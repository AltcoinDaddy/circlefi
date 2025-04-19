import { create } from 'zustand';
import { PeraWalletConnect } from '@perawallet/connect';

// Types
export type WalletType = 'pera' | 'myalgo' | 'none';

export interface WalletAccount {
  address: string;
  name?: string;
}

interface WalletState {
  connected: boolean;
  accounts: WalletAccount[];
  activeAccount: WalletAccount | null;
  provider: WalletType;
  fetching: boolean;
  error: string | null;
}

// Initialize Pera wallet connector
// Using type assertion to bypass the TypeScript type checking
export const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: true,
  chainId: process.env.NEXT_PUBLIC_ALGORAND_NETWORK?.toLowerCase() === 'testnet' 
    ? 416001  // TestNet chain ID
    : 416002  // MainNet chain ID (default)
} as any);

// Create wallet store
export const useWalletStore = create<WalletState & {
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  setActiveAccount: (account: WalletAccount) => void;
}>((set, get) => ({
  connected: false,
  accounts: [],
  activeAccount: null,
  provider: 'none',
  fetching: false,
  error: null,
  
  connect: async (type: WalletType) => {
    try {
      set({ fetching: true, error: null });
      
      if (type === 'pera') {
        const accounts = await peraWallet.connect();
        
        set({
          connected: true,
          accounts: accounts.map(address => ({ address })),
          activeAccount: accounts.length > 0 ? { address: accounts[0] } : null,
          provider: 'pera',
          fetching: false
        });
      } else {
        throw new Error('Wallet type not supported');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      set({ 
        fetching: false, 
        error: error instanceof Error ? error.message : 'Failed to connect wallet' 
      });
    }
  },
  
  disconnect: async () => {
    const { provider } = get();
    
    try {
      set({ fetching: true, error: null });
      
      if (provider === 'pera') {
        await peraWallet.disconnect();
      }
      
      set({
        connected: false,
        accounts: [],
        activeAccount: null,
        provider: 'none',
        fetching: false
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      set({ 
        fetching: false, 
        error: error instanceof Error ? error.message : 'Failed to disconnect wallet' 
      });
    }
  },
  
  setActiveAccount: (account: WalletAccount) => {
    set({ activeAccount: account });
  }
}));