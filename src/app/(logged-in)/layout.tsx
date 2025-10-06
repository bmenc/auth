'use client';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Spinner } from '@/lib/blueprint';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menubar } from '@/components/Menubar';
export default function LoggedInLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/sign-in');
    }
  }, [session, status, router]);
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={50} />
      </div>
    );
  }
  if (!session) {
    return null;
  }
  return (
    <div className="h-screen flex flex-col">
      <Menubar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
