'use client';

import dynamic from 'next/dynamic';

const RolesContent = dynamic(() => import('./RolesContent'), { ssr: false });

export default function RolesClient() {
  return <RolesContent />;
}
