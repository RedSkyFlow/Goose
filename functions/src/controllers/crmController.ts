import { Request, Response } from 'express';
import { query } from '../db';

// --- Companies ---
export const getCompanies = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching companies' });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, domain, industry } = req.body;
    // Using the seed data summary for now or a placeholder
    const ai_summary = 'New company added via Goose OS.';
    const result = await query(
      'INSERT INTO companies (name, domain, industry, ai_summary) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, domain, industry, ai_summary]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error creating company' });
  }
};

// --- Contacts ---
export const getContacts = async (req: Request, res: Response) => {
  try {
    const companyId = req.query.company_id as string;
    let text = 'SELECT * FROM contacts ORDER BY created_at DESC';
    let params: any[] = [];

    if (companyId) {
      text = 'SELECT * FROM contacts WHERE company_id = $1 ORDER BY created_at DESC';
      params = [companyId];
    }

    const result = await query(text, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching contacts' });
  }
};

export const createContact = async (req: Request, res: Response) => {
    try {
        const { company_id, first_name, last_name, email, role } = req.body;
        const result = await query(
            'INSERT INTO contacts (company_id, first_name, last_name, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [company_id, first_name, last_name, email, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error creating contact' });
    }
};

// --- Deals ---
export const getDeals = async (req: Request, res: Response) => {
  try {
    const companyId = req.query.company_id as string;
    // Join with interactions to get the latest timestamp, similar to the mock logic
    let text = `
      SELECT d.*, MAX(i.timestamp) as last_interaction_at
      FROM deals d
      LEFT JOIN interactions i ON d.deal_id = i.deal_id
    `;
    let params: any[] = [];
    
    if (companyId) {
        text += ' WHERE d.company_id = $1';
        params.push(companyId);
    }
    
    text += ' GROUP BY d.deal_id ORDER BY d.created_at DESC';

    const result = await query(text, params);
    
    // Format output to match frontend types (convert string dates to proper ISO strings if needed)
    const deals = result.rows.map(row => ({
        ...row,
        value: parseFloat(row.value) // Postgres returns decimal as string
    }));

    res.json(deals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching deals' });
  }
};

// --- Interactions ---
export const getInteractions = async (req: Request, res: Response) => {
    try {
        const { deal_id, company_id, contact_id } = req.query;
        
        // Base query joined with contacts to get author info
        let text = `
            SELECT i.*, c.first_name, c.last_name, c.role as contact_role, c.email as contact_email
            FROM interactions i
            LEFT JOIN contacts c ON i.contact_id = c.contact_id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (deal_id) {
            params.push(deal_id);
            text += ` AND i.deal_id = $${params.length}`;
        }
        // Note: The schema links interactions to deals and contacts directly.
        // If filtering by company, we might need to join deals or contacts.
        // For simplicity, assuming interactions are fetched primarily by Deal ID context in this version.
        
        if (contact_id) {
             params.push(contact_id);
             text += ` AND i.contact_id = $${params.length}`;
        }

        text += ' ORDER BY i.timestamp DESC';

        const result = await query(text, params);

        // Transform to match frontend "author" object structure
        const interactions = result.rows.map(row => ({
            interaction_id: row.interaction_id,
            type: row.type,
            source_identifier: 'db', // simplified
            timestamp: row.timestamp,
            content_raw: row.content_raw,
            ai_summary: row.ai_summary,
            ai_sentiment: row.ai_sentiment,
            created_at: row.created_at,
            author: row.first_name ? {
                name: `${row.first_name} ${row.last_name}`,
                role: row.contact_role,
                email: row.contact_email
            } : { name: 'System/Unknown', role: 'N/A' }
        }));

        res.json(interactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error fetching interactions' });
    }
};

// --- Support Tickets ---
export const getTickets = async (req: Request, res: Response) => {
    try {
        // Basic fetch, in production you'd join with contacts/agents
        const result = await query('SELECT * FROM support_tickets ORDER BY created_at DESC');
        // Frontend expects `interaction_ids` array, schema might handle this differently.
        // We'll return the raw row for now.
        const tickets = result.rows.map(t => ({
            ...t,
            interaction_ids: [] // Placeholder: In a real app, you'd query a link table
        }));
        res.json(tickets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching tickets' });
    }
};

export const createTicket = async (req: Request, res: Response) => {
    try {
        const { contact_id, subject, initial_message } = req.body;
        
        // 1. Create the ticket
        const ticketResult = await query(
            "INSERT INTO support_tickets (contact_id, subject, status) VALUES ($1, $2, 'OPEN') RETURNING *",
            [contact_id, subject]
        );
        const ticket = ticketResult.rows[0];

        // 2. Create the initial interaction (The email content)
        await query(
            "INSERT INTO interactions (contact_id, type, content_raw, ai_sentiment) VALUES ($1, 'EMAIL', $2, 'NEUTRAL')",
            [contact_id, `Subject: ${subject}\n\n${initial_message}`]
        );

        res.status(201).json({ ...ticket, interaction_ids: [] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating ticket' });
    }
};
