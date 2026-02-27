import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getNews() {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
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
      model: "gemini-3-flash-preview",
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
