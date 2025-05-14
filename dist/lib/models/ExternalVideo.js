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
const ExternalVideoSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    sourceUrl: {
        type: String,
        required: true
    },
    embedUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    duration: {
        type: Number
    },
    sourceType: {
        type: String,
        required: true,
        enum: ['youtube', 'vimeo', 'direct', 'iframe', 'other']
    },
    sourceId: {
        type: String
    },
    platform: {
        type: String,
        required: true,
        enum: ['Chaturbate', 'Stripchat', 'BongaCams', 'LiveJasmin', 'MyFreeCams', 'Camsoda', 'Other']
    },
    performerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Performer'
    },
    performerName: {
        type: String
    },
    views: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
// Virtual for formatted duration
ExternalVideoSchema.virtual('formattedDuration').get(function () {
    if (!this.duration)
        return 'Unknown';
    const minutes = Math.floor(Number(this.duration) / 60);
    const seconds = Number(this.duration) % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});
// Increment view count
ExternalVideoSchema.methods.incrementViews = function () {
    this.views = Number(this.views || 0) + 1;
    return this.save();
};
// Create indexes
ExternalVideoSchema.index({ title: 'text', description: 'text' });
ExternalVideoSchema.index({ platform: 1 });
ExternalVideoSchema.index({ sourceType: 1 });
ExternalVideoSchema.index({ performerId: 1 });
ExternalVideoSchema.index({ isActive: 1 });
ExternalVideoSchema.index({ createdAt: -1 });
ExternalVideoSchema.index({ views: -1 });
// Create or get the model
let ExternalVideo;
try {
    // Try to get existing model
    ExternalVideo = mongoose_1.default.model('ExternalVideo');
}
catch {
    // Define model if it doesn't exist
    ExternalVideo = mongoose_1.default.model('ExternalVideo', ExternalVideoSchema);
}
exports.default = ExternalVideo;
