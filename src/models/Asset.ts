import mongoose from 'mongoose';
import { IUser } from './User';

export interface IAsset extends mongoose.Document {
    code: string;
    name: string;
    type: string;
    status: 'IN_USE' | 'AVAILABLE' | 'BROKEN' | 'MAINTENANCE';
    description?: string;
    purchaseDate: Date;
    currentHolder?: IUser['_id'];
    lastInspectionDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const assetSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    status: {
        type: String,
        required: true,
        enum: ['IN_USE', 'AVAILABLE', 'BROKEN', 'MAINTENANCE']
    },
    description: { 
        type: String 
    },
    purchaseDate: { 
        type: Date, 
        required: true 
    },
    currentHolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    lastInspectionDate: { 
        type: Date 
    },
}, {
    timestamps: true
});

// Add index for better query performance
assetSchema.index({ status: 1 });
assetSchema.index({ currentHolder: 1 });

const modelName = 'Asset';

// Try to get existing model or create a new one
let Asset: mongoose.Model<IAsset>;

if (mongoose.models && mongoose.models[modelName]) {
    Asset = mongoose.models[modelName] as mongoose.Model<IAsset>;
} else {
    Asset = mongoose.model<IAsset>(modelName, assetSchema);
}

export default Asset;
