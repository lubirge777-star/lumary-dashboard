import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
if (!secret) throw new Error("AUTH_SECRET or NEXTAUTH_SECRET must be set in environment")

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  basePath: "/api/auth",
  secret,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "lubirge@lumary.com" &&
          credentials?.password === "lumary2026"
        ) {
          return {
            id: "1",
            name: "Lubirge",
            email: "lubirge@lumary.com",
            role: "OWNER",
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
