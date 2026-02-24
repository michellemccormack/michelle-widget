# Code Generation Guide

This guide explains how to generate all source code files for the AI Engagement Widget.

## Option 1: Manual File Creation (Recommended for Learning)

All source code is provided in the **original implementation plan** document.

Copy each file from the implementation plan into your project:

### Core Library Files (src/lib/)

1. `src/lib/airtable.ts` - Airtable client wrapper
2. `src/lib/redis.ts` - Redis caching utilities  
3. `src/lib/openai.ts` - OpenAI API wrapper
4. `src/lib/embeddings.ts` - Vector similarity functions
5. `src/lib/rate-limit.ts` - Rate limiting logic
6. `src/lib/validation.ts` - Input validation with Zod
7. `src/lib/logger.ts` - Structured logging

### API Routes (src/app/api/)

1. `src/app/api/config/route.ts` - Widget configuration endpoint
2. `src/app/api/chat/route.ts` - Chat/question answering endpoint
3. `src/app/api/lead/route.ts` - Lead capture endpoint
4. `src/app/api/log/route.ts` - Event logging endpoint
5. `src/app/api/embeddings/sync/route.ts` - Embedding generation

### Widget Components (src/widget/)

1. `src/widget/main.tsx` - Widget entry point
2. `src/widget/Widget.tsx` - Main widget component
3. `src/widget/components/Bubble.tsx` - Chat bubble button
4. `src/widget/components/ChatPanel.tsx` - Main chat panel
5. `src/widget/components/QuickButtons.tsx` - Category buttons
6. `src/widget/components/MessageList.tsx` - Message display
7. `src/widget/components/InputBar.tsx` - Message input
8. `src/widget/components/LeadCaptureForm.tsx` - Email capture form

### Widget Hooks (src/widget/hooks/)

1. `src/widget/hooks/useWidget.ts` - Main widget state management
2. `src/widget/hooks/useConfig.ts` - Configuration loading

### Widget Types & Styles

1. `src/widget/types.ts` - Widget TypeScript types
2. `src/widget/styles.css` - Widget CSS

### Scripts

1. `scripts/sync-embeddings.ts` - Embedding sync script
2. `scripts/test-embed.html` - Test page

### Public Files

1. `public/widget.js` - Embed loader script

## Option 2: Use Cursor AI (Fastest)

1. Open this repository in Cursor AI
2. Reference the **original implementation plan** document
3. Ask Cursor to create each file:

```
Create src/lib/airtable.ts using the code from the implementation plan
```

Repeat for all files listed above.

## Option 3: Download Complete Bundle (Coming Soon)

A complete downloadable bundle will be provided at:
- GitHub Releases
- Google Drive link
- Or contact the repository maintainer

## Verification

After generating all files, verify with:

```bash
# Check TypeScript compilation
npm run type-check

# Should show no errors
```

## Directory Structure

Your final structure should look like:

```
michelle-widget/
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── vercel.json
├── .env.example
├── .gitignore
├── README.md
├── DEPLOYMENT.md
├── AIRTABLE_SETUP.md
├── public/
│   └── widget.js
├── scripts/
│   ├── sync-embeddings.ts
│   └── test-embed.html
└── src/
    ├── app/
    │   └── api/
    │       ├── config/route.ts
    │       ├── chat/route.ts
    │       ├── lead/route.ts
    │       ├── log/route.ts
    │       └── embeddings/sync/route.ts
    ├── lib/
    │   ├── airtable.ts
    │   ├── redis.ts
    │   ├── openai.ts
    │   ├── embeddings.ts
    │   ├── rate-limit.ts
    │   ├── validation.ts
    │   └── logger.ts
    ├── types/
    │   ├── airtable.ts
    │   ├── api.ts
    │   └── widget.ts
    └── widget/
        ├── main.tsx
        ├── Widget.tsx
        ├── types.ts
        ├── styles.css
        ├── components/
        │   ├── Bubble.tsx
        │   ├── ChatPanel.tsx
        │   ├── QuickButtons.tsx
        │   ├── MessageList.tsx
        │   ├── InputBar.tsx
        │   └── LeadCaptureForm.tsx
        └── hooks/
            ├── useWidget.ts
            └── useConfig.ts
```

## File Counts

- Total files: ~35
- TypeScript files: ~25
- Config files: ~7
- Documentation: ~3

## Next Steps

After generating all files:

1. ✅ Run `npm install`
2. ✅ Copy `.env.example` to `.env.local`
3. ✅ Add your API credentials
4. ✅ Set up Airtable (see AIRTABLE_SETUP.md)
5. ✅ Run `npm run sync-embeddings`
6. ✅ Run `npm run dev`
7. ✅ Visit http://localhost:3000

## Troubleshooting

**Q: TypeScript errors after creating files?**
A: Run `npm install` to install all dependencies

**Q: Missing imports?**
A: Check that all type definition files are created in `src/types/`

**Q: Build fails?**
A: Verify all API route files are in correct directories

## Getting Help

- Check the implementation plan for complete file contents
- Open an issue on GitHub
- Review the README.md for setup instructions
