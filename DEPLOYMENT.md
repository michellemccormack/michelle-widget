# Deployment Guide

Complete guide to deploying the AI Engagement Widget to production.

## Pre-Deployment Checklist

- [ ] Airtable base set up with all 4 tables
- [ ] At least 5-10 LIVE FAQs added
- [ ] Upstash Redis account created
- [ ] OpenAI API key obtained
- [ ] GitHub repository created
- [ ] All environment variables documented

## Vercel Deployment (Recommended)

### 1. Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Engagement Widget"

# Add remote
git remote add origin https://github.com/yourusername/michelle-widget.git

# Push
git push -u origin main
```

### 2. Import to Vercel

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Add Environment Variables

In Vercel dashboard, add these environment variables:

```bash
# Airtable
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
# AIRTABLE_BASE_ID not needed - Michelle base appGlpvmKt4d6VdzE is hardcoded

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXXXXXXXXxxxxxx

# OpenAI  
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXX

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SYNC_TOKEN=your-random-secure-token-here
RATE_LIMIT_MAX=20
RATE_LIMIT_WINDOW_MS=60000

# Optional
LOG_LEVEL=info
```

**Generate SYNC_TOKEN:**
```bash
openssl rand -hex 32
```

### 4. Deploy

Click **"Deploy"**

Wait 2-3 minutes for deployment to complete.

### 5. Post-Deployment Steps

#### Generate Embeddings

```bash
curl -X POST https://your-domain.vercel.app/api/embeddings/sync \
  -H "Authorization: Bearer YOUR_SYNC_TOKEN"
```

You should see:
```json
{
  "success": true,
  "message": "Generated embeddings for X FAQs",
  "total": X
}
```

#### Test the Widget

Visit: `https://your-domain.vercel.app`

You should see a demo page with the widget in the bottom-right corner.

#### Get Embed Code

```html
<script 
  src="https://your-domain.vercel.app/widget.js" 
  data-widget-config 
  data-api-url="https://your-domain.vercel.app/api"
  async
></script>
```

## Custom Domain Setup

### Add Custom Domain

1. In Vercel dashboard, go to your project
2. Click **"Settings" → "Domains"**
3. Click **"Add"**
4. Enter your domain (e.g., `widget.yourdomain.com`)
5. Follow DNS instructions provided

### Update DNS Records

Add these records to your DNS provider:

**Option A: CNAME (Recommended)**
```
Type: CNAME
Name: widget
Value: cname.vercel-dns.com
```

**Option B: A Record**
```
Type: A
Name: widget
Value: 76.76.21.21
```

### Wait for DNS Propagation

This can take 5 minutes to 48 hours depending on your DNS provider.

Check status: https://www.whatsmydns.net/

### Update Embed Code

After custom domain is active:

```html
<script 
  src="https://widget.yourdomain.com/widget.js" 
  data-widget-config 
  data-api-url="https://widget.yourdomain.com/api"
  async
></script>
```

## Environment Configuration

### Production Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AIRTABLE_API_KEY` | ✅ | Airtable API key | `keyXXXXXXXX` |
| `UPSTASH_REDIS_REST_URL` | ✅ | Redis URL | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Redis token | `AXXXXXXX` |
| `OPENAI_API_KEY` | ✅ | OpenAI API key | `sk-XXXXXXX` |
| `ALLOWED_ORIGINS` | ⚠️ | Allowed domains | `https://yourdomain.com` |
| `SYNC_TOKEN` | ⚠️ | API protection | Random 64-char string |
| `RATE_LIMIT_MAX` | ➖ | Max requests/window | `20` (default) |
| `RATE_LIMIT_WINDOW_MS` | ➖ | Rate limit window | `60000` (default) |
| `LOG_LEVEL` | ➖ | Logging verbosity | `info` (default) |

### Security Best Practices

1. **Set Specific Origins**
   ```bash
   ALLOWED_ORIGINS=https://example.com,https://www.example.com
   ```
   Do NOT use `*` in production

2. **Generate Strong SYNC_TOKEN**
   ```bash
   openssl rand -hex 32
   ```

3. **Enable Rate Limiting**
   ```bash
   RATE_LIMIT_MAX=20
   RATE_LIMIT_WINDOW_MS=60000
   ```

4. **Use Production Log Level**
   ```bash
   LOG_LEVEL=warn  # or 'error' for production
   ```

## Monitoring & Analytics

### Vercel Analytics

1. Go to your Vercel project
2. Click **"Analytics"** tab
3. Enable **Web Analytics**

### View Logs

**Via Vercel Dashboard:**
1. Go to your project
2. Click **"Deployments"**
3. Click on latest deployment
4. View **"Function Logs"**

