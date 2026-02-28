import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/geminiKey";

let aiInstance: GoogleGenAI | null = null;

function getAi() {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return aiInstance;
}

export async function getNews() {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-2.0-flash",
      contents: "תן לי 5 כותרות חדשות מעניינות מהיום בעברית. תחזיר בפורמט JSON: { news: [{ title: string, summary: string }] }",
      config: {
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || '{"news": []}').news;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function getWeather(location: string = "Tel Aviv") {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-2.0-flash",
      contents: `מה מזג האוויר ב${location} כרגע? תן לי טמפרטורה ותיאור קצר בעברית. תחזיר בפורמט JSON: { temp: number, description: string }`,
      config: {
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || '{"temp": 25, "description": "נאה"}');
  } catch (error) {
    console.error("Error fetching weather:", error);
    return { temp: 22, description: "מעונן חלקית" };
  }
}
