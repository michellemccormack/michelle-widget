# Quick Setup Guide

This repository contains a complete AI Engagement Widget implementation.

## Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd michelle-widget
npm install
```

## Step 2: Environment Setup

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

You'll need:
- Airtable API key and Base ID
- Upstash Redis credentials  
- OpenAI API key

## Step 3: Set Up Airtable

See `AIRTABLE_SETUP.md` for detailed instructions.

## Step 4: Generate Embeddings

```bash
npm run sync-embeddings
```

## Step 5: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 6: Deploy

```bash
vercel
```

See `DEPLOYMENT.md` for full deployment instructions.

## Missing Files Note

Some files in this repository need to be created. Run the included setup script:

```bash
chmod +x generate-remaining-files.sh
./generate-remaining-files.sh
```

This will create all lib/, API routes, and widget component files.
