'use client';

import dynamic from 'next/dynamic';

const ArtistsContent = dynamic(() => import('./ArtistsContent'), { ssr: false });

export default function ArtistsClient() {
  return <ArtistsContent />;
}
