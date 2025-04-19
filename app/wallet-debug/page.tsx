// src/app/wallet-debug/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PeraWalletConnect } from '@perawallet/connect';

export default function WalletDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null);
  const [walletInstalled, setWalletInstalled] = useState<boolean | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    try {
      addLog('Initializing Pera Wallet Connect');
      const wallet = new PeraWalletConnect({
        shouldShowSignTxnToast: true,
        chainId: 416001 // TestNet
      });
      
      setPeraWallet(wallet);
      addLog('Pera Wallet Connect initialized successfully');

      // Check if wallet extension is installed
      const isWalletInstalled = typeof window !== 'undefined' && 
                               (window as any).algorand && 
                               !!(window as any).algorand.isPeraWallet;
      
      setWalletInstalled(isWalletInstalled);
      addLog(`Wallet installed: ${isWalletInstalled ? 'Yes' : 'No'}`);

      // Attempt to reconnect session
      wallet.reconnectSession()
        .then(reconnectedAccounts => {
          addLog(`Reconnect session result: ${reconnectedAccounts.length} accounts`);
          if (reconnectedAccounts.length) {
            setAccounts(reconnectedAccounts);
            setConnectionStatus('connected');
          }
        })
        .catch(err => {
          addLog(`Error reconnecting session: ${err.message}`);
        });

      // Set up disconnect handler
      wallet.connector?.on('disconnect', () => {
        addLog('Disconnect event received');
        setAccounts([]);
        setConnectionStatus('disconnected');
      });

      return () => {
        addLog('Cleaning up PeraWalletConnect');
        wallet.disconnect();
      };
    } catch (err) {
      const error = err as Error;
      addLog(`Error initializing wallet: ${error.message}`);
      setError(`Error initializing wallet: ${error.message}`);
    }
  }, []);

  const handleConnect = async () => {
    if (!peraWallet) {
      addLog('Pera Wallet not initialized yet');
      return;
    }

    setConnectionStatus('connecting');
    setError(null);
    addLog('Attempting to connect to wallet...');

    try {
      const newAccounts = await peraWallet.connect();
      addLog(`Connect result: ${newAccounts.length} accounts`);
      
      setAccounts(newAccounts);
      setConnectionStatus('connected');
    } catch (err) {
      const error = err as Error;
      addLog(`Error connecting to wallet: ${error.message}`);
      setError(`Error connecting to wallet: ${error.message}`);
      setConnectionStatus('disconnected');
    }
  };

  const handleDisconnect = async () => {
    if (!peraWallet) {
      addLog('Pera Wallet not initialized yet');
      return;
    }

    addLog('Attempting to disconnect from wallet...');
    try {
      await peraWallet.disconnect();
      addLog('Disconnected from wallet');
      setAccounts([]);
      setConnectionStatus('disconnected');
    } catch (err) {
      const error = err as Error;
      addLog(`Error disconnecting from wallet: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wallet Connection Debugger</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Wallet Status</CardTitle>
          <CardDescription>Check the status of your wallet connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Pera Wallet Initialized:</div>
            <div>{peraWallet ? 'Yes' : 'No'}</div>
            
            <div className="font-medium">Wallet Installed:</div>
            <div>{walletInstalled === null ? 'Checking...' : walletInstalled ? 'Yes' : 'No'}</div>
            
            <div className="font-medium">Connection Status:</div>
            <div>
              {connectionStatus === 'connected' && <span className="text-green-600">Connected</span>}
              {connectionStatus === 'connecting' && <span className="text-yellow-600">Connecting...</span>}
              {connectionStatus === 'disconnected' && <span className="text-red-600">Disconnected</span>}
            </div>
            
            <div className="font-medium">Connected Accounts:</div>
            <div>{accounts.length ? accounts.join(', ') : 'None'}</div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleConnect} 
              disabled={connectionStatus === 'connecting' || !peraWallet}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
            </Button>
            
            <Button 
              onClick={handleDisconnect} 
              disabled={connectionStatus === 'disconnected' || !peraWallet}
              variant="outline"
            >
              Disconnect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Logs</CardTitle>
          <CardDescription>Detailed logs of the wallet connection process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {logs.length ? logs.map((log, index) => (
              <div key={index} className="py-1">{log}</div>
            )) : (
              <div className="text-gray-500">No logs yet...</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>1. Make sure you have Pera Wallet installed</strong></p>
          <p>You need to have Pera Wallet installed in your browser as an extension or have the Pera Mobile app.</p>
          
          <p><strong>2. Check for browser compatibility issues</strong></p>
          <p>Some browsers may block extensions or have stricter security settings.</p>
          
          <p><strong>3. Try refreshing the page</strong></p>
          <p>Sometimes a simple page refresh can fix connection issues.</p>
          
          <p><strong>4. Make sure you're on the correct network</strong></p>
          <p>This app is configured for {process.env.NEXT_PUBLIC_ALGORAND_NETWORK || 'TestNet'}.</p>
        </CardContent>
      </Card>
    </div>
  );
}