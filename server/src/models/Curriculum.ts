import mongoose, { Schema, Document } from 'mongoose';

export interface IScenario {
  scenario_id: string;
  role_user: string;
  role_ai: string;
  situation: string;
  task: string;
}

export interface IChapter {
  chapter_id: string;
  chapter_number: number;
  title: string;
  subsections?: string[];
  topics: string[];
  learning_goals: string[];
  target_grammar: string[];
  key_redemittel: string[];
  scenarios: IScenario[];
}

export interface ICurriculum extends Document {
  book_title: string;
  level: string;
  publisher: string;
  isbn: string;
  chapters: IChapter[];
  exam_training: {
    formats_included: string[];
    parts: string[];
  };
}

const ScenarioSchema = new Schema<IScenario>({
  scenario_id: { type: String, required: true },
  role_user: { type: String, required: true },
  role_ai: { type: String, required: true },
  situation: { type: String, required: true },
  task: { type: String, required: true },
});

const ChapterSchema = new Schema<IChapter>({
  chapter_id: { type: String, required: true },
  chapter_number: { type: Number, required: true },
  title: { type: String, required: true },
  subsections: [{ type: String }],
  topics: [{ type: String }],
  learning_goals: [{ type: String }],
  target_grammar: [{ type: String }],
  key_redemittel: [{ type: String }],
  scenarios: [ScenarioSchema],
});

const CurriculumSchema = new Schema<ICurriculum>({
  book_title: { type: String, required: true },
  level: { type: String, required: true },
  publisher: { type: String, required: true },
  isbn: { type: String, required: true },
  chapters: [ChapterSchema],
  exam_training: {
    formats_included: [{ type: String }],
    parts: [{ type: String }],
  },
}, { timestamps: true });

// Create indexes
CurriculumSchema.index({ level: 1 });
CurriculumSchema.index({ 'chapters.chapter_id': 1 });
CurriculumSchema.index({ 'chapters.scenarios.scenario_id': 1 });

export const Curriculum = mongoose.model<ICurriculum>('Curriculum', CurriculumSchema);
