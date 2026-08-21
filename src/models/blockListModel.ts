import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlocklist extends Document {
  ip: string;
  email: string;
  createdAt: Date;
}

const blocklistSchema: Schema<IBlocklist> = new Schema(
  {
    ip: { type: String, required: false, index: true },
    email: { type: String, required: false, index: true },
    createdAt: { type: Date, default: Date.now }
  }
);

blocklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); 

const Blocklist: Model<IBlocklist> = mongoose.model<IBlocklist>('Blocklist', blocklistSchema);

export default Blocklist;
