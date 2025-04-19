// src/hooks/useTransaction.ts
import { useState } from 'react';
import { getAlgodClient } from '@/lib/algorand/client';
import algosdk from 'algosdk';

export function useTransaction() {
  const [txId, setTxId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'confirmed' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Submit a signed transaction
  const submitTransaction = async (signedTxns: Uint8Array | Uint8Array[]) => {
    try {
      setStatus('pending');
      setError(null);
      
      const client = getAlgodClient();
      const txnArray = Array.isArray(signedTxns) ? signedTxns : [signedTxns];
      
      // Send transaction to network - use type assertion to fix TypeScript error
      const response = await client.sendRawTransaction(txnArray).do();
      const transactionId = (response as any).txId;
      setTxId(transactionId);
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(client, transactionId, 5);
      
      setStatus('confirmed');
      return { success: true, txId: transactionId };
    } catch (err) {
      setStatus('failed');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  // Clear transaction state
  const clearTransaction = () => {
    setTxId(null);
    setStatus('idle');
    setError(null);
  };
  
  return {
    txId,
    status,
    error,
    submitTransaction,
    clearTransaction
  };
}