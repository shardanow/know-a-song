'use client';

import dynamic from 'next/dynamic';

const UserInfoSmall = dynamic(
  () => import('@/components/user/UserInfoSmall').then((m) => ({ default: m.UserInfoSmall })),
  { ssr: false },
);

export function UserInfoSmallWrapper() {
  return <UserInfoSmall />;
}
