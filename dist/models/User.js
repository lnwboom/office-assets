"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'INACTIVE'],
        default: 'PENDING'
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});
// Add indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
// Method to verify password
userSchema.methods.verifyPassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        return false;
    }
};
// Method to check if user is active
userSchema.methods.isActive = function () {
    return this.status === 'ACTIVE';
};
const User = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
exports.default = User;
