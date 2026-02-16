#!/bin/bash

# This script creates all remaining files for the AI Engagement Widget project

# Navigate to project root
cd "$(dirname "$0")"

echo "Creating remaining project files..."

# Create lib files
mkdir -p src/lib

# lib/airtable.ts
cat > src/lib/airtable.ts << 'EOF'
import Airtable from 'airtable';
import type { AirtableFAQ, AirtableConfig, AirtableLead, AirtableLog } from '@/types/airtable';

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable credentials');
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

export const airtableClient = {
  async getFAQs(): Promise<AirtableFAQ[]> {
    const records = await base('FAQ')
      .select({
        filterByFormula: "{status} = 'LIVE'",
        sort: [{ field: 'priority', direction: 'desc' }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      fields: record.fields as AirtableFAQ['fields'],
    }));
  },

  async getFAQById(id: string): Promise<AirtableFAQ | null> {
    try {
      const record = await base('FAQ').find(id);
      return {
        id: record.id,
        fields: record.fields as AirtableFAQ['fields'],
      };
    } catch {
      return null;
    }
  },

  async updateFAQ(id: string, fields: Partial<AirtableFAQ['fields']>): Promise<void> {
    await base('FAQ').update(id, fields);
  },

  async getConfig(): Promise<Record<string, string>> {
    const records = await base('Config').select().all();
    const config: Record<string, string> = {};
    records.forEach((record) => {
      const fields = record.fields as AirtableConfig['fields'];
      config[fields.key] = fields.value;
    });
    return config;
  },

  async createLead(lead: AirtableLead['fields']): Promise<string> {
    const record = await base('Leads').create([{ fields: lead }]);
    return record[0].id;
  },

  async createLog(log: AirtableLog['fields']): Promise<void> {
    await base('Logs').create([{ fields: log }]);
  },
};
EOF

echo "Created src/lib/airtable.ts"

# Continue with more files in next command...
