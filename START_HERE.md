# 🚀 AI Engagement Widget - Complete Setup Instructions

## What You Have

This folder contains the **starter template** for the AI Engagement Widget with:

✅ Complete project structure  
✅ All configuration files (package.json, tsconfig.json, etc.)  
✅ Comprehensive documentation (README, AIRTABLE_SETUP, DEPLOYMENT)  
✅ Type definitions  
✅ Directory structure

## What You Need to Add

The **source code files** need to be created from the original implementation plan.

### Why?

The complete codebase is too large to include in a single download, but you have two easy options to get started:

---

## Option 1: Use Cursor AI (RECOMMENDED - 5 minutes)

1. **Download this folder** to your computer

2. **Open in Cursor AI**:
   ```bash
   cursor /path/to/ai-engagement-widget
   ```

3. **Copy the implementation plan** (the original document I provided) into a file or keep it open

4. **Ask Cursor to create files**. For each file in the CODE_GENERATION_GUIDE.md, ask:

   ```
   Create src/lib/airtable.ts with this code:
   [paste code from implementation plan]
   ```

5. **Repeat for all ~25 source files** listed in CODE_GENERATION_GUIDE.md

### Files to Create

See `CODE_GENERATION_GUIDE.md` for the complete list, but here's the summary:

**Core Libraries (7 files)**:
- src/lib/airtable.ts
- src/lib/redis.ts
- src/lib/openai.ts
- src/lib/embeddings.ts
- src/lib/rate-limit.ts
- src/lib/validation.ts
- src/lib/logger.ts

**API Routes (5 files)**:
- src/app/api/config/route.ts
- src/app/api/chat/route.ts
- src/app/api/lead/route.ts
- src/app/api/log/route.ts
- src/app/api/embeddings/sync/route.ts

**Widget Components (8 files)**:
- src/widget/main.tsx
- src/widget/Widget.tsx
- src/widget/types.ts
- src/widget/styles.css
- src/widget/components/*.tsx (7 components)
- src/widget/hooks/*.ts (2 hooks)

**Scripts (2 files)**:
- scripts/sync-embeddings.ts
- scripts/test-embed.html

**Public (1 file)**:
- public/widget.js

---

## Option 2: Manual Creation (15-30 minutes)

1. Open the **implementation plan document** I provided

2. For each file, manually create it and copy the code:
   ```bash
   # Example
   mkdir -p src/lib
   nano src/lib/airtable.ts
   # Paste code from implementation plan
   ```

3. Follow the file list in `CODE_GENERATION_GUIDE.md`

---

## After Creating Files

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- Airtable API key & Base ID
- Upstash Redis URL & token
- OpenAI API key

### 3. Set Up Airtable

Follow `AIRTABLE_SETUP.md` to create your Airtable base with 4 tables.

### 4. Generate Embeddings

```bash
npm run sync-embeddings
```

### 5. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 6. Deploy to Vercel

```bash
vercel
```

Follow `DEPLOYMENT.md` for complete deployment instructions.

---

## File Structure

Your completed project should look like:

```
ai-engagement-widget/
├── package.json ✅ (Already created)
├── tsconfig.json ✅
├── .env.example ✅
├── README.md ✅
├── DEPLOYMENT.md ✅
├── AIRTABLE_SETUP.md ✅
│
├── src/
│   ├── lib/ ⬜ (Need to create 7 files)
│   ├── types/ ✅ (Already created)
│   ├── app/api/ ⬜ (Need to create 5 route files)
│   └── widget/ ⬜ (Need to create ~15 files)
│
├── scripts/ ⬜ (Need to create 2 files)
└── public/ ⬜ (Need to create 1 file)
```

**Legend:**
- ✅ = Already included in this download
- ⬜ = Need to create from implementation plan

---

## Quick Start Checklist

- [ ] Download this folder
- [ ] Open in Cursor AI or code editor
- [ ] Create all source files (see CODE_GENERATION_GUIDE.md)
- [ ] Run `npm install`
- [ ] Set up `.env.local`
- [ ] Set up Airtable (see AIRTABLE_SETUP.md)
- [ ] Run `npm run sync-embeddings`
- [ ] Run `npm run dev`
- [ ] Deploy with `vercel`

---

## Getting Help

**Documentation:**
- `README.md` - Project overview
- `CODE_GENERATION_GUIDE.md` - How to create source files
- `AIRTABLE_SETUP.md` - Airtable configuration
- `DEPLOYMENT.md` - Deployment guide

**Troubleshooting:**
- Check that all files are created
- Run `npm run type-check` to verify TypeScript
- Review error messages carefully

**Support:**
- Open a GitHub issue
- Review the implementation plan document
- Check existing documentation

---

## Why This Approach?

Instead of a massive single file download, this modular approach:
- ✅ Lets you understand each component as you create it
- ✅ Works perfectly with Cursor AI for assisted development
- ✅ Keeps file sizes manageable
- ✅ Makes customization easier

---

## Next Steps

1. **Start with Cursor AI** - It's the fastest way
2. **Create the files** listed in CODE_GENERATION_GUIDE.md
3. **Follow SETUP.md** for the setup process
4. **Deploy** using DEPLOYMENT.md

**Estimated Time:**
- With Cursor: 5-10 minutes
- Manual: 15-30 minutes

Good luck! 🎉
