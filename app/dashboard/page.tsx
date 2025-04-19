// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { useCircleStore } from '@/store/circle-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CircleCard from '@/components/circles/circle-card';
import { Card, CardContent } from '@/components/ui/card';
import { bigIntToNumber, formatAddress, microalgosToAlgos } from '@/lib/algorand/utils';
import { getAlgodClient } from '@/lib/algorand/client';

export default function DashboardPage() {
  const { activeAccount, connected } = useWalletStore();
  const { circles, loading, error, fetchCircles } = useCircleStore();
  const [accountBalance, setAccountBalance] = useState<number | null>(null);

  useEffect(() => {
    if (activeAccount) {
      // Fetch circles for this account
      fetchCircles(activeAccount.address);
      
      // Fetch account balance
      const fetchBalance = async () => {
        try {
          const algodClient = getAlgodClient();
          const accountInfo = await algodClient.accountInformation(activeAccount.address).do();
          setAccountBalance(microalgosToAlgos(bigIntToNumber(accountInfo.amount)));
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      };
      
      fetchBalance();
    }
  }, [activeAccount, fetchCircles]);
  if (!connected || !activeAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
        <p className="text-gray-600 mb-4">Please connect your wallet to access the dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Dashboard</h1>
        <Link href="/circles/create">
          <Button className="bg-blue-600 hover:bg-blue-700">Create New Circle</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-y-2">
            <span className="text-gray-500">Address:</span>
            <span className="font-mono">{formatAddress(activeAccount.address, 8)}</span>
            
            <span className="text-gray-500">Active Circles:</span>
            <span>{circles.length}</span>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mt-8">Your Savings Circles</h2>
      
      {loading ? (
        <div className="text-center py-8">Loading your circles...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error loading circles: {error}</div>
      ) : circles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {circles.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium">You haven't joined any circles yet</h3>
          <p className="text-gray-500 mt-2">Create a new circle or join an existing one to get started</p>
          <div className="flex gap-4 justify-center mt-4">
            <Link href="/circles/create">
              <Button className="bg-blue-600 hover:bg-blue-700">Create Circle</Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline">Explore Circles</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}