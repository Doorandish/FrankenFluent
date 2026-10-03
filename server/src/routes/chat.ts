import { Router, Request, Response } from 'express';
import { genAI } from '../config/gemini';
import { Curriculum } from '../models/Curriculum';
import { MistakeLedger } from '../models/MistakeLedger';
import { UserProgress } from '../models/UserProgress';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, chapter_id, level, user_message, conversation_history = [], scenario_id } = req.body;

    if (!user_id || !chapter_id || !level || !user_message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing from environment variables' });
    }

    // 1. Load the chapter
    const curriculum = await Curriculum.findOne({ level });
    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum level not found' });
    }

    const chapter = curriculum.chapters.find(c => c.chapter_id === chapter_id);
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Get the specific scenario if provided, otherwise pick the first one
    let scenario = chapter.scenarios[0];
    if (scenario_id) {
      const found = chapter.scenarios.find(s => s.scenario_id === scenario_id);
      if (found) scenario = found;
    }

    // 2. Build system prompt
    const systemInstruction = `
Du bist ${scenario.role_ai}. ${scenario.situation}.

REGELN:
1. Antworte NUR auf Deutsch, passend zum CEFR-Niveau ${level}.
2. Halte deine Antworten kurz (1-3 Sätze).
3. Ermutige den Benutzer, folgende Redemittel zu verwenden: ${chapter.key_redemittel.join(', ')}
4. Zielgrammatik: ${chapter.target_grammar.join(', ')}
5. Prüfe die Nachricht des Benutzers auf grammatische Fehler.

WICHTIG: Antworte IMMER im folgenden JSON-Format ohne andere Markdown-Dekorationen:
{
  "german_reply": "Deine deutsche Antwort hier",
  "used_target_redemittel": true/false,
  "feedback_farsi": {
    "has_error": true/false,
    "user_mistake": "Der fehlerhafte Satz" oder null,
    "correct_version": "Die korrigierte Version" oder null,
    "explanation": "توضیح به فارسی" oder null,
    "error_category": "Grammar" | "Word Choice" | "Word Order" | "Preposition" | "Other"
  },
  "fluency_score_increment": 0-10
}
    `.trim();

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction
    });
    
    // Convert history to Gemini format
    const contents = conversation_history.map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    let textResponse = '';
    try {
      const chat = model.startChat({
        history: contents
      });
      const result = await chat.sendMessage(user_message);
      textResponse = result.response.text();
    } catch (geminiError: any) {
      console.error('Gemini API Error:', geminiError);
      return res.status(502).json({ error: 'Failed to communicate with AI provider', details: geminiError.message });
    }

    // 4. Parse the JSON response
    let parsedResponse;
    try {
      // Strip out markdown code blocks if Gemini returned them
      const cleanedText = textResponse.replace(/^```json\s*/im, '').replace(/\s*```$/im, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', textResponse);
      return res.status(500).json({ error: 'AI returned invalid formatting', raw_response: textResponse });
    }

    // 5. Save mistake if found
    const feedback = parsedResponse.feedback_farsi;
    if (feedback && feedback.has_error && feedback.user_mistake) {
      await MistakeLedger.create({
        user_id,
        chapter_id,
        original_text: feedback.user_mistake,
        corrected_text: feedback.correct_version || '',
        error_category: feedback.error_category || 'Grammar',
        explanation_farsi: feedback.explanation || '',
      });
    }

    // 6. Update fluency score
    const increment = parsedResponse.fluency_score_increment || 0;
    if (increment > 0) {
      await UserProgress.findOneAndUpdate(
        { user_id },
        { $inc: { overall_fluency_score: increment } },
        { upsert: true }
      );
    }

    // 7. Return parsed response
    res.json(parsedResponse);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the chat turn', details: error.message });
  }
});

export default router;
