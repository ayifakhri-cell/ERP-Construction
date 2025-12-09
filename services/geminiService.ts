import { GoogleGenAI, Type, FunctionDeclaration, Schema } from "@google/genai";
import { MODEL_FAST, SYSTEM_INSTRUCTION_ACCOUNTING, SYSTEM_INSTRUCTION_PROCUREMENT, SYSTEM_INSTRUCTION_SAFETY, SAFETY_HANDBOOK_CONTENT } from "../constants.ts";
import { ExtractedInvoice } from "../types.ts";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Multimodal Invoice Extraction (Pattern 3.1) ---

export const extractInvoiceData = async (fileBase64: string, mimeType: string): Promise<ExtractedInvoice> => {
  const model = MODEL_FAST;
  
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      invoiceId: { type: Type.STRING, description: "Unique Invoice Number" },
      vendorName: { type: Type.STRING },
      date: { type: Type.STRING, description: "YYYY-MM-DD format" },
      totalAmount: { type: Type.NUMBER },
      currency: { type: Type.STRING },
      glAccountCode: { type: Type.STRING, description: "Suggested GL Account (e.g., 5000-Materials, 6000-Services)" },
      confidenceScore: { type: Type.NUMBER, description: "Overall confidence 0.0 to 1.0" },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unitPrice: { type: Type.NUMBER },
            total: { type: Type.NUMBER },
            glAccount: { type: Type.STRING }
          }
        }
      }
    },
    required: ["invoiceId", "vendorName", "totalAmount", "glAccountCode", "items", "confidenceScore"]
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: fileBase64
          }
        },
        {
          text: "Analyze this construction invoice. Extract key fields into the structured JSON format. Pay attention to the Invoice Number and Total Amount for reconciliation."
        }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_ACCOUNTING,
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  });

  if (!response.text) {
    throw new Error("No data extracted from Gemini");
  }

  return JSON.parse(response.text) as ExtractedInvoice;
};

// --- Natural Language to SQL/Query (Pattern 3.2) ---

export const generateAnalysisQuery = async (userQuery: string, schemaDescription: string): Promise<{ sql: string; explanation: string }> => {
  const model = MODEL_FAST;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      sql: { type: Type.STRING, description: "The BigQuery compatible SQL query" },
      explanation: { type: Type.STRING, description: "Brief explanation of the logic" }
    }
  };

  const prompt = `
    User Request: "${userQuery}"
    
    Database Schema (BigQuery):
    ${schemaDescription}
    
    Generate a valid SQL query to answer the user's request.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      systemInstruction: "You are a Data Engineer expert in BigQuery for Construction ERPs."
    }
  });

   if (!response.text) {
    throw new Error("Failed to generate query");
  }

  return JSON.parse(response.text);
};


// --- Procurement Agent with Tools (Pattern 3.3) ---

const checkMaterialPriceDecl: FunctionDeclaration = {
  name: "check_material_price",
  description: "Get the real-time market price for a construction material code.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      material_code: { type: Type.STRING, description: "e.g., 'SS_BAR_A', 'CEMENT_40'" }
    },
    required: ["material_code"]
  }
};

// Mock Tool Implementation
export const mockMarketPriceTool = (materialCode: string): number => {
  const code = materialCode.toUpperCase();
  if (code.includes("SS_BAR")) return 12.50; // Price per unit
  if (code.includes("CEMENT")) return 8.75;
  if (code.includes("BRICK")) return 0.85;
  if (code.includes("LUMBER") || code.includes("WOOD")) return 15.00;
  return 50.00; // default
};

export const createProcurementSession = () => {
  return ai.chats.create({
    model: MODEL_FAST,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_PROCUREMENT,
      tools: [{ functionDeclarations: [checkMaterialPriceDecl] }]
    }
  });
};

// --- Grounded Project Assistant (Pattern 3.4 - RAG) ---

export const queryProjectKnowledgeBase = async (userQuery: string): Promise<string> => {
  const model = MODEL_FAST;
  
  // In a real implementation, we would use Vertex AI Search or a Vector DB here to retrieve relevant chunks.
  // For this demo, we inject the specific Handbook Content into the context.
  
  const prompt = `
  Context (Project Alpha Handbook):
  ${SAFETY_HANDBOOK_CONTENT}

  User Query: ${userQuery}

  Answer strictly based on the context above.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_SAFETY,
    }
  });

  return response.text || "I could not find an answer in the handbook.";
};