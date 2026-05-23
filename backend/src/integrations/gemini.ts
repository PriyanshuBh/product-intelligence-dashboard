import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { logger } from "../shared/utils/logger";

const KEY = process.env.GEMINI_API_KEY;
const client = KEY ? new GoogleGenerativeAI(KEY) : null;

export function isGeminiEnabled(): boolean {
  return client !== null;
}

export async function geminiJson<T>(
  prompt: string,
  schemaHint: string,
  parts: Part[] = []
): Promise<T | null> {
  if (!client) return null;
  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${prompt}\n\nReturn ONLY JSON matching this shape: ${schemaHint}`
            },
            ...parts
          ]
        }
      ],
      generationConfig: { responseMimeType: "application/json" }
    });
    const text = result.response.text();
    return JSON.parse(text) as T;
  } catch (e) {
    logger.warn({ err: e }, "gemini call failed; falling back");
    return null;
  }
}

export async function geminiVideoExtract(videoUrl: string): Promise<{
  title: string;
  brand: string;
  category: string;
  color: string | null;
  material: string | null;
  description: string;
} | null> {
  return geminiJson(
    "Watch this product video and extract product details for an e-commerce listing.",
    "{title:string,brand:string,category:string,color:string|null,material:string|null,description:string}",
    [{ text: `Video URL: ${videoUrl}` }]
  );
}
