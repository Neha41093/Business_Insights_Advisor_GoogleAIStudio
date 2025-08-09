
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { CsvData, ChartData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function csvDataToString(data: CsvData): string {
    const header = data.headers.join(',');
    const rows = data.rows.map(row => row.join(',')).join('\n');
    return `${header}\n${rows}`;
}

export const getChatbotResponseStream = async (question: string, data: CsvData): Promise<AsyncGenerator<GenerateContentResponse> | { error: string }> => {
  try {
    const csvString = csvDataToString(data);
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are a professional and insightful business analyst chatbot. Your task is to analyze the provided CSV data to answer the user's question.
- First, provide a clear, concise, and actionable insight based on the user's question. Format your response using markdown for readability (e.g., use bullet points for lists).
- If the user's query can be better understood with a visualization (like 'show me a chart of sales per region'), then after your textual response, add a special separator on a new line: '||CHART_DATA||'.
- Immediately following the separator, provide a single, valid JSON object for the chart. Do not include any other text or markdown formatting around the JSON.
- The chart JSON must have 'type' ('bar', 'line', or 'pie'), 'title', and 'data' (an array of objects with 'name' and 'value').
- If a chart is not relevant, do not include the separator or the JSON object.
- Base all your answers and chart data strictly on the provided dataset. Do not make up information.
- If the question cannot be answered with the given data, state that clearly in your textual response.
- **Crucially, do not repeat or show the raw data from the CSV in your response.** Your answer should present only the final answer, logic, or insights derived from the data.`;
    
    const prompt = `Here is the data in CSV format:\n\n\`\`\`csv\n${csvString}\n\`\`\`\n\nNow, please answer the following question: ${question}`;

    const response = await ai.models.generateContentStream({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        }
    });
    
    return response;

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `I'm sorry, but I encountered an error: ${errorMessage}` };
  }
};
