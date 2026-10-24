# Production Email Fix - Deployment Guide

## Issue
Railway's network lacks IPv6 egress, causing `ENETUNREACH` when nodemailer resolves `smtp.gmail.com` to IPv6 addresses.

## Dual Fix Strategy

### Option A: Node.js DNS Flag (Runtime - Recommended)
**Configure in Railway Service Settings → Start Command:**

```bash
node --dns-result-order=ipv4first dist/index.js
```

This forces Node.js to prefer IPv4 for ALL DNS lookups at the runtime level.

### Option B: Explicit IPv4 Host (Code - Fallback) ✅ **IMPLEMENTED**
**Code changes in `backend/src/services/email/gmail.provider.ts`:**

1. **Explicit IPv4 addresses** - Uses known Gmail SMTP IPv4 addresses as default:
   - `74.125.133.108` (primary)
   - `74.125.193.108`
   - `74.125.67.108`
   - `74.125.133.109`
   - `74.125.193.109`

2. **Configurable via env var** - Override with `GMAIL_SMTP_HOST`:
   ```bash
   GMAIL_SMTP_HOST=74.125.133.108
   ```

3. **DNS lookup still forced to IPv4** - Custom `lookup` function using `dns.lookup(hostname, { family: 4 })`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GMAIL_SMTP_HOST` | Explicit IPv4 host (optional) | First IP in fallback list |
| `GMAIL_USER` | Gmail address | Required |
| `GMAIL_APP_PASSWORD` | Gmail App Password | Required |

## Railway Deployment Steps

1. **Set Start Command** (Railway Dashboard → Service → Settings):
   ```
   node --dns-result-order=ipv4first dist/index.js
   ```

2. **Add Environment Variables** (Railway Dashboard → Variables):
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-char-app-password
   # Optional: override SMTP host
   # GMAIL_SMTP_HOST=74.125.133.108
   ```

3. **Deploy** - Push latest commit or trigger redeploy

## Verification

Monitor logs for successful email delivery:
- ✅ `Gmail provider initialized with IPv4` with `explicitIP: true`
- ✅ No more `ENETUNREACH 2607:f8b0:4004:c09::6c:587` errors
- ✅ OTP emails delivered successfully

## Why Both?

| Layer | Fix | Handles |
|-------|-----|---------|
| **Runtime** | `--dns-result-order=ipv4first` | All DNS lookups in process |
| **Application** | Explicit IPv4 + custom lookup | Gmail SMTP specifically |
| **Combined** | Defense in depth | Maximum reliability |