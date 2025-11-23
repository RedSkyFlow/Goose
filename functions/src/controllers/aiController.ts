import { Request, Response } from 'express';
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const summarize = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize the following text into a concise paragraph, focusing on key decisions and action items:\n\n---\n${text}\n---`
        });
        res.json({ summary: response.text });
    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ error: 'AI summarization failed' });
    }
};

export const generateProposal = async (req: Request, res: Response) => {
    try {
        const { deal, interactions } = req.body;
        // Deal and Interactions come from frontend state for now
        
        const prompt = `
            You are an expert B2B proposal writer named Goose. 
            Deal: "${deal.deal_name}", Value: $${deal.value}.
            Generate a structured JSON proposal.
        `;
        
        // Simplified schema for brevity, matches frontend expectation
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        proposalTitle: { type: Type.STRING },
                        clientName: { type: Type.STRING },
                        executiveSummary: { type: Type.STRING },
                        clientChallenges: { type: Type.STRING },
                        solutionItems: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    features: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    price: { type: Type.NUMBER },
                                    type: { type: Type.STRING },
                                    quantity: { type: Type.NUMBER },
                                },
                                required: ["id", "name", "description", "features", "price", "type", "quantity"]
                            }
                        },
                        roiProjections: {
                             type: Type.ARRAY,
                             items: {
                                 type: Type.OBJECT,
                                 properties: {
                                     metric: { type: Type.STRING },
                                     value: { type: Type.STRING },
                                     description: { type: Type.STRING },
                                 },
                                 required: ["metric", "value", "description"]
                             }
                        },
                        termsAndConditions: { type: Type.STRING },
                    },
                    required: ["proposalTitle", "clientName", "executiveSummary", "clientChallenges", "solutionItems", "roiProjections", "termsAndConditions"]
                }
            }
        });

        // In a real app, we'd insert into the 'proposals' table here
        const proposalId = `prop-${Date.now()}`; 
        // For this transition, we just return the ID and frontend handles the "mock" creation in memory 
        // or we should save to DB. 
        // Saving to DB requires creating a proposal record. We'll skip that complexity for this step 
        // and just return the ID, but strictly speaking, the 'content' isn't persisted yet.
        
        res.json({ proposalId });
    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ error: 'Proposal generation failed' });
    }
};

export const copilotResponse = async (req: Request, res: Response) => {
    try {
        const { prompt, context } = req.body;
        const systemInstruction = 'You are "Goose", a helpful AI assistant for a business operating system.';
        const fullPrompt = `Context: ${JSON.stringify(context)}\n\nUser Question: ${prompt}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: { systemInstruction }
        });
        
        res.json({ response: response.text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'CoPilot failed' });
    }
};

export const draftEmail = async (req: Request, res: Response) => {
    try {
        const { suggestion, deal, interactions } = req.body;
        const prompt = `Draft a professional email for deal "${deal.deal_name}" regarding "${suggestion}". Return JSON with subject and body.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING }
                    },
                    required: ["subject", "body"]
                }
            }
        });
        
        const content = JSON.parse(response.text);
        // Look up recipient in interactions/contacts usually
        res.json({ ...content, to: 'client@example.com' });
    } catch (err) {
        res.status(500).json({ error: 'Draft email failed' });
    }
};

export const nextBestAction = async (req: Request, res: Response) => {
     try {
        const { deal, interactions } = req.body;
        const prompt = `Suggest the next best sales action for deal "${deal.deal_name}" based on these interactions.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        res.json({ action: response.text });
     } catch (err) {
         res.status(500).json({ error: 'Failed to get action' });
     }
}
