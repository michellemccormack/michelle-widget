# AUDIT: Brian's Widget Showing Michelle's Data — ROOT CAUSE & FIX

## ROOT CAUSE

**Brian's live website is embedding the widget from Michelle's URL.**

When a visitor goes to Brian's site, the browser loads:
```html
<script src="https://michelle-widget.vercel.app/widget.js" data-api-url="https://michelle-widget.vercel.app/api" ...>
```

That means:
1. Widget code comes from Michelle's deployment
2. Config/chat API calls go to Michelle's deployment
3. Michelle's API returns Michelle's Airtable data (or config.local.json fallback)
4. Brian's site displays Michelle's content

**Brian's project folder and base ID are irrelevant** — the embed URL on the live site determines everything.

---

## YOUR TWO PROJECTS

| Project | Folder | Deploys To | Airtable |
|---------|--------|------------|----------|
| **Michelle** | `/Users/michellem/Desktop/michelle-widget` | michelle-widget.vercel.app | appGlpvmKt4d6VdzE (hardcoded) |
| **Brian** | `/Users/michellem/Desktop/AI chatbot/ai-engagement-widget` | ai-engagement-widget.vercel.app | From env: AIRTABLE_BASE_ID |

---

## THE FIX (DO THIS)

### Step 1: Confirm Brian's deployment URL
Brian's project deploys to **ai-engagement-widget.vercel.app** (from his demo.html).
If Brian has a custom domain, use that. Otherwise use: `https://ai-engagement-widget.vercel.app`

### Step 2: Find where Brian's embed is
Brian's widget appears on his campaign website. The embed code is in the HTML of that site. It could be in:
- Squarespace (Settings → Code Injection, or a specific page)
- WordPress (theme or plugin)
- Wix, Webflow, or other CMS
- A custom HTML file

### Step 3: Change the embed code
**WRONG (current — causes Michelle's data to show):**
```html
<script src="https://michelle-widget.vercel.app/widget.js" data-api-url="https://michelle-widget.vercel.app/api" async></script>
```

**CORRECT (use Brian's URL):**
```html
<script src="https://ai-engagement-widget.vercel.app/widget.js" data-api-url="https://ai-engagement-widget.vercel.app/api" async></script>
```

If Brian has a different deployment URL (e.g. shortsleeve-widget.vercel.app), use that instead.

### Step 4: Verify Brian's Vercel env vars
For ai-engagement-widget.vercel.app, ensure Vercel has:
- `AIRTABLE_BASE_ID` = Brian's base ID
- `AIRTABLE_API_KEY` = Brian's API key (with access to Brian's base)
- `OPENAI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SYNC_TOKEN`

---

## HOW TO FIND THE BAD EMBED

1. Go to Brian's live website (where the widget appears)
2. Right-click → View Page Source (or Inspect)
3. Search for "michelle-widget" or "widget.js" or "data-api-url"
4. You'll see the script tag. If it says michelle-widget.vercel.app, that's the bug.
5. Change it to ai-engagement-widget.vercel.app (or Brian's correct URL)

---

## SUMMARY

| What | Where to fix |
|------|--------------|
| Embed URL | Brian's live website HTML (Squarespace, WordPress, etc.) |
| Must change | `michelle-widget.vercel.app` → `ai-engagement-widget.vercel.app` |

**No code changes needed.** The fix is on the live website where the embed script lives.
