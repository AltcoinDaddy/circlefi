// src/lib/algorand/utils.ts
export const MICROALGOS_TO_ALGOS_RATIO = 1000000;

export const microalgosToAlgos = (microalgos: number): number => {
  return microalgos / MICROALGOS_TO_ALGOS_RATIO;
};

export const algosToMicroalgos = (algos: number): number => {
  return Math.floor(algos * MICROALGOS_TO_ALGOS_RATIO);
};

export const formatAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

// src/lib/algorand/utils.ts - Add this function to your utils file

/**
 * Safely converts a BigInt to a Number
 * @param value The BigInt value to convert
 * @param fallback Optional fallback value if conversion isn't safe
 * @returns The converted Number, or the fallback value
 */
export function bigIntToNumber(value: bigint | number | string, fallback?: number): number {
  // If it's already a number, return it
  if (typeof value === 'number') {
    return value;
  }
  
  // Convert string to BigInt if needed
  if (typeof value === 'string') {
    try {
      value = BigInt(value);
    } catch (e) {
      return fallback !== undefined ? fallback : 0;
    }
  }
  
  // Now we have a BigInt
  try {
    // Check if the value is within safe integer range
    if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
      console.warn('BigInt value exceeds safe number range and may lose precision');
      if (fallback !== undefined) {
        return fallback;
      }
    }
    
    // Convert to number
    return Number(value);
  } catch (e) {
    console.error('Error converting BigInt to Number:', e);
    return fallback !== undefined ? fallback : 0;
  }
}
