import algosdk from 'algosdk';

// Initialize Algorand client
export const getAlgodClient = () => {
  const server = process.env.NEXT_PUBLIC_ALGOD_SERVER || 'https://mainnet-api.algonode.cloud';
  const port = process.env.NEXT_PUBLIC_ALGOD_PORT || '';
  const token = process.env.NEXT_PUBLIC_ALGOD_TOKEN || '';
  
  return new algosdk.Algodv2(token, server, port);
};

export const getIndexerClient = () => {
  const server = process.env.NEXT_PUBLIC_INDEXER_SERVER || 'https://mainnet-idx.algonode.cloud';
  const port = process.env.NEXT_PUBLIC_INDEXER_PORT || '';
  const token = process.env.NEXT_PUBLIC_INDEXER_TOKEN || '';
  
  return new algosdk.Indexer(token, server, port);
};