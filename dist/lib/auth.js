"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const google_1 = __importDefault(require("next-auth/providers/google"));
const twitter_1 = __importDefault(require("next-auth/providers/twitter"));
const db_1 = require("@/lib/utils/db");
const User_1 = __importDefault(require("@/lib/models/User"));
const logger_1 = require("@/lib/utils/logger");
exports.authOptions = {
    providers: [
        (0, google_1.default)({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        (0, twitter_1.default)({
            clientId: process.env.TWITTER_CLIENT_ID || "",
            clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
            version: "2.0",
        }),
        (0, credentials_1.default)({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }
                    // Connect to database
                    await (0, db_1.connectDB)();
                    // Find user by email
                    const user = await User_1.default.findOne({ email: credentials.email });
                    if (!user) {
                        return null;
                    }
                    // Check password
                    const isPasswordValid = await user.comparePassword(credentials.password);
                    if (!isPasswordValid) {
                        return null;
                    }
                    // Return user data (don't include password)
                    return {
                        id: user._id?.toString() || '',
                        name: user.username,
                        email: user.email,
                        image: user.avatar,
                        role: user.isAdmin ? "admin" : user.isPremium ? "premium" : "user",
                    };
                }
                catch (error) {
                    logger_1.apiLogger.error("Authentication error:", error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
        signOut: "/",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key-change-in-production",
    debug: process.env.NODE_ENV === "development",
};
