import NextAuth from 'next-auth/next';
import Google from 'next-auth/providers/google';
import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';

export default (req, res) => NextAuth(req, res, {
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    pages: {
        "signIn": "/auth/login",
    },
});