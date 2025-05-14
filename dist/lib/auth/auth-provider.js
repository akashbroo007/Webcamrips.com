"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const react_2 = require("next-auth/react");
// Create the auth context
const AuthContext = (0, react_1.createContext)(undefined);
// Auth provider component
function AuthProvider({ children }) {
    const router = (0, navigation_1.useRouter)();
    const { data: session, status } = (0, react_2.useSession)();
    const [user, setUser] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (session?.user) {
            setUser(session.user);
        }
        else {
            setUser(null);
        }
    }, [session]);
    // Check if user is admin
    const isAdmin = user?.role === "admin";
    // Check if user is premium
    const isPremium = user?.role === "premium" || isAdmin;
    // Login function
    const login = async (email, password) => {
        try {
            const result = await (0, react_2.signIn)("credentials", {
                email,
                password,
                redirect: false,
            });
            if (result?.error) {
                return { success: false, error: result.error };
            }
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || "Failed to login" };
        }
    };
    // Register function
    const register = async (username, email, password) => {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.error || "Registration failed" };
            }
            // Auto login after successful registration
            const loginResult = await login(email, password);
            return loginResult;
        }
        catch (error) {
            return { success: false, error: error.message || "Failed to register" };
        }
    };
    // Logout function
    const logout = async () => {
        await (0, react_2.signOut)({ redirect: false });
        router.push("/");
    };
    const value = {
        user,
        status,
        login,
        register,
        logout,
        isAdmin,
        isPremium,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// Custom hook to use the auth context
function useAuth() {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
