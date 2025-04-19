// src/app/circles/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAddress } from '@/lib/algorand/utils';
import { useWalletStore, peraWallet } from '@/store/wallet-store';
import { contributeToCircle } from '@/lib/algorand/transactions';
import { algosToMicroalgos, microalgosToAlgos } from '@/lib/algorand/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCircleStore, Circle } from '@/store/circle-store';
import { getAlgodClient } from '@/lib/algorand/client';
import algosdk from 'algosdk';

export default function CircleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeAccount, connected } = useWalletStore();
  const { loading, error: storeError, fetchCircleById } = useCircleStore();
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [circle, setCircle] = useState<Circle | null>(null);
  
  const circleId = typeof params.id === 'string' 
    ? parseInt(params.id) 
    : params.id && params.id[0] ? parseInt(params.id[0]) : 0;
  
  useEffect(() => {
    if (circleId) {
      const loadCircle = async () => {
        const circleData = await fetchCircleById(circleId);
        if (circleData) {
          setCircle(circleData);
        }
      };
      
      loadCircle();
    }
  }, [circleId, fetchCircleById]);
  
  const handleContribute = async () => {
    if (!activeAccount || !circle) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setIsContributing(true);
      setError(null);
      setSuccess(null);
      
      const contributionAmountMicroAlgos = algosToMicroalgos(circle.contributionAmount);
      
      // Create transactions
      const txns = await contributeToCircle(
        activeAccount.address,
        contributionAmountMicroAlgos
      );
      
      // Sign transactions
      const txnsToSign = txns.map(txn => ({
        txn,
        signers: [activeAccount.address]
      }));
      
      const signedTxns = await peraWallet.signTransaction([txnsToSign]);
      
      // Submit the transactions
      const client = getAlgodClient();
        const response = await client.sendRawTransaction(signedTxns).do();
        const txId = (response as any).txId;
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(client, txId, 5);
      
      setSuccess('Contribution successful! Thank you for participating.');
      
      // Refresh the circle data
      const updatedCircle = await fetchCircleById(circleId);
      if (updatedCircle) {
        setCircle(updatedCircle);
      }
      
    } catch (error) {
      console.error('Error contributing:', error);
      setError(error instanceof Error ? error.message : 'Failed to contribute');
    } finally {
      setIsContributing(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading circle details...</div>;
  }
  
  if (!circle) {
    return <div className="text-center py-8">Circle not found or error loading data</div>;
  }
  
  const isCreator = activeAccount?.address === circle.creator;
  const nextDistributionDate = new Date();
  nextDistributionDate.setSeconds(nextDistributionDate.getSeconds() + (circle.nextDistribution - getCurrentRound()) * 4.5);

  
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{circle.name}</h1>
        <div className="flex gap-2">
          {isCreator && (
            <Button 
              variant="outline"
              onClick={() => router.push(`/circles/${circle.id}/manage`)}
            >
              Manage Circle
            </Button>
          )}
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleContribute}
            disabled={isContributing || !connected}
          >
            {isContributing ? 'Processing...' : 'Contribute'}
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Circle Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-gray-500">Circle ID:</span>
                <span>{circle.id}</span>
                
                <span className="text-gray-500">Description:</span>
                <span>{circle.description}</span>
                
                <span className="text-gray-500">Category:</span>
                <span>{circle.category}</span>
                
                <span className="text-gray-500">Creator:</span>
                <span className="font-mono text-sm">{formatAddress(circle.creator, 8)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contribution Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">{circle.contributionAmount} ALGO</span>
                
                <span className="text-gray-500">Frequency:</span>
                <span>{circle.frequency}</span>
                
                <span className="text-gray-500">Members:</span>
                <span>{circle.currentMembers} / {circle.memberCap}</span>
                
                <span className="text-gray-500">Current Recipient:</span>
                <span className="font-mono text-sm">{formatAddress(circle.currentRecipient, 8)}</span>
                
                <span className="text-gray-500">Next Distribution:</span>
                <span>{circle.nextDistribution.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



// Helper function to estimate current round (this would be more accurate if fetched from the network)
function getCurrentRound() {
    // For a simple estimate, determine seconds since Jan 1, 2022 and divide by 4.5
    const startDate = new Date('2022-01-01').getTime();
    const now = Date.now();
    const secondsSinceStart = (now - startDate) / 1000;
    return Math.floor(secondsSinceStart / 4.5);
  }