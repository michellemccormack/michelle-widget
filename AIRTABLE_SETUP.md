# Airtable Setup Guide

Complete guide to setting up Airtable as your CMS for the AI Engagement Widget.

## 1. Create Airtable Base

1. Go to https://airtable.com
2. Click **"Create a base"**
3. Name it **"AI Widget CMS"**

## 2. Create Tables

### Table 1: FAQ

| Field Name | Type | Options |
|------------|------|---------|
| `question` | Single line text | - |
| `category` | Single select | Add: Policies, Support, Getting Started |
| `short_answer` | Long text | - |
| `long_answer` | Long text | - |
| `keywords` | Long text | - |
| `cta_label` | Single line text | - |
| `cta_url` | URL | - |
| `ctas` | Long text | JSON array for multiple CTAs: `[{"label":"Schedule a Call","url":"..."},{"label":"Email","url":"mailto:..."}]` (optional) |
| `status` | Single select | Options: LIVE, DRAFT |
| `priority` | Number | Integer, 0-100 |
| `embedding` | Long text | (Auto-filled) |
| `view_count` | Number | Default: 0 |
| `helpful_count` | Number | Default: 0 |

**Sample FAQ Rows:**

| question | category | short_answer | status | priority |
|----------|----------|--------------|--------|----------|
| What are your office hours? | Support | We're open Monday-Friday, 9am-5pm EST. Email us anytime at support@example.com. | LIVE | 10 |
| How do I get started? | Getting Started | Simply create an account and follow our onboarding guide. It takes less than 5 minutes! | LIVE | 20 |
| What is your refund policy? | Policies | We offer a 30-day money-back guarantee on all purchases. Contact support to request a refund. | LIVE | 15 |

### Table 2: Config

| Field Name | Type |
|------------|------|
| `key` | Single line text (Primary field) |
| `value` | Long text |

**Required Configuration Rows:**

| key | value |
|-----|-------|
| `brand_name` | Your Company Name |
| `welcome_message` | Hi! How can I help you today? |
| `quick_buttons_limit` | 6 |
| `fallback_message` | I'm not sure about that. Would you like to speak with someone? |
| `contact_cta_label` | Contact Us |
| `contact_cta_url` | https://example.com/contact |
| `contact_ctas` | `[{"label":"Schedule a Call","url":"https://calendly.com/..."},{"label":"Email","url":"mailto:..."}]` | JSON array for multiple CTAs (overrides single) |

**Optional:**

| key | value |
|-----|-------|
| `theme` | `{"primary_color": "#2563eb"}` |
| `web_search_enabled` | `true` - When no FAQ match, search the web for answers. Requires `SERPER_API_KEY` in env. |
| `require_email_to_chat` | `true` - Require email before user can chat. Collects leads upfront. |

**Policy quick buttons:** Add FAQs with categories like `Tax Policy`, `Healthcare`, `Education`, `Public Safety`, `Housing` to get specific policy bubbles. Increase `quick_buttons_limit` (e.g. to 9) to show more.

### Table 3: Leads

| Field Name | Type |
|------------|------|
| `email` | Email |
| `zip` | Single line text |
| `name` | Single line text |
| `tags` | Multiple select |
| `source` | Single select (web, sms) |
| `source_category` | Single line text |
| `source_question_id` | Single line text |
| `session_duration_seconds` | Number |
| `questions_asked_count` | Number |
| `created_at` | Date (include time) |

### Table 4: Logs

| Field Name | Type |
|------------|------|
| `event_name` | Single select |
| `session_id` | Single line text |
| `payload_json` | Long text |
| `user_agent` | Long text |
| `referrer` | Single line text |
| `created_at` | Date (include time) |

**Event Names for Logs:**
- widget_open
- button_click
- question_asked
- answer_served
- lead_captured
- cta_clicked

## 3. Get API Credentials

### Get API Key

1. Click your **profile picture** (top right)
2. Go to **"Account"**
3. Scroll to **"API"** section
4. Click **"Generate API key"**
5. Copy the key (starts with `key...`)
6. Save it securely - you'll need it for `.env.local`

