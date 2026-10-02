import { GoogleGenerativeAI } from '@google/generative-ai';

// Determine API key safely
const apiKey = process.env.GEMINI_API_KEY || '';

export const genAI = new GoogleGenerativeAI(apiKey);

export const getModel = (modelName: string = 'gemini-1.5-flash') => {
  if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is missing or empty.');
  }
  return genAI.getGenerativeModel({ model: modelName });
};
