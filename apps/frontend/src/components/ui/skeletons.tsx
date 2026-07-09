import { Skeleton } from './skeleton';

export function FilmCardSkeleton() {
  return (
    <div className="relative rounded-[20px] overflow-hidden bg-bg-elevated min-h-[222px]">
      <Skeleton className="w-full h-full absolute inset-0" />
    </div>
  );
}

export function FilmHeroSkeleton() {
  return (
    <div className="relative h-[clamp(310px,29vw,410px)] rounded-[28px] overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  );
}

export function FilmListSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-5 w-[600px]" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-[40px] w-20 rounded-[13px]" />
        <Skeleton className="h-[40px] w-28 rounded-[13px]" />
        <Skeleton className="h-[40px] w-28 rounded-[13px]" />
        <Skeleton className="h-[40px] w-36 rounded-[13px]" />
      </div>
      <FilmHeroSkeleton />
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        <FilmCardSkeleton />
        <FilmCardSkeleton />
        <FilmCardSkeleton />
      </div>
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
        <FilmCardSkeleton />
        <FilmCardSkeleton />
        <FilmCardSkeleton />
        <FilmCardSkeleton />
      </div>
    </div>
  );
}

export function SongListSkeleton() {
  return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-5 w-24 mb-4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="w-4 h-4 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

export function FilmDetailSkeleton() {
  return (
    <>
      <div className="relative mb-6 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-64" />
      </div>
      <SongListSkeleton />
    </>
  );
}
