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
const VideoSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String
    },
    duration: {
        type: Number,
        default: 0
    },
    fileSize: {
        type: Number
    },
    views: {
        type: Number,
        default: 0
    },
    platform: {
        type: String,
        required: true,
        enum: ['Chaturbate', 'Stripchat', 'BongaCams', 'LiveJasmin', 'MyFreeCams', 'Camsoda', 'Other']
    },
    performerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Performer',
        required: true
    },
    tags: [{
            type: String,
            trim: true
        }],
    uploadedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User', // In this case will be Performer, but could be admin user too
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    recordedAt: {
        type: Date
    },
    recordingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Recording'
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    codec: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Add virtual fields for formatted values
VideoSchema.virtual('formattedDuration').get(function () {
    const seconds = this.duration || 0;
    const minutes = Math.floor(Number(seconds) / 60);
    const remainingSeconds = Math.floor(Number(seconds) % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
});
VideoSchema.virtual('formattedFileSize').get(function () {
    if (!this.fileSize)
        return 'Unknown';
    const bytes = Number(this.fileSize);
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0)
        return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
});
// Add view count method
VideoSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save();
};
// Add like/dislike methods
VideoSchema.methods.toggleLike = function (userId) {
    // In a real application, you would track which users have liked/disliked
    // and prevent duplicate actions
    this.likes += 1;
    return this.save();
};
VideoSchema.methods.toggleDislike = function (userId) {
    this.dislikes += 1;
    return this.save();
};
// Indexes for better query performance
VideoSchema.index({ title: 'text', description: 'text' });
VideoSchema.index({ performerId: 1 });
VideoSchema.index({ platform: 1 });
VideoSchema.index({ tags: 1 });
VideoSchema.index({ isPublic: 1 });
VideoSchema.index({ createdAt: -1 });
VideoSchema.index({ views: -1 });
VideoSchema.index({ recordingId: 1 });
VideoSchema.index({ recordedAt: -1 });
// Create or get the model
let Video;
try {
    // Try to get existing model
    Video = mongoose_1.default.model('Video');
}
catch {
    // Define model if it doesn't exist
    Video = mongoose_1.default.model('Video', VideoSchema);
}
exports.default = Video;
