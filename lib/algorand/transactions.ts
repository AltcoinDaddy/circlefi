import algosdk from 'algosdk';
import { getAlgodClient } from './client';

// App ID from environment
const APP_ID = parseInt(process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '0');

// Initialize user state (call after opting in)
export const initializeUser = async (
  senderAddress: string
): Promise<algosdk.Transaction> => {
  try {
    const client = getAlgodClient();
    const suggestedParams = await client.getTransactionParams().do();
    
    const appArgs = [
      new TextEncoder().encode("initializeUser")
    ];
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      sender: senderAddress,
      suggestedParams,
      appIndex: APP_ID,
      appArgs,
      onComplete: algosdk.OnApplicationComplete.NoOpOC
    });
    
    return txn;
  } catch (error) {
    console.error('Error creating initialization transaction:', error);
    throw error;
  }
};

// Join an existing circle
export const joinCircle = async (
  senderAddress: string
): Promise<algosdk.Transaction> => {
  try {
    const client = getAlgodClient();
    const suggestedParams = await client.getTransactionParams().do();
    
    const appArgs = [
      new TextEncoder().encode("joinCircle")
    ];
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      sender: senderAddress,
      suggestedParams,
      appIndex: APP_ID,
      appArgs,
      onComplete: algosdk.OnApplicationComplete.NoOpOC
    });
    
    return txn;
  } catch (error) {
    console.error('Error creating join circle transaction:', error);
    throw error;
  }
};

// Create a new circle
export const createCircle = async (
senderAddress: string, name: string, contributionAmount: number, frequencyInRounds: number, memberCap: number, APP_ID: number): Promise<algosdk.Transaction> => {
  try {
    const client = getAlgodClient();
    const suggestedParams = await client.getTransactionParams().do();
    
    const appArgs = [
      new TextEncoder().encode("createCircle"),
      new TextEncoder().encode(name),
      algosdk.encodeUint64(contributionAmount),
      algosdk.encodeUint64(frequencyInRounds),
      algosdk.encodeUint64(memberCap)
    ];
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      sender: senderAddress,
      suggestedParams,
      appIndex: APP_ID,
      appArgs,
      onComplete: algosdk.OnApplicationComplete.NoOpOC
    });
    
    return txn;
  } catch (error) {
    console.error('Error creating circle transaction:', error);
    throw error;
  }
};

// Contribute to a circle
export const contributeToCircle = async (
  senderAddress: string,
  amount: number // in microalgos
): Promise<algosdk.Transaction[]> => {
  try {
    const client = getAlgodClient();
    const suggestedParams = await client.getTransactionParams().do();
    
    // Create application call transaction
    const appArgs = [
      new TextEncoder().encode("contribute")
    ];
    
    const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
      sender: senderAddress,
      suggestedParams,
      appIndex: APP_ID,
      appArgs,
      onComplete: algosdk.OnApplicationComplete.NoOpOC
    });
    
    // Get app address
    const appAddress = algosdk.getApplicationAddress(APP_ID);
    
    // Create payment transaction
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: senderAddress,
      receiver: appAddress,
      amount,
      suggestedParams
    });
    
    // Group transactions
    const txns = [appCallTxn, paymentTxn];
    algosdk.assignGroupID(txns);
    
    return txns;
  } catch (error) {
    console.error('Error creating contribution transaction:', error);
    throw error;
  }
};

// Distribute funds to current recipient (only callable by creator)
export const distributeFromCircle = async (
  senderAddress: string
): Promise<algosdk.Transaction> => {
  try {
    const client = getAlgodClient();
    const suggestedParams = await client.getTransactionParams().do();
    
    const appArgs = [
      new TextEncoder().encode("distribute")
    ];
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      sender: senderAddress,
      suggestedParams,
      appIndex: APP_ID,
      appArgs,
      onComplete: algosdk.OnApplicationComplete.NoOpOC
    });
    
    return txn;
  } catch (error) {
    console.error('Error creating distribution transaction:', error);
    throw error;
  }
};

// Helper to submit signed transactions
export const submitSignedTransaction = async (
  signedTxns: Uint8Array | Uint8Array[]
): Promise<string> => {
  try {
    const client = getAlgodClient();
    
    const txnsToSubmit = Array.isArray(signedTxns) ? signedTxns : [signedTxns];
    // Quick fix for each file
  const response = await client.sendRawTransaction(txnsToSubmit).do();
  const txId = (response as any).txId;
    
    
    // Wait for confirmation
    const result = await algosdk.waitForConfirmation(client, txId, 5);
    
    return txId;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
};