// File: lib/auth.ts
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Adapter } from "next-auth/adapters"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as Adapter,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true, 
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember Me", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan Password wajib diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Email tidak terdaftar");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Password salah");
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          remember: credentials.remember === "true"
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;

        const rememberMe = typeof user.remember === "boolean" ? user.remember : true;
        const expiresInSeconds = rememberMe 
          ? 30 * 24 * 60 * 60     
          : 24 * 60 * 60;         

        token.exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
      }

      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      const userId = token.id || token.sub;
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId as string },
          select: { role: true }
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id as string;
      }

      const userId = token.id || token.sub;
      if (userId && session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId as string },
          select: { role: true }
        });
        if (dbUser) {
          session.user.role = dbUser.role;
        }
      }

      return session;
    }
  }
}