import mongoose from 'mongoose';

interface IAssetRequest {
  asset: mongoose.Types.ObjectId;
  requestType: 'BORROW' | 'RETURN' | 'REPORT_ISSUE';
  requestedBy: mongoose.Types.ObjectId;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  startDate?: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  issueDescription?: string;
  issueImages?: { url: string; uploadedAt: Date; }[];
  adminNotes?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
}

const assetRequestSchema = new mongoose.Schema<IAssetRequest>({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  requestType: {
    type: String,
    enum: ['BORROW', 'RETURN', 'REPORT_ISSUE'],
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
    default: 'PENDING'
  },
  startDate: {
    type: Date,
    required: function(this: IAssetRequest) { 
      return this.requestType === 'BORROW';
    }
  },
  expectedReturnDate: {
    type: Date,
    required: function(this: IAssetRequest) { 
      return this.requestType === 'BORROW';
    }
  },
  actualReturnDate: {
    type: Date
  },
  issueDescription: {
    type: String,
    required: function(this: IAssetRequest) { 
      return this.requestType === 'REPORT_ISSUE';
    }
  },
  issueImages: [{
    url: String,
    uploadedAt: Date
  }],
  adminNotes: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date
}, {
  timestamps: true
});

// Add indexes for better query performance
assetRequestSchema.index({ asset: 1 });
assetRequestSchema.index({ requestedBy: 1 });
assetRequestSchema.index({ status: 1 });
assetRequestSchema.index({ requestType: 1 });

const AssetRequest = mongoose.models.AssetRequest || mongoose.model('AssetRequest', assetRequestSchema);

export default AssetRequest;
