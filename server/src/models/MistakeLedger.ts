import mongoose, { Schema, Document } from 'mongoose';

export interface IMistake extends Document {
  user_id: string;
  chapter_id: string;
  original_text: string;
  corrected_text: string;
  error_category: 'Grammar' | 'Word Choice' | 'Word Order' | 'Preposition' | 'Other';
  explanation_farsi: string;
  reviewed: boolean;
  created_at: Date;
}

const MistakeLedgerSchema = new Schema<IMistake>({
  user_id: { type: String, required: true },
  chapter_id: { type: String, required: true },
  original_text: { type: String, required: true },
  corrected_text: { type: String, required: true },
  error_category: { 
    type: String, 
    enum: ['Grammar', 'Word Choice', 'Word Order', 'Preposition', 'Other'],
    required: true,
    default: 'Grammar'
  },
  explanation_farsi: { type: String, required: true },
  reviewed: { type: Boolean, required: true, default: false },
  created_at: { type: Date, required: true, default: Date.now },
});

// Indexes for common lookups
MistakeLedgerSchema.index({ user_id: 1, chapter_id: 1 });

export const MistakeLedger = mongoose.model<IMistake>('MistakeLedger', MistakeLedgerSchema);
