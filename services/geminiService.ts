import { GoogleGenAI, Type } from "@google/genai";
import { HandAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHandGesture = async (base64Image: string): Promise<HandAnalysisResult> => {
  try {
    // Clean base64 string if it contains headers
    const data = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: data,
            },
          },
          {
            text: `Analyze the user's hand in this image for a 3D interactive controller.
            
            1. Determine if the hand is 'OPEN' (fingers spread/palm visible) or 'CLOSED' (fist/grabbing). 
               - If no hand is clearly visible, return 'UNKNOWN'.
               - OPEN signifies "Unleash Chaos".
               - CLOSED signifies "Form Structure".
            
            2. Estimate the center position of the hand within the frame relative to the center.
               - x: -1.0 (far left) to 1.0 (far right).
               - y: -1.0 (bottom) to 1.0 (top).
               - If no hand, return 0,0.
            `
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            state: {
              type: Type.STRING,
              enum: ["OPEN", "CLOSED", "UNKNOWN"],
            },
            position: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
              },
              required: ["x", "y"],
            },
          },
          required: ["state", "position"],
        },
      },
    });

    const text = response.text;
    if (!text) return { state: 'UNKNOWN', position: { x: 0, y: 0 } };

    return JSON.parse(text) as HandAnalysisResult;

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { state: 'UNKNOWN', position: { x: 0, y: 0 } };
  }
};