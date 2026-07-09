'use client';

import { usePathname } from '@/lib/navigation';

export function CanonicalUrl() {
  const pathname = usePathname();
  return <link rel="canonical" href={`https://know-a-song.com${pathname}`} />;
}
