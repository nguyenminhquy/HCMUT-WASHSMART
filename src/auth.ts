import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(8)
});

const SESSION_MAX_AGE_SECONDS = 5 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS, updateAge: 0 },
  jwt: { maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {}
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const identifier = parsed.data.username.trim();
        const password = parsed.data.password;
        const adminUser = process.env.ADMIN_USER?.trim();
        const adminPass = process.env.ADMIN_PASS;

        if (adminUser && adminPass && identifier === adminUser && password === adminPass) {
          return { id: "admin", name: "Administrator", email: adminUser, isAdmin: true };
        }

        const customer = await prisma.customerUser.findFirst({
          where: {
            OR: [{ email: identifier.toLowerCase() }, { phone: identifier }]
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            passwordHash: true
          }
        });

        if (!customer) {
          return null;
        }

        const validPassword = await compare(password, customer.passwordHash);
        if (!validPassword) {
          return null;
        }

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email ?? customer.phone,
          isAdmin: false
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    }
  }
});
