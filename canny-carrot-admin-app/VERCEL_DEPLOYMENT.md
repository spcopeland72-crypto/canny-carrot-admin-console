# Vercel Deployment Guide - Admin App

## Setup Steps

1. **Connect Repository to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import the `canny-carrot-admin-console` repository
   - Select the repository

2. **Configure Build Settings:**
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `web-build`
   - **Install Command:** `npm install`

3. **Environment Variables:**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   
   | Key | Value | Environment |
   |-----|-------|-------------|
   | `EXPO_PUBLIC_API_URL` | `https://api.cannycarrot.com` | Production, Preview, Development |

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to the repository

## Notes

- The app builds using `expo export:web` which creates a static export
- The API URL is configured via environment variable `EXPO_PUBLIC_API_URL`
- This can also be set in `app.json` `extra.apiUrl` but env var takes precedence for web

## Custom Domain (Optional)

After deployment, you can add a custom domain:
- Settings → Domains
- Add `admin.cannycarrot.com` (or your preferred subdomain)

