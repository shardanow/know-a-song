import { LeftBar } from './LeftBar';
import { Header } from './Header';
import { Footer } from './Footer';
import dynamic from 'next/dynamic';

const InfoPanel = dynamic(() => import('@/components/songs/InfoPanel').then((m) => ({ default: m.InfoPanel })));

export function AppShell({
  children,
  mainClassName,
}: {
  children: React.ReactNode;
  mainClassName?: string;
}) {
  return (
    <div className="flex min-h-screen">
      <LeftBar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header />
        <main className={`flex-1 ${mainClassName || ''}`}>
          {children}
        </main>
        <Footer />
      </div>
      <InfoPanel />
    </div>
  );
}
