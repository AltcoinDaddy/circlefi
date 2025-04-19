// src/store/circleStore.ts
import { create } from 'zustand';
import { getAlgodClient, getIndexerClient } from '@/lib/algorand/client';
import { microalgosToAlgos } from '@/lib/algorand/utils';
import algosdk from 'algosdk';

// Types
export interface Circle {
  id: number;
  name: string;
  contributionAmount: number; // in algos
  frequency: number; // in rounds
  memberCap: number;
  currentMembers: number;
  currentRecipient: string;
  nextDistribution: number; // round number
  emergencyFund: number; // in algos
  creator: string;
  description?: string
  category?: string
}

export interface CircleState {
  circles: Circle[];
  loading: boolean;
  error: string | null;
}

// App ID from environment
const APP_ID = parseInt(process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '0');

// Helper to decode Algorand state values
const decodeState = (stateArray: any[]) => {
  const state: Record<string, any> = {};
  
  for (const item of stateArray) {
    const key = Buffer.from(item.key, 'base64').toString();
    let value;
    
    if (item.value.type === 1) {
      // Bytes value
      value = Buffer.from(item.value.bytes, 'base64').toString();
    } else {
      // UInt value
      value = item.value.uint;
    }
    
    state[key] = value;
  }
  
  return state;
};

// Create circle store
export const useCircleStore = create<CircleState & {
  fetchCircles: (address: string) => Promise<void>;
  fetchCircleById: (id: number) => Promise<Circle | null>;
}>((set, get) => ({
  circles: [],
  loading: false,
  error: null,
  
  fetchCircles: async (address: string) => {
    try {
      set({ loading: true, error: null });
      
      // Get application info
      const client = getAlgodClient();
      const appInfo = await client.getApplicationByID(APP_ID).do();
      
      // Parse global state
      const appParams = appInfo.params as any;
      const globalState = decodeState(appParams['global-state'] || []);
      
      // Also get account info to check local state
      const accountInfo = await client.accountInformation(address).do();
      
      // Find the local state for our app
      const appLocalState = (accountInfo.appsLocalState || [])
      .find((app: any) => app.id === APP_ID);
            
      // Convert the data to our Circle interface
      const circle: Circle = {
        id: APP_ID,
        name: globalState['CircleName'] || 'CircleFi Savings',
        contributionAmount: microalgosToAlgos(parseInt(globalState['ContributionAmount'] || '0')),
        frequency: parseInt(globalState['FrequencyInRounds'] || '0'),
        memberCap: parseInt(globalState['MemberCap'] || '0'),
        currentMembers: parseInt(globalState['CurrentMembers'] || '0'),
        currentRecipient: globalState['CurrentRecipient'] || address,
        nextDistribution: parseInt(globalState['NextDistribution'] || '0'),
        emergencyFund: microalgosToAlgos(parseInt(globalState['EmergencyFund'] || '0')),
        creator: globalState['Creator'] || address
      };
      
      set({
        circles: [circle],
        loading: false
      });
    } catch (error) {
      console.error('Error fetching circles:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch circles' 
      });
    }
  },
  
  fetchCircleById: async (id: number) => {
    try {
      set({ loading: true, error: null });
      
      // Get application info
      const client = getAlgodClient();
      const appInfo = await client.getApplicationByID(id).do();
      
      const appParams = appInfo.params as any;
      const globalState = decodeState(appParams['global-state'] || []);
      
      // Convert the data to our Circle interface
      const circle: Circle = {
        id: id,
        name: globalState['CircleName'] || 'CircleFi Savings',
        contributionAmount: microalgosToAlgos(parseInt(globalState['ContributionAmount'] || '0')),
        frequency: parseInt(globalState['FrequencyInRounds'] || '0'),
        memberCap: parseInt(globalState['MemberCap'] || '0'),
        currentMembers: parseInt(globalState['CurrentMembers'] || '0'),
        currentRecipient: globalState['CurrentRecipient'] || '',
        nextDistribution: parseInt(globalState['NextDistribution'] || '0'),
        emergencyFund: microalgosToAlgos(parseInt(globalState['EmergencyFund'] || '0')),
        creator: globalState['Creator'] || ''
      };
      
      set({ loading: false });
      return circle;
    } catch (error) {
      console.error('Error fetching circle:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch circle' 
      });
      return null;
    }
  }
}));