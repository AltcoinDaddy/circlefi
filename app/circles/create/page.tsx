'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWalletStore, peraWallet } from '@/store/wallet-store';
import { algosToMicroalgos } from '@/lib/algorand/utils';
import { createCircle } from '@/lib/algorand/transactions';
import { getAlgodClient } from '@/lib/algorand/client';
import algosdk from 'algosdk';

// Form schema
const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be less than 50 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  contributionAmount: z.number().min(1, 'Contribution must be at least 1 ALGO').max(1000, 'Contribution must be less than 1000 ALGO'),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']),
  memberCap: z.number().min(3, 'Must have at least 3 members').max(50, 'Cannot have more than 50 members'),
  category: z.enum(['Community', 'Family', 'Business', 'Education', 'Travel', 'Healthcare', 'Other'])
});

type FormData = z.infer<typeof formSchema>;

export default function CreateCirclePage() {
  const APP_ID = parseInt(process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '0');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { activeAccount, connected } = useWalletStore();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      contributionAmount: 10,
      frequency: 'monthly',
      memberCap: 10,
      category: 'Community'
    }
  });

  // Convert frequency to rounds (approximately)
  const frequencyToRounds = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 7 * 24 * 60 * 4; // ~7 days of blocks (4 blocks/min)
      case 'biweekly':
        return 14 * 24 * 60 * 4; // ~14 days
      case 'monthly':
      default:
        return 30 * 24 * 60 * 4; // ~30 days
    }
  };

  if (!connected || !activeAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
        <p className="text-gray-600 mb-4">Please connect your wallet to create a circle</p>
      </div>
    );
  }

 // src/app/circles/create/page.tsx - onSubmit function

const onSubmit = async (data: FormData) => {
  try {
    setIsSubmitting(true);
    setError(null);
    
    // Ensure wallet is connected
    if (!activeAccount) {
      setError('Wallet connection required');
      setIsSubmitting(false);
      return;
    }

    // Convert ALGO to microALGO
    const contributionAmountMicroAlgos = algosToMicroalgos(data.contributionAmount);
    const frequencyInRounds = frequencyToRounds(data.frequency);

    // Create transaction
    const unsignedTxn = await createCircle(
      activeAccount.address,
      data.name,
      contributionAmountMicroAlgos,
      frequencyInRounds,
      data.memberCap,
      APP_ID
    );

    // Sign transaction with Pera Wallet
    try {
      // Create a SignerTransaction with the unsigned transaction
      const txnToSign = [{
        txn: unsignedTxn,
        signers: [activeAccount.address]
      }];
      
      const signedTxn = await peraWallet.signTransaction([txnToSign]);
      
      // Submit transaction directly
      const client = getAlgodClient();
  const response = await client.sendRawTransaction(signedTxn).do();
    const txId = (response as any).txId;

      
      setTransactionId(txId);
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(client, txId, 5);
      
      // Notify success and redirect
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/dashboard');
      }, 2000);
    } catch (signError) {
      console.error('Error signing transaction:', signError);
      setError('Failed to sign transaction. Please try again.');
      setIsSubmitting(false);
    }
    
  } catch (error) {
    console.error('Error creating circle:', error);
    setError(error instanceof Error ? error.message : 'Failed to create circle');
    setIsSubmitting(false);
  }
};
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Savings Circle</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {transactionId && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>Transaction Submitted</AlertTitle>
          <AlertDescription>
            Your circle is being created. Transaction ID: {transactionId}
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Circle Details</CardTitle>
            <CardDescription>
              Configure your new collaborative savings circle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Circle Name</Label>
              <Input
                id="name"
                placeholder="e.g., Family Savings Circle"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of your savings circle..."
                rows={3}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                defaultValue={form.getValues('category')}
                onValueChange={(value) => form.setValue('category', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Community">Community</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label>Contribution Amount (ALGO)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  defaultValue={[form.getValues('contributionAmount')]}
                  max={100}
                  min={1}
                  step={1}
                  className="flex-grow"
                  onValueChange={(value) => form.setValue('contributionAmount', value[0])}
                />
                <Input
                  type="number"
                  className="w-20"
                  value={form.getValues('contributionAmount')}
                  onChange={(e) => form.setValue('contributionAmount', Number(e.target.value))}
                />
              </div>
              {form.formState.errors.contributionAmount && (
                <p className="text-red-500 text-sm">{form.formState.errors.contributionAmount.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Contribution Frequency</Label>
              <Select
                defaultValue={form.getValues('frequency')}
                onValueChange={(value) => form.setValue('frequency', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label>Maximum Members</Label>
              <div className="flex items-center gap-4">
                <Slider
                  defaultValue={[form.getValues('memberCap')]}
                  max={50}
                  min={3}
                  step={1}
                  className="flex-grow"
                  onValueChange={(value) => form.setValue('memberCap', value[0])}
                />
                <Input
                  type="number"
                  className="w-20"
                  value={form.getValues('memberCap')}
                  onChange={(e) => form.setValue('memberCap', Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Circle'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}