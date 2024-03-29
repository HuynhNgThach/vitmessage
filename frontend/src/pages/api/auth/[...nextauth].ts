import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prismadb";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: "LmeBhHktDOo9g0e5UHy+9z32d7ZBr39B6eD5+3YexOc=",
  callbacks: {
    session({ session, user }) {
      return { ...session, user: { ...session.user, ...user } };
    },
  },
});
