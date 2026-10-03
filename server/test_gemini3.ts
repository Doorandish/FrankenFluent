import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({ 
      history: [
        { role: 'user', parts: [{ text: 'Hello' }] }
      ] 
    });
    const result = await chat.sendMessage('Hello again');
    console.log(result.response.text());
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}
run();
