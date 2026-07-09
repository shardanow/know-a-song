'use client';

import dynamic from 'next/dynamic';

const SongsContent = dynamic(() => import('./SongsContent'), { ssr: false });

export default function SongsClient() {
  return <SongsContent />;
}
