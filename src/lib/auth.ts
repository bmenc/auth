import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function getSession() {
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();

    if (!session?.user?.email) {
        return null;
    }

    return session.user;
}

export async function requireAuth() {
    const user = await getCurrentUser();

    if(!user) {
        throw new Error('Authentication required');
    }

    return user;
}
