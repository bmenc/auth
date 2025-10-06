'use client';

import type { ReactNode } from 'react';
import { Card, Spinner } from '@/lib/blueprint';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoggedOutLayout({children}: { children: ReactNode}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;
        if (session) {
            router.push('/home');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <Spinner size={50} />
            </div>
        );
    }

    if (session) {
        return null;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <Card className="w-[400px]">
                {children}
            </Card>
        </main>
    )
}