# Airtable Integration Setup

This guide explains how to set up Airtable authentication for the bidirectional sync feature.

## Required Environment Variables

### 1. Personal Access Token (Required)

Airtable uses **Personal Access Tokens** (PATs) for API authentication. These tokens start with `pat` and provide scoped access to your bases.

**Option 1 (Recommended):** Set `AIRTABLE_PERSONAL_ACCESS_TOKEN`
```bash
AIRTABLE_PERSONAL_ACCESS_TOKEN=patXXXXXXXXXXXXXX
```

**Option 2:** Set `AIRTABLE_API_KEY` (legacy name, still supported)
```bash
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
```

#### How to Create a Personal Access Token:

1. Go to https://airtable.com/create/tokens
2. Click **"Create new token"**
3. Give it a name (e.g., "Office Hours Matching Tool")
4. Set scopes:
   - ✅ `data.records:read` - Read records from tables
   - ✅ `data.records:write` - Create/update/delete records
5. Under **"Access"**, select:
   - **"Specific bases"** → Select your base: **"Mentor Matcher"** (app84nk8zRrr5Ofog)
6. Click **"Create token"**
7. **Copy the token immediately** (you won't be able to see it again!)
8. Set it in your environment variables

### 2. Base and Table IDs (Required)

```bash
AIRTABLE_BASE_ID=app84nk8zRrr5Ofog
AIRTABLE_MENTORS_TABLE_ID=tblujd35OaEmoBjoV
```

These are already configured in the code, but you can override them if needed.

### 3. Webhook Secret (Required for Inbound Sync)

When setting up Airtable webhooks, you'll need a secret for HMAC signature verification:

```bash
AIRTABLE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXX
```

This is provided by Airtable when you create a webhook automation.

## Setting Up Environment Variables

### Local Development (.env.local)

Create or update `.env.local`:

```bash
AIRTABLE_PERSONAL_ACCESS_TOKEN=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=app84nk8zRrr5Ofog
AIRTABLE_MENTORS_TABLE_ID=tblujd35OaEmoBjoV
AIRTABLE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXX
```

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `AIRTABLE_PERSONAL_ACCESS_TOKEN` (or `AIRTABLE_API_KEY`)
   - `AIRTABLE_BASE_ID`
   - `AIRTABLE_MENTORS_TABLE_ID`
   - `AIRTABLE_WEBHOOK_SECRET`
4. Make sure to add them for **Production**, **Preview**, and **Development** environments

## Testing the Setup

### Health Check Endpoint

Test your Airtable connection:

```bash
curl http://localhost:3000/api/health/airtable
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Airtable API connectivity verified",
  "config": {
    "baseId": "app84nk8zRrr5Ofog",
    "mentorsTableId": "tblujd35OaEmoBjoV"
  }
}
```

### Common Issues

**Error: "Airtable authentication token is not set"**
- Make sure you've set `AIRTABLE_PERSONAL_ACCESS_TOKEN` or `AIRTABLE_API_KEY`
- Restart your dev server after adding environment variables

**Error: "Airtable API authentication failed" (401/403)**
- Verify your token is correct (starts with `pat`)
- Check that the token has the correct scopes (`data.records:read`, `data.records:write`)
- Ensure the token has access to the base `app84nk8zRrr5Ofog`

**Error: "Warning: Airtable token should start with 'pat'"**
- You're using an old API key format
- Create a new Personal Access Token at https://airtable.com/create/tokens

## Webhook Setup (Inbound Sync)

To enable Airtable → Postgres sync:

1. In Airtable, go to your base
2. Click **"Automations"** → **"New automation"**
3. Set trigger: **"When record matches conditions"** (or **"When record updated"**)
4. Add action: **"Run script"** or use **"Send webhook"**
5. Configure webhook:
   - URL: `https://your-domain.com/api/webhooks/airtable`
   - Method: POST
   - Include webhook secret in headers
6. Copy the webhook secret and set it as `AIRTABLE_WEBHOOK_SECRET`

## Security Notes

- **Never commit tokens to git** - Always use environment variables
- Personal Access Tokens have the same permissions as your user account
- Rotate tokens periodically for security
- Use different tokens for development and production if possible