### Get Base ID

1. Go to https://airtable.com/api
2. Select your **"AI Widget CMS"** base
3. In the docs, find the **Base ID** (starts with `app...`)
4. Or check the URL when viewing your base

## 4. Set Up Views (Recommended)

Create these filtered views for easier content management:

### FAQ Table Views

1. **Live FAQs**
   - Filter: `status` = `LIVE`
   - Sort: `priority` descending

2. **Draft FAQs**
   - Filter: `status` = `DRAFT`

3. **By Category**
   - Group by: `category`
   - Filter: `status` = `LIVE`

### Leads Table Views

1. **Recent Leads**
   - Sort by `created_at` descending
   - Show most recent 50

2. **By Source**
   - Group by `source`

## 5. Sample Data Templates

### Political Campaign FAQs

```
Question: Who is [Candidate Name]?
Category: About
Short Answer: [Candidate] is running for [position] to [key message]. With [X] years of experience in [field], [they/he/she] has a proven track record of [achievements].
Status: LIVE
Priority: 30
```

```
Question: What is your stance on healthcare?
Category: Policies  
Short Answer: We believe in [key position]. Our plan includes [3 main points]. This will benefit [target group] by [specific outcome].
Status: LIVE
Priority: 25
```

### Real Estate FAQs

```
Question: How do I price my home?
Category: Selling
Short Answer: We offer a free comparative market analysis. We'll analyze recent sales in your area and provide a data-driven pricing strategy to maximize your sale price.
CTA Label: Get Free Home Valuation
CTA URL: https://example.com/valuation
Status: LIVE
Priority: 20
```

### SaaS Product FAQs

```
Question: What's included in the free plan?
Category: Pricing
Short Answer: Our free plan includes [features]. Perfect for getting started! Upgrade anytime for [premium features].
CTA Label: Start Free Trial
CTA URL: https://example.com/signup
Status: LIVE
Priority: 25
```

## 6. Permissions & Sharing

If working with a team:

1. Click **"Share"** (top right of base)
2. Add team members by email
3. Set permissions:
   - **Editor**: Content managers
   - **Commenter**: Reviewers
   - **Read-only**: Stakeholders

## 7. Automations (Optional)

### Auto-Tag New Leads

1. In Airtable, click **"Automations"**
2. Create new automation:
   - **Trigger**: When record created in `Leads`
   - **Action**: Update record
   - **Logic**: Add tags based on `source_category`

### Slack/Email Notifications

1. Create automation:
   - **Trigger**: When record created in `Leads`
   - **Action**: Send to Slack / Send email
   - **Recipients**: Your team channel / email

## 8. Verify Setup

Before connecting to the widget:

- [ ] All 4 tables created (FAQ, Config, Leads, Logs)
- [ ] At least 3-5 sample FAQs with status=LIVE
- [ ] All required Config rows added
- [ ] API key and Base ID copied
- [ ] Views created for easier management

## 9. Connect to Widget

Add credentials to `.env.local`:

```bash
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
# AIRTABLE_BASE_ID not used - Michelle base appGlpvmKt4d6VdzE is hardcoded in code
```

## 10. Generate Embeddings

After adding FAQs, run:

```bash
npm run sync-embeddings
```

This generates vector embeddings for semantic search.

## Troubleshooting

**Issue**: Can't find API key
- **Solution**: Check Account settings, not workspace settings

**Issue**: Base ID not working
- **Solution**: Make sure you copied the full ID with "app" prefix

**Issue**: FAQs not appearing in widget
- **Solution**: Verify status=LIVE and run embedding sync

**Issue**: Rate limit errors
- **Solution**: Airtable free tier has 5 req/sec limit. Upgrade if needed.

## Next Steps

After Airtable setup:

1. ✅ Add credentials to `.env.local`
2. ✅ Run `npm run sync-embeddings`
3. ✅ Start dev server: `npm run dev`
4. ✅ Test at http://localhost:3000

---

**Need Help?** Open an issue on GitHub or check the main README.
