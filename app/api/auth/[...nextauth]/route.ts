//File app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Mock user for demonstration purposes
const mockUser = {
  id: '1',
  email: 'user@example.com',
  name: 'Test User',
  password: 'password123' // In a real app, this would be hashed
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Check against our mock user
        if (credentials.email === mockUser.email && credentials.password === mockUser.password) {
          return {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
          };
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
