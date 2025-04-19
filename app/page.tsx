import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 py-12">
      <h1 className="text-5xl font-bold text-center">CircleFi</h1>
      <p className="text-xl text-center max-w-2xl">
        A decentralized collaborative savings platform built on Algorand
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
        </Link>
        <Link href="/explore">
          <Button size="lg" variant="outline">Explore Circles</Button>
        </Link>
      </div>
    </div>
  );
}