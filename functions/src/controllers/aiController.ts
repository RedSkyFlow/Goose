
import { GoogleGenAI, Type } from "@google/genai";
import { config } from '../config';

// Use GEMINI_API_KEY from config
const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export const summarize = async (req: any, res: any) => {
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

export const nextBestAction = async (req: any, res: any) => {
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

export const copilotResponse = async (req: any, res: any) => {
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

export const generateProposal = async (req: any, res: any) => {
    try {
        const { deal } = req.body;
        
        const prompt = `
            You are an expert B2B proposal writer named Goose. 
            Deal: "${deal.deal_name}", Value: $${deal.value}.
            Generate a structured JSON proposal.
        `;
        
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
        
        // In a real app, save to DB. Here we simulate returning an ID.
        const proposalId = `prop-${Date.now()}`;
        
        res.json({ proposalId });
    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ error: 'Proposal generation failed' });
    }
};

export const draftEmail = async (req: any, res: any) => {
    try {
        const { suggestion, deal } = req.body;
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
        res.json({ ...content, to: 'client@example.com' });
    } catch (err) {
        res.status(500).json({ error: 'Draft email failed' });
    }
};
