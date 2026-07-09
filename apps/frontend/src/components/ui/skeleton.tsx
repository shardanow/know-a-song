import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-bg-elevated', className)} {...props} />;
}
