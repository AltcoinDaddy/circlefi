'use client';

import { Circle } from '@/store/circle-store';
import { formatAddress } from '@/lib/algorand/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CircleCardProps {
  circle: Circle;
}

export default function CircleCard({ circle }: CircleCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{circle.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 mb-4">
          <span className="text-gray-500">Contribution:</span>
          <span className="font-medium">{circle.contributionAmount} ALGO</span>
          
          <span className="text-gray-500">Members:</span>
          <span>{circle.currentMembers} / {circle.memberCap}</span>
          
          <span className="text-gray-500">Created by:</span>
          <span className="font-mono text-sm">{formatAddress(circle.creator)}</span>
          
          <span className="text-gray-500">Current Recipient:</span>
          <span className="font-mono text-sm">{formatAddress(circle.currentRecipient)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/circles/${circle.id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
        <Button className="bg-blue-600 hover:bg-blue-700">Contribute</Button>
      </CardFooter>
    </Card>
  );
}