# Fix 404 Error on admin.cannycarrot.com

## Root Cause

The 404 error is caused by **two issues**:

1. **Root Directory Not Configured**: Vercel is building from the repository root, but the Next.js app is in the `canny-carrot-admin-app` subdirectory
2. **Custom Domain Not Added**: `admin.cannycarrot.com` is not configured in Vercel's domain settings

## Fix Steps

### Step 1: Configure Root Directory in Vercel

1. Go to: https://vercel.com/spcopeland72-cryptos-projects/canny-carrot-admin-console/settings/general
2. Scroll to **"Root Directory"** section
3. Click **"Edit"**
4. Enter: `canny-carrot-admin-app`
5. Click **"Save"**
6. Vercel will automatically trigger a new deployment

**Why this fixes it**: Vercel needs to know where your Next.js app is located. Currently it's looking at the repo root which doesn't have the app files.

### Step 2: Add Custom Domain

1. Go to: https://vercel.com/spcopeland72-cryptos-projects/canny-carrot-admin-console/settings/domains
2. Click **"Add Domain"**
3. Enter: `admin.cannycarrot.com`
4. Click **"Add"**
5. Follow Vercel's DNS instructions:
   - Add a **CNAME** record in your DNS provider:
     - Name: `admin`
     - Value: `cname.vercel-dns.com` (or the specific CNAME Vercel provides)
6. Wait for DNS propagation (5-60 minutes)
7. Vercel will automatically provision SSL certificate

### Step 3: Verify

After both fixes:

1. **Test `.vercel.app` URL first** (should work immediately after Step 1):
   - https://canny-carrot-admin-console.vercel.app
   - Should show the admin console, not 404

2. **Test custom domain** (after DNS propagates, ~5-60 min after Step 2):
   - https://admin.cannycarrot.com
   - Should show the admin console

## Current Status

✅ **Deployment**: Ready (build succeeded)  
✅ **API Server**: Working (api.cannycarrot.com/health returns OK)  
✅ **Redis**: Connected  
❌ **Root Directory**: Not configured (needs `canny-carrot-admin-app`)  
❌ **Custom Domain**: Not added (admin.cannycarrot.com missing)

## Expected Behavior After Fix

- The admin console should load at both URLs
- "Members" and "Customers" tabs should be visible
- Data should load from Redis via api.cannycarrot.com
- No 404 errors

## Troubleshooting

If still getting 404 after fixing root directory:

1. Check build logs in Vercel dashboard
2. Verify `app/page.tsx` exists in `canny-carrot-admin-app/app/`
3. Check that `package.json` has `"build": "next build"` script
4. Verify Next.js is properly installed (`node_modules` exists)

If custom domain not working:

1. Check DNS records: `nslookup admin.cannycarrot.com`
2. Verify CNAME points to Vercel
3. Wait up to 24 hours for full DNS propagation
4. Check Vercel domain status shows "Valid Configuration"

