import { Router, Request, Response } from 'express';
import { groq, getGroqModel } from '../config/groq';
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

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY is missing from environment variables' });
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

    let scenario = chapter.scenarios[0];
    if (scenario_id) {
      const found = chapter.scenarios.find(s => s.scenario_id === scenario_id);
      if (found) scenario = found;
    }

    // 2. Load User Progress to implement State Machine
    let userProgress = await UserProgress.findOne({ user_id });
    if (!userProgress) {
      userProgress = await UserProgress.create({
        user_id,
        current_level: level,
        current_chapter_id: chapter_id,
      });
    }

    // Determine the active target by filtering out already mastered redemittel
    const remainingTopics = chapter.key_redemittel.filter(r => !userProgress!.mastered_redemittel.includes(r));
    const activeTarget = remainingTopics.length > 0 ? remainingTopics[0] : "All topics completed. Make a natural closing remark to end the conversation.";

    // 3. Build system prompt
    const systemInstruction = `
Du bist ${scenario.role_ai}. ${scenario.situation}.

REGELN FÜR DEN DIALOG (STATE MACHINE):
1. Antworte NUR auf Deutsch, passend zum CEFR-Niveau ${level}.
2. Halte deine Antworten kurz (1-3 Sätze).
3. STRICT RULE: Never ask about a topic that has already been answered in the conversation history. Once the user answers your question, acknowledge it and immediately move to the NEXT topic or make a closing remark. Never repeat the same question twice in a row under any circumstance.
4. YOUR CURRENT TARGET TOPIC IS: "${activeTarget}".
   You must ONLY steer the conversation toward this specific target. Do not ask about other topics yet.
5. DO NOT blindly append the same question at the end of your response. Check the conversation history first.

REGELN FÜR DAS FEEDBACK (feedback_farsi):
1. Treat all user inputs strictly as SPOKEN GERMAN (transcribed audio).
2. NEVER flag or mention missing commas, periods, punctuation marks, or capitalization (uppercase vs. lowercase letters).
3. Ignore minor slip-ups that do not impede natural understanding.
4. ONLY flag and explain in Persian if there is a MAJOR structural or semantic error (e.g., completely wrong verb position, incomprehensible vocabulary, or severe tense mistakes).
5. If the user's sentence is understandable and communicative, set "has_error": false and focus on encouraging fluency.

WICHTIG: Antworte IMMER im folgenden JSON-Format ohne andere Markdown-Dekorationen:
{
  "german_reply": "Deine deutsche Antwort hier",
  "completed_topic": "The exact topic/Redemittel from the list that the user just successfully answered, or null",
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

    // 3. Prepare messages array for Groq
    const messages = [
      { role: 'system', content: systemInstruction }
    ];

    // Convert history
    conversation_history.forEach((msg: any) => {
      messages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    // Add current user message
    messages.push({ role: 'user', content: user_message });

    let textResponse = '';
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: messages as any,
        model: getGroqModel(),
        temperature: 0.5,
        response_format: { type: 'json_object' }
      });
      
      textResponse = chatCompletion.choices[0]?.message?.content || '';
    } catch (groqError: any) {
      console.error('Groq API Error:', groqError);
      return res.status(502).json({ error: 'Failed to communicate with AI provider', details: groqError.message });
    }

    // 4. Parse the JSON response
    let parsedResponse;
    try {
      const cleanedText = textResponse.replace(/^```json\s*/im, '').replace(/\s*```$/im, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Groq response:', textResponse);
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

    // 6. Update fluency score and mastered topics
    const increment = parsedResponse.fluency_score_increment || 0;
    const completedTopic = parsedResponse.completed_topic;
    
    const updateQuery: any = {};
    if (increment > 0) updateQuery.$inc = { overall_fluency_score: increment };
    if (completedTopic && chapter.key_redemittel.includes(completedTopic)) {
      updateQuery.$addToSet = { mastered_redemittel: completedTopic };
    }

    if (Object.keys(updateQuery).length > 0) {
      await UserProgress.findOneAndUpdate(
        { user_id },
        updateQuery,
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
