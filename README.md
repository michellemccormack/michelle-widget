# AI Engagement Widget

A reusable, embeddable AI-powered chat widget for lead generation and customer engagement.

## 🚀 Features

- 🎨 **Config-driven**: All content managed via Airtable CMS
- ⚡ **Fast**: Semantic search with vector embeddings (<700ms responses)
- 📱 **Responsive**: Works on desktop and mobile
- 🔒 **Secure**: Rate limiting, input validation, CORS protection
- 📊 **Analytics**: Event logging and lead tracking
- ♻️ **Reusable**: Easily deploy across multiple sites and verticals

## 📦 Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: Airtable (CMS) + Upstash Redis (cache)
- **AI**: OpenAI (embeddings + fallback LLM)
- **Hosting**: Vercel

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- Airtable account
- Upstash account (free tier)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd michelle-widget

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Setup

Edit `.env.local` with your credentials:

```bash
# Airtable
AIRTABLE_API_KEY=your_airtable_api_key
# AIRTABLE_BASE_ID not used - Michelle base is hardcoded

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### Set Up Airtable

1. Create a new Airtable base
2. Create 4 tables: FAQ, Config, Leads, Logs
3. See `AIRTABLE_SETUP.md` for detailed schema

### Generate Embeddings

```bash
npm run sync-embeddings
```

### Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📝 Embedding the Widget

Add this snippet to any website:

```html
<script 
  src="https://your-domain.vercel.app/widget.js" 
  data-widget-config 
  data-api-url="https://your-domain.vercel.app/api"
  async
></script>
```

## 🚢 Deployment

Deploy to Vercel:

```bash
vercel
```

See `DEPLOYMENT.md` for detailed deployment instructions.

## 📂 Project Structure

```
michelle-widget/
├── src/
│   ├── app/
│   │   └── api/          # API routes
│   ├── lib/              # Core libraries
│   ├── types/            # TypeScript types
│   └── widget/           # Widget components
├── public/               # Static files
├── scripts/              # Utility scripts
└── package.json
```

## 🔧 Configuration

Edit content in Airtable:

- **FAQs**: Add/edit questions and answers in the FAQ table
- **Quick Buttons**: Categories automatically become quick action buttons
- **Branding**: Update brand_name, welcome_message in Config table
- **CTAs**: Set custom CTA labels and URLs per FAQ

## 📊 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run sync-embeddings` - Generate embeddings for FAQs
- `npm run lint` - Run ESLint

## 🏗️ Architecture

```
User Website → Widget (React) → API (Next.js) → Airtable + Redis + OpenAI
```

- Widget loads async with isolated styles
- API handles semantic search using embeddings
- Redis caches FAQs and config
- Airtable stores content and leads

## 📖 Documentation

- [Airtable Setup Guide](./AIRTABLE_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./docs/API.md) (coming soon)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT

## 🆘 Support

For issues or questions, open an issue on GitHub.

---

**Note**: This repository is structured to work with the provided implementation plan. Some files may need to be generated using the included setup scripts. See `SETUP.md` for details.
