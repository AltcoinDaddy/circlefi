import algosdk from 'algosdk';

/**
 * Parameters for creating a new circle
 */
export interface CircleParams {
  name: string;
  contributionAmount: number; // In microAlgos
  frequencyInRounds: number;
  memberCap: number;
  sender: string;
}

/**
 * Status of a savings circle
 */
export interface CircleStatus {
  id: number;
  name: string;
  contributionAmount: number;
  frequencyInRounds: number;
  memberCap: number;
  currentMembers: number;
  currentRecipient: string;
  nextDistribution: number;
  emergencyFund: number;
  creator: string;
}

/**
 * Status of a circle member
 */
export interface MemberStatus {
  address: string;
  joinedRound: number;
  contributions: number;
  receivedPayout: number;
  reputation: number;
}

/**
 * Transaction response
 */
export interface AlgorandTransaction {
  txId: string;
  confirmedRound?: number;
}

/**
 * Wallet type
 */
export type WalletType = 'pera' | 'myalgo';

/**
 * Wallet connection state
 */
export interface WalletState {
  connected: boolean;
  address: string | null;
  type: WalletType | null;
  connecting: boolean;
  error: string | null;
}

/**
 * Circle creation form data
 */
export interface CircleFormData {
  name: string;
  contributionAmount: string;
  frequency: string;
  memberCap: string;
  description?: string;
}

/**
 * Circle member
 */
export interface CircleMember {
  address: string;
  reputation: number;
  contributions: number;
  receivedPayout: boolean;
  isCreator: boolean;
}

/**
 * Contribution history item
 */
export interface Contribution {
  txId: string;
  amount: number;
  timestamp: number;
  sender: string;
}

/**
 * Distribution history item
 */
export interface Distribution {
  txId: string;
  amount: number;
  timestamp: number;
  recipient: string;
}

/**
 * Circle with members and transactions
 */
export interface CircleDetails extends CircleStatus {
  members: CircleMember[];
  contributions: Contribution[];
  distributions: Distribution[];
  balance: number;
}
