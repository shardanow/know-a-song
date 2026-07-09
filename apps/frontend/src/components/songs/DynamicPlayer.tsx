'use client';

import dynamic from 'next/dynamic';

export const Player = dynamic(
  () => import('@/components/songs/Player').then((m) => ({ default: m.Player })),
  { ssr: false },
);
