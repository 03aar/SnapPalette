import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Define the response schema for structured JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    colors: {
      type: Type.OBJECT,
      properties: {
        primary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING },
              role: { type: Type.STRING, enum: ['background', 'primary', 'secondary', 'accent', 'text', 'neutral'] },
              usage: { type: Type.NUMBER },
              name: { type: Type.STRING }
            },
            required: ['hex', 'role', 'usage']
          }
        },
        extended: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING },
              role: { type: Type.STRING },
              usage: { type: Type.NUMBER }
            },
            required: ['hex', 'role']
          }
        }
      },
      required: ['primary', 'extended']
    },
    typography: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          fontFamilyGuess: { type: Type.STRING },
          fontSizePx: { type: Type.NUMBER },
          fontWeight: { type: Type.NUMBER },
          lineHeightPx: { type: Type.NUMBER },
          letterSpacingPx: { type: Type.NUMBER }
        },
        required: ['id', 'label', 'fontFamilyGuess', 'fontSizePx', 'fontWeight']
      }
    },
    spacing: {
      type: Type.OBJECT,
      properties: {
        rawDistances: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        scale: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        baseUnit: { type: Type.NUMBER }
      },
      required: ['rawDistances', 'scale', 'baseUnit']
    }
  },
  required: ['colors', 'typography', 'spacing']
};

export const analyzeScreenshot = async (file: File): Promise<AnalysisResult> => {
  if (!API_KEY) throw new Error("API Key is missing");

  const base64Data = await fileToGenerativePart(file);
  
  const prompt = `
    Analyze this UI screenshot thoroughly. Act as a senior design systems engineer.
    
    1. Colors: Extract the primary palette (backgrounds, brand colors, text) and an extended palette. Assign semantic roles.
    2. Typography: Identify distinct text styles (Headings, Body, Captions, Buttons). Estimate font family (e.g., Inter, Roboto, SF Pro, Playfair), size in pixels, weight, and line-height.
    3. Spacing: Analyze the whitespace between elements (padding, margins, gaps). Infer a spacing scale (e.g., 4, 8, 16...).
    
    Return the data in strict JSON format matching the provided schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.1, // Low temperature for deterministic analysis
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);

    return {
      id: `snap_${Date.now()}`,
      timestamp: Date.now(),
      imageUrl: URL.createObjectURL(file),
      ...data
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