**Via Vercel CLI:**
```bash
vercel logs your-domain.vercel.app
```

### Airtable Logs

Check the `Logs` table in Airtable for detailed event tracking:
- Widget opens
- Questions asked
- Leads captured
- CTA clicks

## Updating Content

### Add/Edit FAQs

1. Go to Airtable → FAQ table
2. Add or edit FAQs
3. Set `status` = `LIVE`
4. Re-sync embeddings:

```bash
curl -X POST https://your-domain.vercel.app/api/embeddings/sync \
  -H "Authorization: Bearer YOUR_SYNC_TOKEN"
```

Widget will show new content within 5 minutes (cache TTL).

### Update Configuration

1. Edit `Config` table in Airtable
2. Changes appear within 10 minutes
3. Or invalidate cache manually (requires Redis CLI)

## Performance Optimization

### Edge Functions

The widget bundle is served via Vercel Edge for global CDN distribution.

### Caching Strategy

- **FAQs**: Cached for 5 minutes
- **Config**: Cached for 10 minutes  
- **Embeddings**: Cached for 1 hour
- **Widget Bundle**: Cached for 24 hours

### Response Time Targets

- API `/config`: < 200ms
- API `/chat`: < 700ms
- Widget Load: < 1s

## Scaling Considerations

### Airtable Rate Limits

**Free Tier**: 5 requests/second

**Solutions:**
- Upgrade to paid tier
- Implement Redis caching (already done)
- Use webhook-based cache invalidation

### Redis Storage

**Upstash Free Tier**: 10,000 commands/day

**Solutions:**
- Upgrade to paid tier if needed
- Monitor usage in Upstash dashboard

### OpenAI Costs

**Embeddings**: ~$0.0001 per FAQ (one-time)
**Chat**: ~$0.0015 per LLM fallback (rare)

**Cost Optimization:**
- Use embeddings first (cheaper)
- LLM only for fallback
- Monitor usage in OpenAI dashboard

## Troubleshooting

### Widget Not Loading

**Check:**
- Browser console for errors
- Verify `data-api-url` in embed code
- Check Vercel deployment status
- Verify CORS settings

**Solution:**
```bash
# Check if API is responding
curl https://your-domain.vercel.app/api/config
```

### Slow Responses

**Check:**
- Upstash Redis status
- OpenAI API status
- Vercel function logs

**Solution:**
- Verify embeddings are cached
- Check Redis hit rate
- Review function execution time

### FAQs Not Appearing

**Check:**
- FAQ `status` = `LIVE` in Airtable
- Embeddings generated
- Cache populated

**Solution:**
```bash
# Regenerate embeddings
curl -X POST https://your-domain.vercel.app/api/embeddings/sync \
  -H "Authorization: Bearer YOUR_SYNC_TOKEN"
```

### CORS Errors

**Check:**
- `ALLOWED_ORIGINS` environment variable
- Embedding domain matches allowed origins

**Solution:**
Update `ALLOWED_ORIGINS` in Vercel:
```bash
ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

## Rollback Strategy

### Rollback Deployment

1. Go to Vercel dashboard
2. Click **"Deployments"**
3. Find previous working deployment
4. Click **"⋯" → "Promote to Production"**

### Rollback Environment Variables

1. Go to **"Settings" → "Environment Variables"**
2. Click on variable to edit
3. Update to previous value
4. Redeploy

## Security Checklist

- [ ] `ALLOWED_ORIGINS` set to specific domains
- [ ] Random `SYNC_TOKEN` generated
- [ ] Rate limiting enabled
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Input validation active
- [ ] Error messages don't leak sensitive data
- [ ] Airtable API key secured (not in client code)
- [ ] OpenAI API key secured (server-side only)

## Maintenance

### Weekly Tasks

- [ ] Review Airtable Logs for errors
- [ ] Check lead capture rate
- [ ] Monitor API response times
- [ ] Review Vercel analytics

### Monthly Tasks

- [ ] Review and update FAQs
- [ ] Check OpenAI usage/costs
- [ ] Review Upstash Redis usage
- [ ] Update dependencies
- [ ] Review security settings

### Quarterly Tasks

- [ ] Performance audit
- [ ] User feedback review
- [ ] A/B testing different copy
- [ ] Cost optimization review

## Support

**Issues:**
- Check GitHub Issues
- Review Vercel logs
- Check Airtable API limits

**Contact:**
- GitHub: Open an issue
- Email: support@yourdomain.com

---

**Deployment Complete!** 🎉

Your widget is now live at: `https://your-domain.vercel.app`

Embed code:
```html
<script 
  src="https://your-domain.vercel.app/widget.js" 
  data-widget-config 
  data-api-url="https://your-domain.vercel.app/api"
  async
></script>
```
