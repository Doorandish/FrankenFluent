export interface Scenario { 
  scenario_id: string; 
  role_user: string; 
  role_ai: string; 
  situation: string; 
  task: string; 
}

export interface Chapter { 
  chapter_id: string; 
  chapter_number: number; 
  title: string; 
  subsections?: string[]; 
  topics: string[]; 
  learning_goals: string[]; 
  target_grammar: string[]; 
  key_redemittel: string[]; 
  scenarios: Scenario[]; 
}

export interface Curriculum { 
  _id: string; 
  book_title: string; 
  level: string; 
  publisher: string; 
  isbn: string; 
  chapters: Chapter[]; 
  exam_training: { 
    formats_included: string[]; 
    parts: string[]; 
  }; 
}

export interface FeedbackEnglish { 
  has_error: boolean; 
  user_mistake: string | null; 
  correct_version: string | null; 
  explanation: string | null; 
}

export interface AIResponse { 
  german_reply: string; 
  completed_topic?: string | null; 
  feedback_english: FeedbackEnglish; 
  fluency_score_increment: number; 
}

export interface ChatMessage { 
  id: string; 
  role: 'user' | 'ai'; 
  content: string; 
  aiResponse?: AIResponse; 
  timestamp: Date; 
}

export interface UserProgress { 
  user_id: string; 
  current_level: string; 
  current_chapter_id: string; 
  completed_scenarios: { 
    scenario_id: string; 
    score: number; 
    completed_at: string; 
  }[]; 
  mastered_redemittel: string[]; 
  overall_fluency_score: number; 
}

export interface Mistake { 
  _id: string; 
  user_id: string; 
  chapter_id: string; 
  original_text: string; 
  corrected_text: string; 
  error_category: string; 
  explanation: string; 
  reviewed: boolean; 
  created_at: string; 
}

export interface ChatRequest {
  user_id: string;
  level: string;
  chapter_id: string;
  scenario_id: string;
  user_message: string;
  conversation_history: { role: string; content: string }[];
}
