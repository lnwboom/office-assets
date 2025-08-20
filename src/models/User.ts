import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
    username: string;
    password: string;
    email: string;
    fullName: string;
    department: string;
    role: 'ADMIN' | 'USER';
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    verifyPassword(candidatePassword: string): Promise<boolean>;
    isActive(): boolean;
}

const userSchema = new mongoose.Schema({
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
userSchema.methods.verifyPassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
};

// Method to check if user is active
userSchema.methods.isActive = function(): boolean {
    return this.status === 'ACTIVE';
};

// Method to check if user can login
userSchema.methods.canLogin = function(): boolean {
    return this.status !== 'INACTIVE';
};

const modelName = 'User';

// Export the model directly
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export { User };
export default User;
