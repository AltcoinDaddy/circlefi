import { NextResponse } from 'next/server';
import algosdk from 'algosdk';

export async function POST(req: Request) {
  try {
    const { signedTxn } = await req.json();
    
    // Connect to Algorand client
    const algodServer = process.env.NEXT_PUBLIC_ALGOD_SERVER || 'https://mainnet-api.algonode.cloud';
    const algodPort = process.env.NEXT_PUBLIC_ALGOD_PORT || '';
    const algodToken = process.env.NEXT_PUBLIC_ALGOD_TOKEN || '';
    
    const client = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    
    // Submit signed transaction
    const response = await client.sendRawTransaction(signedTxn).do();
    const txId = (response as any).txId;
    // Wait for confirmation
    await algosdk.waitForConfirmation(client, txId, 5);
    
    return NextResponse.json({ txId, success: true });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}