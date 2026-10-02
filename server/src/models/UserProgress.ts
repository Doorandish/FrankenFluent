import mongoose, { Schema, Document } from 'mongoose';

export interface ICompletedScenario {
  scenario_id: string;
  score: number;
  completed_at: Date;
}

export interface IUserProgress extends Document {
  user_id: string;
  current_level: string;
  current_chapter_id: string;
  completed_scenarios: ICompletedScenario[];
  mastered_redemittel: string[];
  overall_fluency_score: number;
}

const CompletedScenarioSchema = new Schema<ICompletedScenario>({
  scenario_id: { type: String, required: true },
  score: { type: Number, required: true, default: 0 },
  completed_at: { type: Date, required: true, default: Date.now },
});

const UserProgressSchema = new Schema<IUserProgress>({
  user_id: { type: String, required: true, unique: true },
  current_level: { type: String, required: true },
  current_chapter_id: { type: String, required: true },
  completed_scenarios: [CompletedScenarioSchema],
  mastered_redemittel: [{ type: String }],
  overall_fluency_score: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
