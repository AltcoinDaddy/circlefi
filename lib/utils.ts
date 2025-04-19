// Algorand utility functions

// Constants
export const MICROALGOS_TO_ALGOS_RATIO = 1000000;

// Convert microalgos to algos for display
export const microalgosToAlgos = (microalgos: number): number => {
  return microalgos / MICROALGOS_TO_ALGOS_RATIO;
};

// Convert algos to microalgos for transactions
export const algosToMicroalgos = (algos: number): number => {
  return Math.floor(algos * MICROALGOS_TO_ALGOS_RATIO);
};

// Format an Algorand address for display
export const formatAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

// Convert rounds to approximate time
export const roundsToTime = (rounds: number): Date => {
  // Algorand produces blocks roughly every 4.5 seconds
  const secondsPerRound = 4.5;
  const currentRound = 0; // You'd need to fetch this from the network
  const secondsUntilTarget = (rounds - currentRound) * secondsPerRound;
  
  return new Date(Date.now() + (secondsUntilTarget * 1000));
};

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}