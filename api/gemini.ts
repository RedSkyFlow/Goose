import { GoogleGenAI, Type } from "@google/genai";
import type { Deal, GeneratedProposalContent, Interaction } from '../types';

// This file acts as a secure backend proxy.
// The API key is only ever used here, on the "server-side".
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const handleSummarize = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following text into a concise paragraph, focusing on key decisions and action items:\n\n---\n${text}\n---`,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "Error: Could not generate summary.";
  }
};

export const handleGetNextBestAction = async (deal: Deal, interactions: Interaction[]): Promise<string> => {
  const timelineSummary = interactions
    .map(interaction => `[${interaction.timestamp} - ${interaction.type} by ${interaction.author?.name || 'Unknown'}]: ${interaction.ai_summary || interaction.content_raw.substring(0, 150)}...`)
    .join('\n');

  const prompt = `
    You are an expert sales co-pilot. Based on the following deal information and interaction history, suggest the single, most impactful "next best action" for the sales representative to take to move this deal forward. Be concise and actionable.

    Deal: ${deal.deal_name}
    Value: $${deal.value.toLocaleString()}
    Current Stage: ${deal.stage}

    Interaction History:
    ${timelineSummary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting next best action:", error);
    return "Error: Could not suggest an action.";
  }
};

export const handleGenerateProposal = async (deal: Deal, interactions: Interaction[]): Promise<GeneratedProposalContent> => {
  const timelineSummary = interactions
    .map(interaction => `On ${interaction.timestamp}, a ${interaction.type} interaction occurred. Content: ${interaction.ai_summary || interaction.content_raw}`)
    .join('\n\n');

  const prompt = `
    Analyze the following interaction history for the deal "${deal.deal_name}" and generate a structured sales proposal in JSON format.
    
    Interaction History:
    ---
    ${timelineSummary}
    ---
    
    Based on the history, identify the client's primary pain points and needs. Then, craft a compelling proposal that addresses these needs. The output must be a valid JSON object following the specified schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            introduction: {
              type: Type.STRING,
              description: 'A brief, engaging introduction for the proposal.',
            },
            clientNeeds: {
              type: Type.STRING,
              description: "A summary of the client's identified needs and pain points, written from a perspective of understanding their challenges.",
            },
            proposedSolution: {
              type: Type.STRING,
              description: 'A description of the proposed solution that directly addresses the client needs.',
            },
            pricing: {
              type: Type.STRING,
              description: `A placeholder for the pricing section, set to the value of the deal which is $${deal.value.toLocaleString()}. For example: "The total investment for this solution is $${deal.value.toLocaleString()}."`,
            },
          },
          required: ["introduction", "clientNeeds", "proposedSolution", "pricing"],
        },
      },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString) as GeneratedProposalContent;

  } catch (error) {
    console.error("Error generating proposal:", error);
    return {
        introduction: "Error generating proposal.",
        clientNeeds: "Could not analyze client needs.",
        proposedSolution: "There was an error creating the solution.",
        pricing: "N/A"
    };
  }
};
