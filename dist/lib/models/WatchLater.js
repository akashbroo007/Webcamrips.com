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
const WatchLaterSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    videoIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Video',
        }],
}, { timestamps: true });
// Ensure videoIds array doesn't exceed 100 items (requirement from spec)
WatchLaterSchema.pre('save', function (next) {
    if (this.videoIds.length > 100) {
        this.videoIds = this.videoIds.slice(-100); // Keep only the 100 most recent
    }
    next();
});
// Create indexes for better query performance
WatchLaterSchema.index({ userId: 1 });
// Create or get the model
let WatchLater;
try {
    // Try to get existing model
    WatchLater = mongoose_1.default.model('WatchLater');
}
catch {
    // Define model if it doesn't exist
    WatchLater = mongoose_1.default.model('WatchLater', WatchLaterSchema);
}
exports.default = WatchLater;
