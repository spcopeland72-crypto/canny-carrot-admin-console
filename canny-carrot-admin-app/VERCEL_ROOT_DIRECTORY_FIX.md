# Vercel 404 Fix - Root Directory Configuration

## Problem
The admin console is returning 404 errors because:
1. The Next.js app is in a subdirectory (`canny-carrot-admin-app`) but Vercel is building from the repository root
2. The custom domain `admin.cannycarrot.com` is not configured in Vercel

## Solution

### Option 1: Set Root Directory in Vercel Dashboard (RECOMMENDED)

1. Go to Vercel Dashboard → Your Project → Settings → General
2. Scroll to "Root Directory"
3. Click "Edit"
4. Enter: `canny-carrot-admin-app`
5. Click "Save"
6. Vercel will redeploy automatically

### Option 2: Move vercel.json to Repository Root

If the repository root contains a `vercel.json`, you can specify the root directory there, but Option 1 is cleaner.

## Add Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `admin.cannycarrot.com`
4. Follow Vercel's DNS instructions to add the CNAME record
5. Wait for DNS propagation (5-60 minutes)

## Verify

After making these changes:
1. Check the `.vercel.app` URL works: `https://canny-carrot-admin-console.vercel.app`
2. After DNS propagates, check `https://admin.cannycarrot.com`

## Current Status

- ✅ Deployment status: Ready
- ⚠️ Root Directory: Needs to be set to `canny-carrot-admin-app`
- ⚠️ Custom Domain: `admin.cannycarrot.com` not added

