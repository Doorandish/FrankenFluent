import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
async function run() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: 'You are a helpful assistant.'
    });
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage('Hello');
    console.log(result.response.text());
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}
run();
