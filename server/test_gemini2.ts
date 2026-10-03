import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('mock');
async function run() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: 'test'
    });
    
    // Simulate what the frontend sends for history
    const history = [
      { role: 'user', parts: [{ text: 'hallo' }] },
      { role: 'model', parts: [{ text: 'hallo back' }] },
      { role: 'ai', parts: [{ text: 'wrong role' }] } // Wait, our code maps 'ai' to 'model'. 
    ];
    
    const chat = model.startChat({ history: [] }); // Wait, is there a 400 Bad request for our payload?
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}
run();
