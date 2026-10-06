import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { Curriculum } from '../models/Curriculum';
import { UserProgress } from '../models/UserProgress';
import { groq } from '../config/groq';

vi.mock('../models/Curriculum');
vi.mock('../models/UserProgress');
vi.mock('../models/MistakeLedger');
vi.mock('../config/groq', () => ({
  groq: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
  getGroqModel: vi.fn().mockReturnValue('llama-3.3-70b-versatile'),
}));

describe('Chat API Route (/api/chat)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROQ_API_KEY = 'test_groq_api_key';
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ user_id: 'test_user' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required fields');
  });

  it('should return 500 if GROQ_API_KEY is missing', async () => {
    const originalKey = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    const res = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'test_user',
        chapter_id: 'ch1',
        level: 'A2',
        user_message: 'Hallo',
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toContain('GROQ_API_KEY is missing');

    process.env.GROQ_API_KEY = originalKey;
  });

  it('should return 404 if curriculum level is not found', async () => {
    (Curriculum.findOne as any).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'user_123',
        chapter_id: 'ch1',
        level: 'C2',
        user_message: 'Guten Tag',
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Curriculum level not found');
  });

  it('should process conversation, invoke Groq model, and return formatted response', async () => {
    const mockChapter = {
      chapter_id: 'ch1',
      title: 'Kennenlernen',
      key_redemittel: ['Ich heiße...', 'Wie geht es dir?'],
      target_grammar: ['Präsens', 'W-Fragen'],
      scenarios: [
        {
          scenario_id: 'sc1',
          role_user: 'Student',
          role_ai: 'Professor',
          situation: 'First meeting at university',
          task: 'Introduce yourself',
        },
      ],
    };

    (Curriculum.findOne as any).mockResolvedValue({
      level: 'A2',
      chapters: [mockChapter],
    });

    (UserProgress.findOne as any).mockResolvedValue({
      user_id: 'user_123',
      current_level: 'A2',
      current_chapter_id: 'ch1',
      mastered_redemittel: [],
      overall_fluency_score: 50,
      save: vi.fn().mockResolvedValue(true),
    });

    const aiJsonResponse = JSON.stringify({
      german_reply: 'Hallo! Schön dich kennenzulernen. Wie heißt du denn?',
      used_target_redemittel: true,
      feedback_english: {
        has_error: false,
        user_mistake: null,
        correct_version: null,
        explanation: null,
      },
      fluency_score_increment: 5,
    });

    (groq.chat.completions.create as any).mockResolvedValue({
      choices: [
        {
          message: {
            content: aiJsonResponse,
          },
        },
      ],
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'user_123',
        chapter_id: 'ch1',
        level: 'A2',
        user_message: 'Hallo, ich bin Max.',
        conversation_history: [],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('german_reply');
    expect(res.body.german_reply).toBe('Hallo! Schön dich kennenzulernen. Wie heißt du denn?');
    expect(res.body).toHaveProperty('used_target_redemittel', true);
    expect(res.body).toHaveProperty('feedback_english');
    expect(res.body.feedback_english.has_error).toBe(false);
    expect(res.body).toHaveProperty('fluency_score_increment', 5);
  });

  it('should handle Groq API failures with 502 Bad Gateway', async () => {
    const mockChapter = {
      chapter_id: 'ch1',
      key_redemittel: ['Hallo'],
      target_grammar: [],
      scenarios: [{ scenario_id: 'sc1', role_user: 'User', role_ai: 'AI', situation: 'Sit', task: 'Task' }],
    };

    (Curriculum.findOne as any).mockResolvedValue({
      level: 'A2',
      chapters: [mockChapter],
    });

    (UserProgress.findOne as any).mockResolvedValue({
      user_id: 'user_123',
      mastered_redemittel: [],
    });

    (groq.chat.completions.create as any).mockRejectedValue(new Error('Rate limit exceeded'));

    const res = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'user_123',
        chapter_id: 'ch1',
        level: 'A2',
        user_message: 'Hallo',
      });

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error', 'Failed to communicate with AI provider');
    expect(res.body.details).toContain('Rate limit exceeded');
  });
});
