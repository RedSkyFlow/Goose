import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import * as crm from './controllers/crmController';
import * as ai from './controllers/aiController';

const app = express();

// Enable CORS
app.use(cors({ origin: true }));
app.use(express.json());

// CRM Routes
app.get('/companies', crm.getCompanies);
app.post('/companies', crm.createCompany);
app.get('/contacts', crm.getContacts);
app.post('/contacts', crm.createContact);
app.get('/deals', crm.getDeals);
app.get('/interactions', crm.getInteractions);
app.get('/tickets', crm.getTickets);
app.post('/tickets', crm.createTicket);

// AI Routes
app.post('/summarize', ai.summarize);
app.post('/generate-proposal', ai.generateProposal);
app.post('/copilot-response', ai.copilotResponse);
app.post('/draft-email', ai.draftEmail);
app.post('/next-best-action', ai.nextBestAction);

// Expose the API as a Cloud Function
export const api = functions.https.onRequest(app);
