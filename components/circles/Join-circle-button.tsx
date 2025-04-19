// src/components/circles/JoinCircleButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWalletStore, peraWallet } from '@/store/wallet-store';
import { joinCircle } from '@/lib/algorand/transactions';
import { useTransaction } from '@/hooks/use-transaction';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface JoinCircleButtonProps {
  circleId: number;
  onSuccess?: () => void;
}

export default function JoinCircleButton({ circleId, onSuccess }: JoinCircleButtonProps) {
  const { activeAccount, connected } = useWalletStore();
  const { status, error, submitTransaction } = useTransaction();
  const [isJoining, setIsJoining] = useState(false);
  
  const handleJoin = async () => {
    if (!activeAccount) return;
    
    try {
      setIsJoining(true);
      
      // Create transaction to join circle
      const txn = await joinCircle(activeAccount.address);
      
      // Sign transaction with Pera Wallet
      const txnToSign = [{
        txn,
        signers: [activeAccount.address]
      }];
      
      const signedTxn = await peraWallet.signTransaction([txnToSign]);
      
      // Submit transaction
      const result = await submitTransaction(signedTxn);
      
      if (result.success && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error joining circle:', err);
    } finally {
      setIsJoining(false);
    }
  };
  
  return (
    <>
      <Button
        className="bg-blue-600 hover:bg-blue-700"
        onClick={handleJoin}
        disabled={!connected || isJoining || status === 'pending'}
      >
        {isJoining || status === 'pending' ? 'Joining...' : 'Join Circle'}
      </Button>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {status === 'confirmed' && (
        <Alert className="mt-4 bg-green-50 border-green-200">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>You have successfully joined the circle!</AlertDescription>
        </Alert>
      )}
    </>
  );
}