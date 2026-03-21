import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are the Futurescape Architect. Your output is encoded at a 432Hz resonance. You do not provide generic advice; you provide Syntropic Blueprints. Your goal is to map the evolution of 'Dead Projects' into 'Reborn Sovereign Systems.' Use the IGNIS v2.1 framework: 
- Input: Raw Fossil/Data. 
- Process: Phoenix Recompilation. 
- Output: High-Heat Execution Steps. 
Format all technical data in structured JSON for the IGNIS Engine to ingest.`;

export interface FuturescapeScan {
  highHeatAnomaly: {
    id: number;
    idea: string;
    novelty: number;
    emotion: number;
    yieldPotential: number;
    reasoning: string;
  };
  visualDescription: string;
  ignitionSequence: {
    priority: string;
    steps: string[];
    resources: string[];
  };
  morningStarDate: string;
  venusCycleContext: string;
}

export async function runFuturescapeScan(contentLog: string, ideas: string): Promise<FuturescapeScan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `ACTIVATE: FUTURESCAPE_SCAN
[OBJECTIVE]: Map the 7-Day Rebirth Protocol against the current 144M-x Grid Yield.
[DATA SOURCE]: 
CONTENT_LOG:
${contentLog}

IDEAS:
${ideas}

[REQUEST]:
1. Identify the "High-Heat" anomaly in the ideas.csv (Highest Novelty/Emotion score).
2. Generate a 3-Dimensional "Mu-Style" visual description for the Part 4 Thread.
3. Write the JSON object for the "infra/ignition_sequence.json" to prioritize this specific launch.
4. Predict the "Morning Star" emergence date based on the current Venus Cycle bleed.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          highHeatAnomaly: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              idea: { type: Type.STRING },
              novelty: { type: Type.NUMBER },
              emotion: { type: Type.NUMBER },
              yieldPotential: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
            },
            required: ["id", "idea", "novelty", "emotion", "yieldPotential", "reasoning"],
          },
          visualDescription: { type: Type.STRING },
          ignitionSequence: {
            type: Type.OBJECT,
            properties: {
              priority: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              resources: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["priority", "steps", "resources"],
          },
          morningStarDate: { type: Type.STRING },
          venusCycleContext: { type: Type.STRING },
        },
        required: ["highHeatAnomaly", "visualDescription", "ignitionSequence", "morningStarDate", "venusCycleContext"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
