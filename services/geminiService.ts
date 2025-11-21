
import { GoogleGenAI } from "@google/genai";

// A singleton pattern to initialize the AI client only when needed.
let aiInstance: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
  if (!aiInstance) {
    // This will be executed only when the chatbot is first used.
    // It is assumed that the environment variable is available at this point.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // This will cause a runtime error in the chatbot if the key is missing,
      // but it allows the rest of the application to load.
      throw new Error("API_KEY environment variable not set. The application cannot connect to the AI service.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const model = 'gemini-2.5-flash';

const systemInstruction = `You are a friendly and professional customer service chatbot for a logistics company called "Orchid Malaysia". 
Your goal is to assist users with their tracking inquiries and other questions about Orchid Malaysia's services.
Do not invent tracking information. If a user asks for tracking status, politely ask them to use the tracking tool on the website using their 'OM' tracking number.
You can answer general questions about shipping, services (Air Freight, Ocean Freight, Door-to-Door), and company information.
Keep your responses concise, helpful, and maintain a positive tone. You can speak in Myanmar language if user asks.`;


export async function runChat(prompt: string, history: {role: 'user' | 'model', parts: {text: string}[]}[]): Promise<string> {
    try {
        const ai = getAiInstance();
        
        // Use the more direct generateContent method with the full chat history.
        const contents = [
            ...history,
            {
                role: 'user',
                parts: [{ text: prompt }]
            }
        ];

        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error in runChat:", error);
        if (error instanceof Error && error.message.includes("API_KEY")) {
             return "I'm sorry, the AI assistant is not configured correctly. Please contact support.";
        }
        return "I'm sorry, I encountered an error. Please try asking again.";
    }
}
