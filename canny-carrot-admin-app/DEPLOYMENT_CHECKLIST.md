# Admin Console Deployment Checklist

## Current Status
- ✅ Admin app code is ready (Next.js app)
- ✅ API routes configured (`/api/businesses`, `/api/customers`)
- ✅ Redis service configured to use `api.cannycarrot.com`
- ⏳ **Needs deployment to Vercel**
- ⏳ **Needs domain setup: `admin.cannycarrot.com`**

## Deployment Steps

### Step 1: Deploy to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import Repository:**
   - If repository exists: Select `canny-carrot-admin-console`
   - If not: Create new repository first, then import

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `canny-carrot-admin-app` (if repo is at root)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** Leave empty (Next.js default)

4. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_API_URL` = `https://api.cannycarrot.com`
     - `API_BASE_URL` = `https://api.cannycarrot.com`
   - Apply to: Production, Preview, Development

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Note the deployment URL (e.g., `canny-carrot-admin-console.vercel.app`)

### Step 2: Add Custom Domain

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter: `admin.cannycarrot.com`

2. **Configure DNS:**
   - Vercel will show DNS instructions
   - **Option A (Recommended):** Add CNAME record
     - Type: `CNAME`
     - Name: `admin`
     - Value: `cname.vercel-dns.com`
   - **Option B:** Add A record (if CNAME not supported)
     - Use the IP addresses Vercel provides

3. **Wait for DNS Propagation:**
   - Usually 5-60 minutes
   - Check: `nslookup admin.cannycarrot.com`
   - Vercel will automatically provision SSL certificate

### Step 3: Verify Deployment

1. **Test Admin Console:**
   - Visit: `https://admin.cannycarrot.com`
   - Should see "Canny Carrot Admin" header
   - Should see "Members" and "Customers" tabs

2. **Test Data Loading:**
   - Click "Members" tab
   - Should show businesses from Redis (if any exist)
   - Click "Customers" tab
   - Should show customers from Redis (if any exist)

3. **Check for Errors:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API calls to `api.cannycarrot.com`

### Step 4: Verify API Server

The admin console requires the API server to be deployed:

1. **Check API Server:**
   ```powershell
   Invoke-RestMethod -Uri 'https://api.cannycarrot.com/health'
   ```
   - Should return: `{"status":"ok","redis":"connected"}`

2. **If API server is not deployed:**
   - See: `canny-carrot-api/DEPLOYMENT_STEPS.md`
   - Deploy API server first before admin console will work

## Prerequisites

Before deploying admin console, ensure:

- ✅ API server is deployed at `https://api.cannycarrot.com`
- ✅ API server can connect to Redis
- ✅ DNS access to configure `admin.cannycarrot.com` subdomain
- ✅ Vercel account with access to deploy projects

## Troubleshooting

**"Failed to load data" error:**
- Check API server is deployed: `https://api.cannycarrot.com/health`
- Verify environment variable `NEXT_PUBLIC_API_URL` is set
- Check browser console for specific error messages

**Domain not resolving:**
- Verify DNS records are correct
- Wait up to 24 hours for full propagation
- Check DNS with: `nslookup admin.cannycarrot.com`

**Build fails:**
- Check Node.js version (requires 18+)
- Review build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

## Next Steps After Deployment

Once `admin.cannycarrot.com` is live:

1. Test creating a business via admin console
2. Test creating a customer via admin console
3. Verify data appears in Redis
4. Test all CRUD operations (Create, Read, Update, Delete)





