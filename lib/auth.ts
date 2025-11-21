import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { apiLogger } from "@/lib/utils/logger";
import type { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Document } from "mongoose";

// MongoDB document interface with _id
interface Provider {
  provider: string;
  providerId: string;
}

interface MongoDBUser extends Document {
  _id: any;
  username?: string;
  email?: string;
  avatar?: string;
  password?: string;
  isAdmin?: boolean;
  isPremium?: boolean;
  providers?: Provider[];
  comparePassword(password: string): Promise<boolean>;
}

// Extend the built-in session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      isAdmin: boolean;
      isPremium: boolean;
    }
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    isAdmin: boolean;
    isPremium: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  debug: false,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.data.id,
          name: profile.data.name || profile.data.username,
          email: profile.data.email,
          image: profile.data.profile_image_url?.replace("_normal.", "."),
          role: "user",
          isAdmin: false,
          isPremium: false
        }
      },
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          scope: "users.read tweet.read offline.access"
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();

          // Find user by email and explicitly include the password field
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password') as MongoDBUser;
          
          if (!user) {
            console.log('User not found:', credentials.email);
            throw new Error('Invalid email or password');
          }

          // Ensure password exists before comparing
          if (!user.password) {
            console.log('User has no password set:', credentials.email);
            throw new Error('Invalid email or password');
          }

          // Verify password
          const isValid = await user.comparePassword(credentials.password);
          
          if (!isValid) {
            console.log('Password verification failed for:', credentials.email);
            throw new Error('Invalid email or password');
          }

          // Return user data without password - keep it minimal
          return {
            id: String(user._id),
            name: user.username,
            email: user.email,
            image: user.avatar,
            isAdmin: user.isAdmin || false,
            isPremium: user.isPremium || false
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Invalid email or password');
        }
      }
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
    newUser: "/register"
  },
  session: {
    // Use JWT with minimal data to avoid large cookies
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours (reduced from 24 hours)
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.SECURE_COOKIES !== 'false' && process.env.NODE_ENV === 'production',
        maxAge: 12 * 60 * 60, // 12 hours in seconds
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();
        
        // Check if user exists
        let dbUser = await User.findOne({ 
          $or: [
            { email: user.email },
            { 'providers.providerId': account?.providerAccountId }
          ]
        }) as MongoDBUser | null;
        
        if (!dbUser) {
          // Create new user if doesn't exist
          dbUser = await User.create({
            email: user.email,
            username: user.name,
            avatar: user.image,
            providers: [{
              provider: account?.provider || 'credentials',
              providerId: account?.providerAccountId
            }]
          }) as MongoDBUser;
        } else if (account && dbUser.providers && !dbUser.providers.some((p: { providerId: string }) => p.providerId === account.providerAccountId)) {
          // Add new provider to existing user
          dbUser.providers = [
            ...(dbUser.providers || []),
            {
              provider: account.provider,
              providerId: account.providerAccountId
            }
          ];
          await dbUser.save();
        }
        
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // Only store essential user data in the token to keep it small
      if (user) {
        // Store only minimal data - just IDs and boolean flags
        token.id = user.id;
        token.isAdmin = !!user.isAdmin;
        token.isPremium = !!user.isPremium;
        
        // Don't store these in the token to keep it small
        delete token.name;
        delete token.email;
        delete token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Set minimal data from token
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isPremium = token.isPremium as boolean;
        
        // Load user data from DB only when needed
        try {
          const user = await User.findById(token.id).select('username email avatar');
          if (user) {
            session.user.name = user.username;
            session.user.email = user.email;
            session.user.image = user.avatar;
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key-change-in-production",
}; 