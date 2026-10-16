
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-3.5-flash-lite";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const generateContent = async (prompt) => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      const message = error.message || String(error);
      const isTemporary =
        /503|UNAVAILABLE|429|RESOURCE_EXHAUSTED|500|502|504|INTERNAL|TIMEOUT/i.test(
          message
        );

      console.error(
        `Gemini attempt ${attempt}/${maxAttempts} failed:`,
        message
      );

      if (!isTemporary || attempt === maxAttempts) {
        throw new Error(
          `Gemini API failed after ${attempt} attempt(s): ${message}`
        );
      }

      const delay = 2000 * 2 ** (attempt - 1);
      console.log(`Retrying Gemini in ${delay / 1000} seconds...`);

      await sleep(delay);
    }
  }
};

export { generateContent };
