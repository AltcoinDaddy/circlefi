// src/app/explore/page.tsx - fixed global state access
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { formatAddress, microalgosToAlgos } from '@/lib/algorand/utils';
import { useWalletStore } from '@/store/wallet-store';
import Link from 'next/link';
import { getAlgodClient } from '@/lib/algorand/client';

// Define Circle interface
interface Circle {
  id: number;
  name: string;
  description: string;
  contributionAmount: number;
  frequency: string;
  members: number;
  maxMembers: number;
  creator: string;
  currentRecipient: string;
  totalCollected: number;
  nextDistribution: number;
  emergencyFund: number;
  category: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const { activeAccount, connected } = useWalletStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [circles, setCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCircles = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would query the indexer to find all applications
        // of your type. For now, we'll just fetch the one we know about.
        const APP_ID = parseInt(process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '0');
        
        const algodClient = getAlgodClient();
        const appInfo = await algodClient.getApplicationByID(APP_ID).do();
        
        // Type assertion to fix TypeScript error - the API returns 'global-state' but TypeScript
        // definitions might not match this exactly
        const appParams = appInfo.params as any;
        const globalState = decodeState(appParams['global-state'] || []);
        
        // Get frequency string based on rounds
        const frequencyValue = parseInt(globalState['FrequencyInRounds'] || '0');
        const frequencyText = getFrequencyText(frequencyValue);
        
        // Convert to our Circle interface
        const circle: Circle = {
          id: APP_ID,
          name: globalState['CircleName'] || 'CircleFi Savings',
          description: 'A collaborative savings circle on Algorand',
          contributionAmount: microalgosToAlgos(parseInt(globalState['ContributionAmount'] || '0')),
          frequency: frequencyText,
          members: parseInt(globalState['CurrentMembers'] || '0'),
          maxMembers: parseInt(globalState['MemberCap'] || '0'),
          creator: globalState['Creator'] || '',
          currentRecipient: globalState['CurrentRecipient'] || '',
          totalCollected: 0, // Would need to calculate from transactions
          nextDistribution: parseInt(globalState['NextDistribution'] || '0'),
          emergencyFund: microalgosToAlgos(parseInt(globalState['EmergencyFund'] || '0')),
          category: 'Community' // Default category for now
        };
        
        setCircles([circle]);
      } catch (error) {
        console.error('Error fetching circles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCircles();
  }, []);
  
  // Helper function to decode state values
  function decodeState(stateArray: any[]) {
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
  }
  
  // Helper function to convert frequency in rounds to text
  function getFrequencyText(frequencyInRounds: number): string {
    // Approximate values - adjust based on your contract's actual values
    const SECONDS_PER_BLOCK = 4.5;
    const BLOCKS_PER_DAY = 24 * 60 * 60 / SECONDS_PER_BLOCK;
    
    if (frequencyInRounds <= 7 * BLOCKS_PER_DAY) {
      return 'Weekly';
    } else if (frequencyInRounds <= 14 * BLOCKS_PER_DAY) {
      return 'Biweekly';
    } else {
      return 'Monthly';
    }
  }
  
  // Filter circles based on search term
  const filteredCircles = circles.filter(circle => 
    circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    circle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    circle.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      {/* Rest of your JSX remains the same */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Explore Savings Circles</h1>
          <p className="text-gray-500">Discover and join savings circles from around the world</p>
        </div>
        <Link href="/circles/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Create New Circle
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Search by name, description, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-pulse text-lg">Loading circles...</div>
        </div>
      ) : filteredCircles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCircles.map((circle) => (
            <Card key={circle.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{circle.name}</CardTitle>
                    <CardDescription className="mt-1">{circle.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50">{circle.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-2 mb-4">
                  <span className="text-gray-500">Contribution:</span>
                  <span className="font-medium">{circle.contributionAmount} ALGO</span>
                  
                  <span className="text-gray-500">Frequency:</span>
                  <span>{circle.frequency}</span>
                  
                  <span className="text-gray-500">Members:</span>
                  <span>{circle.members} / {circle.maxMembers}</span>
                  
                  <span className="text-gray-500">Created by:</span>
                  <span className="font-mono text-sm">{formatAddress(circle.creator)}</span>
                  
                  <span className="text-gray-500">Total Collected:</span>
                  <span className="font-medium">{circle.totalCollected} ALGO</span>
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/circles/${circle.id}`)}
                  >
                    View Details
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push(`/circles/${circle.id}/join`)}
                    disabled={!connected}
                  >
                    Join Circle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium">No circles found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or create a new circle</p>
          <Button 
            className="mt-4 bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/circles/create')}
          >
            Create Circle
          </Button>
        </div>
      )}
    </div>
  );
}