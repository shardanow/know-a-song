'use client';

import dynamic from 'next/dynamic';

const FilmsContent = dynamic(() => import('./FilmsContent'), { ssr: false });

export default function FilmsClient() {
  return <FilmsContent />;
}
