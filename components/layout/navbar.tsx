'use client';

import Link from 'next/link';
import { WalletConnect } from '@/components/wallet/wallet-connect';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">CircleFi</Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <Link href="/explore" className="hover:text-blue-600">Explore</Link>
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}