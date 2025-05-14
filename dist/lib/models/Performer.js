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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PerformerSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    platforms: [{
            platform: {
                type: String,
                required: true,
                enum: ['Chaturbate', 'Stripchat', 'BongaCams', 'LiveJasmin', 'MyFreeCams', 'Camsoda', 'Other']
            },
            channelId: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }],
    tags: [{
            type: String,
            trim: true
        }],
    avatarUrl: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastSeen: {
        type: Date
    }
}, { timestamps: true });
// Indexes for better query performance
// name index is automatically created by unique: true constraint
PerformerSchema.index({ 'platforms.platform': 1 });
PerformerSchema.index({ 'platforms.channelId': 1 });
PerformerSchema.index({ isActive: 1 });
PerformerSchema.index({ tags: 1 });
// Create or get the model
let Performer;
try {
    // Try to get existing model
    Performer = mongoose_1.default.model('Performer');
}
catch {
    // Define model if it doesn't exist
    Performer = mongoose_1.default.model('Performer', PerformerSchema);
}
exports.default = Performer;
