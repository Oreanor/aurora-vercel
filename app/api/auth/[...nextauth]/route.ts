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
// Check all required variables to avoid runtime errors
const hasEmailConfig = 
  process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_PORT &&
  process.env.EMAIL_FROM &&
  process.env.EMAIL_SERVER_USER &&
  process.env.EMAIL_SERVER_PASSWORD;

if (hasEmailConfig) {
  try {
    const emailPort = Number(process.env.EMAIL_SERVER_PORT);
    
    // Validate port number
    if (isNaN(emailPort) || emailPort <= 0 || emailPort > 65535) {
      console.error(`Invalid EMAIL_SERVER_PORT: ${process.env.EMAIL_SERVER_PORT}`);
    } else {
      // Vercel has restrictions on SMTP ports - use standard ports
      // Port 587 (TLS) or 465 (SSL) are recommended
      if (emailPort !== 587 && emailPort !== 465 && emailPort !== 25) {
        console.warn(`Warning: Non-standard SMTP port ${emailPort} may not work on Vercel. Use 587 (TLS) or 465 (SSL).`);
      }
      
      providers.push(
        EmailProvider({
          server: {
            host: process.env.EMAIL_SERVER_HOST,
            port: emailPort,
            // Use secure connection for port 465 (SSL), TLS for 587
            secure: emailPort === 465,
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            },
            // Add timeout settings for Vercel serverless functions (max 10s execution time limit)
            connectionTimeout: 8000, // 8 seconds (leave buffer for Vercel's 10s limit)
            greetingTimeout: 5000,
            socketTimeout: 8000,
            // Disable strict certificate validation (can cause issues on Vercel)
            tls: {
              rejectUnauthorized: false,
            },
          },
          from: process.env.EMAIL_FROM,
        })
      );
    }
  } catch (error) {
    console.error('Error configuring EmailProvider:', error);
    // Don't add EmailProvider if configuration fails
  }
} else {
  console.warn('EmailProvider not configured: Missing required environment variables');
}

const authOptions: NextAuthOptions = {
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
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

// Wrap handlers with error handling
const GET = async (req: Request, context: any) => {
  try {
    return await handler(req, context);
  } catch (error) {
    console.error('NextAuth GET error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

const POST = async (req: Request, context: any) => {
  try {
    return await handler(req, context);
  } catch (error) {
    console.error('NextAuth POST error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export { GET, POST };
