import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client, { getDb } from "./lib/db";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";

const providers: Provider[] = [
  Credentials({
    credentials: { password: { label: "Password", type: "password" } },
    authorize(c) {
      if (c.password !== "password") return null;
      return {
        id: "test",
        name: "Test User",
        email: "test@example.com",
      };
    },
  }),
  Google,
  Resend({
    apiKey: process.env.AUTH_RESEND_KEY,
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
  }),
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const db = await getDb();
      const user = await db.collection("users").findOne({
        email: (credentials.email as string).toLowerCase(),
      });

      if (!user || !user.password) return null;

      const isValid = await bcrypt.compare(
        credentials.password as string,
        user.password,
      );

      if (!isValid) return null;

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
  }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(client),
  providers,
  secret: process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) return false;

        const db = await getDb();
        const existingUser = await db.collection("users").findOne({
          email: profile.email.toLowerCase(),
        });

        if (!existingUser) {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (account && profile?.email) {
        const db = await getDb();
        const dbUser = await db.collection("users").findOne({
          email: profile.email.toLowerCase(),
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id.toString();
        }
      } else if (user) {
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=AccessDenied",
  },
});
