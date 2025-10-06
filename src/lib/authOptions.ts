import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import type { Session, User as NextAuthUser } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
const EXPIRATION_TIME = parseInt(process.env.EXPIRATION_TIME || '15', 10);
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'example@example.com' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                const useRealAuth = process.env.AUTH === 'true';
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                if (!useRealAuth) {
                    return {
                        id: 'demo-user-123',
                        name: 'Demo User',
                        email: credentials.email,
                    };
                }
                try {
                    await connectMongoDB();
                    const user = await User.findOne({ email: credentials.email });
                    if (!user) {
                        return null;
                    }
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) {
                        return null;
                    }
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                    };
                } catch {
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt ({token, user}: {token: JWT, user?: NextAuthUser}) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session ({session, token}: {session: Session, token: JWT}) {
            if (token && session.user) {
                const useRealAuth = process.env.AUTH === 'true';
                if (useRealAuth && token.id) {
                    try {
                        await connectMongoDB();
                        const user = await User.findById(token.id);
                        if (user) {
                            (session.user as NextAuthUser & { id: string }).id = user._id.toString();
                            session.user.name = user.name;
                            session.user.email = user.email;
                        }
                    } catch {
                        (session.user as NextAuthUser & { id: string }).id = token.id as string;
                        session.user.name = token.name as string;
                        session.user.email = token.email as string;
                    }
                } else {
                    (session.user as NextAuthUser & { id: string }).id = token.id as string;
                    session.user.name = token.name as string;
                    session.user.email = token.email as string;
                }
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt' as const,
        maxAge: EXPIRATION_TIME * 60,
        updateAge: 0,
    },
    jwt: {
        maxAge: EXPIRATION_TIME * 60,
    },
    secret: process.env.NEXTAUTH_SECRET || 'demo-secret-key',
    pages: {
        signIn: '/sign-in',
        signOut: '/sign-in',
        error: '/sign-in',
    },
    debug: process.env.NODE_ENV === 'development',
}
