"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [20, 'Username cannot exceed 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    avatar: {
        type: String,
        default: '/images/default-avatar.jpg'
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    premiumExpiry: {
        type: Date
    },
    favorites: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Video'
        }],
    uploadCount: {
        type: Number,
        default: 0
    },
    lastLogin: {
        type: Date
    }
}, { timestamps: true });
// Password hashing middleware
UserSchema.pre('save', async function (next) {
    // Need to explicitly use function syntax to have proper 'this' context
    const doc = this;
    // Check if password was modified
    if (!doc.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        // Force type assertion since we know it's a string at this point
        doc.set('password', await bcryptjs_1.default.hash(doc.get('password'), salt));
        next();
    }
    catch (error) {
        next(error);
    }
});
// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
// Remove the explicit indexes since they're already defined in the schema via unique: true
// Instead, only add index for isPremium which isn't defined with unique: true in the schema
UserSchema.index({ isPremium: 1 });
// Create or get the model
let User;
try {
    // Try to get existing model
    User = mongoose_1.default.model('User');
}
catch {
    // Define model if it doesn't exist
    User = mongoose_1.default.model('User', UserSchema);
}
exports.default = User;
