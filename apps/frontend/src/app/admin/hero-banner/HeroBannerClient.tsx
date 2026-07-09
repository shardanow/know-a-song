'use client';

import dynamic from 'next/dynamic';

const HeroBannerContent = dynamic(() => import('./HeroBannerContent'), { ssr: false });

export default function HeroBannerClient() {
  return <HeroBannerContent />;
}
