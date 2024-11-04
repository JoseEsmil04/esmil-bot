import { GoogleGenerativeAI } from "@google/generative-ai";

export const geminiChat = async (key: string, prompt: string) => {

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);

  return result.response.text()
}