import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const providers: NextAuthOptions['providers'] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        prompt: "select_account"
      }
    }
  }),
];

// Add EmailProvider only if email configuration is available
if (
  process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_PORT &&
  process.env.EMAIL_FROM
) {
  providers.push(
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    })
  );
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    // This callback fires on login
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" && user.email) {
          // Check if user with this email already exists (from any provider)
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            // If exists, update account for Google provider
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                },
              },
              update: {
                userId: existingUser.id,
              },
              create: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
            
            // Replace current user id
            user.id = existingUser.id;
          }
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        // Allow sign in even if there's an error with account linking
        return true;
      }
    },

    // Store unified id in JWT for Email and Google
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
