import Groq from 'groq-sdk';

// Determine API key safely
const apiKey = process.env.GROQ_API_KEY || '';

export const groq = new Groq({ apiKey });

export const getGroqModel = (modelName: string = 'llama-3.3-70b-versatile') => {
  if (!apiKey) {
    console.warn('Warning: GROQ_API_KEY is missing or empty.');
  }
  return modelName;
};
