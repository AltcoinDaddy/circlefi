// src/components/circles/CircleManagement.tsx
'use client';

import { useState } from 'react';
import { peraWallet, useWalletStore } from '@/store/wallet-store';
import { Button } from '@/components/ui/button';
import { createCircle } from '@/lib/algorand/transactions';
import { algosToMicroalgos } from '@/lib/algorand/utils';
import { getAlgodClient } from '../client';

const APP_ID = parseInt(process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '0');

export function CreateCircleButton() {
  const { activeAccount, provider } = useWalletStore();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCircle = async () => {
    if (!activeAccount) return;
    
    setIsCreating(true);
    
    try {
      const circleName = "My First Circle";
      const contributionAmount = algosToMicroalgos(10); // 10 ALGO
      const frequencyInRounds = 30 * 24 * 60 * 4; // ~30 days
      const memberCap = 10;
      
      const unsignedTxn = await createCircle(
        activeAccount.address,
        circleName,
        contributionAmount,
        frequencyInRounds,
        memberCap,
        APP_ID
      );
      
      // Use your wallet provider to sign and send
      if (provider === 'pera') {
        const txnToSign = [{
          txn: unsignedTxn,
          signers: [activeAccount.address]
        }];
        
        const signedTxns = await peraWallet.signTransaction([txnToSign]);
        
        // Submit the transaction
        const client = getAlgodClient();
        await client.sendRawTransaction(signedTxns).do();
        
        // Wait for confirmation
        // ...
      }
    } catch (error) {
      console.error('Error creating circle:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateCircle}
      disabled={isCreating || !activeAccount}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {isCreating ? 'Creating...' : 'Create New Circle'}
    </Button>
  );
}