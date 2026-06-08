import { Session, User } from 'next-auth';
import clientPromise from '@/src/lib/mongo-client';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { log } from '@/src/lib/log';
import type { JWT } from 'next-auth/jwt';
import Auth0Provider from 'next-auth/providers/auth0';

export const authOptions = {
  cookie: {
    secure: process.env.NODE_ENV && process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60
  },
  secret: process.env.JWT_SECRET,
  pages: {
    error: '/error'
  },
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID || '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
      issuer: process.env.AUTH0_ISSUER,
      authorization: `https://${process.env.AUTH0_ISSUER}/authorize?response_type=code&prompt=login`
    })
  ],
  callbacks: {
    async signIn(session: { user: User | undefined }) {
      log('signIn  ----------------------------------------------------');
      try {
        log(`Sign in callback user ${JSON.stringify(session)}`);
        if (session?.user?.id) {
          return true;
        }
        log('User id was not found');
      } catch (err) {
        console.error('Signin callback error:', err);
      }
      return false;
    },

    async jwt({ token }: { token: JWT }) {
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        session.user.id = token.sub || '';
      }
      return session;
    }
  },
  logger: {
    error(code: string, metadata: unknown) {
      console.error(code, metadata);
    },
    warn(code: string) {
      console.warn(code);
    },
    debug(code: string, metadata: unknown) {
      console.debug(code, metadata);
    }
  }
};
