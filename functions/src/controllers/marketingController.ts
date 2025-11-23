
import { GoogleGenAI, Type } from "@google/genai";
import { config } from '../config';

// Use GEMINI_API_KEY from config
const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export const researchProspect = async (req: any, res: any) => {
    try {
        const { domain } = req.query;
        const prompt = `Research the company with domain "${domain}". Create a detailed prospect profile in JSON.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        domain: { type: Type.STRING },
                        company_name: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        industry: { type: Type.STRING },
                        talking_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tech_stack: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type:Type.STRING}, category: {type:Type.STRING}, description: {type:Type.STRING} } } },
                        key_contacts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type:Type.STRING}, role: {type:Type.STRING}, ai_outreach_suggestion: {type:Type.STRING} } } },
                        recent_news: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, url: {type:Type.STRING}, published_date: {type:Type.STRING}, summary: {type:Type.STRING} } } },
                    }
                }
             }
        });
        res.json(JSON.parse(response.text));
    } catch (err) {
        res.status(500).json({ error: 'Research failed' });
    }
};

export const generateContent = async (req: any, res: any) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });
        res.json({ content: response.text });
    } catch (err) {
        res.status(500).json({ error: 'Content generation failed' });
    }
};

export const generateLeadList = async (req: any, res: any) => {
    try {
        const { description } = req.body;
        const prompt = `Generate a list of 5 companies that match this description: "${description}". Return JSON array.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            company_name: { type: Type.STRING },
                            domain: { type: Type.STRING },
                        },
                        required: ["company_name", "domain"],
                    },
                },
            },
        });
        res.json(JSON.parse(response.text));
    } catch (err) {
        res.status(500).json({ error: 'Lead gen failed' });
    }
};
