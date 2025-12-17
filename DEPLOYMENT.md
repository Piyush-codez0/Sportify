# 🚀 Deployment Guide - Sportify

This guide explains how to host the Sportify project using GitHub integration with various hosting platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [GitHub Actions Setup](#github-actions-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

✅ GitHub account with repository access  
✅ All third-party service accounts configured:
  - MongoDB Atlas (database)
  - Cloudinary (file storage)
  - Razorpay (payment gateway)
  - Gmail (email service)
  - Google Maps API (location services)

📝 **See main README.md for detailed setup instructions for each service**

---

## Deployment Options

Sportify is a **full-stack Next.js application** with:
- Server-side API routes
- Database connections (MongoDB)
- File uploads
- Payment processing
- Email sending

### ✅ Supported Platforms

1. **Vercel** (Recommended) - Native Next.js support, GitHub integration
2. **Netlify** - Full support for Next.js with Netlify Functions
3. **Railway** - Node.js hosting with persistent storage
4. **Render** - Docker or native Node.js deployment
5. **AWS/GCP/Azure** - Full control with containerization

### ❌ Not Supported

- **GitHub Pages** - Static sites only, no server-side code
- **Surge** - Static hosting only

---

## Vercel Deployment (Recommended)

Vercel provides the best experience for Next.js applications with zero-config deployment.

### Method 1: Vercel Dashboard (Easiest)

1. **Visit Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose `Piyush-codez0/Sportify` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**
   
   Click "Environment Variables" and add all variables from `.env.example`:

   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret_here
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=your_secret_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
   ```

   ⚠️ **Important**: Use **production credentials** (not test keys)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://sportify-xxx.vercel.app`

6. **Custom Domain** (Optional)
   - Project Settings → Domains
   - Add your custom domain (e.g., `sportify.com`)
   - Configure DNS as instructed

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Environment variables will be prompted or can be added in dashboard
```

### Method 3: GitHub Actions (Automated)

The repository includes `.github/workflows/deploy-vercel.yml` for automatic deployments.

**Setup**:

1. **Get Vercel Credentials**
   ```bash
   # Install Vercel CLI if not already installed
   npm install -g vercel
   
   # Link project
   vercel link
   
   # This creates .vercel directory with project.json
   ```

2. **Extract Project IDs**
   ```bash
   cat .vercel/project.json
   # Copy "orgId" and "projectId"
   ```

3. **Get Vercel Token**
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Create new token
   - Copy the token

4. **Add GitHub Secrets**
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `VERCEL_TOKEN`: Your Vercel token
     - `VERCEL_ORG_ID`: Organization ID from project.json
     - `VERCEL_PROJECT_ID`: Project ID from project.json

5. **Automatic Deployments**
   - Every push to `main` branch triggers automatic deployment
   - Can also trigger manually: Actions → Deploy to Vercel → Run workflow

---

## GitHub Actions Setup

The repository includes two GitHub Actions workflows:

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers**: Push to `main`/`develop`, Pull Requests

**Jobs**:
- Install dependencies
- Run linting
- Build application
- Test on Node.js 18.x and 20.x

**Setup**: Works automatically, no configuration needed

### 2. Vercel Deployment Workflow (`.github/workflows/deploy-vercel.yml`)

**Triggers**: Push to `main`, Manual trigger

**Jobs**:
- Deploy to Vercel production

**Setup**: Requires secrets (see Method 3 above)

---

## Environment Variables

### Required Variables

All environment variables must be set in your hosting platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens (min 32 chars) | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | `rzp_live_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | `xxxxx` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `xxxxx` |
| `EMAIL_USER` | Gmail address | `your@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password (16 chars) | `xxxx xxxx xxxx xxxx` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIzaSyXXXXX` |

### Generating Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Test vs Production Keys

⚠️ **Important Differences**:

| Service | Test Mode | Production Mode |
|---------|-----------|-----------------|
| Razorpay | `rzp_test_xxxxx` | `rzp_live_xxxxx` |
| MongoDB | Development cluster | Production cluster |
| Cloudinary | Same for both | Same for both |
| Gmail | Same for both | Same for both |
| Google Maps | Development restrictions | Production domain restrictions |

---

## Post-Deployment

### 1. Verify Deployment

Test all critical features:

- [ ] User registration and login
- [ ] Tournament creation (Organizer)
- [ ] Tournament browsing with location filters
- [ ] Payment processing (use test cards first)
- [ ] Email notifications
- [ ] File uploads (Aadhar documents)
- [ ] Google Maps integration

### 2. Update Third-Party Services

#### Razorpay
```
Dashboard → Settings → Webhooks
Add: https://your-domain.com/api/webhooks/razorpay
Events: payment.captured, payment.failed
```

#### Cloudinary
```
Settings → Security → Allowed domains
Add: your-domain.com
```

#### Google Maps
```
Google Cloud Console → Credentials → API Key
Application restrictions → HTTP referrers
Add: https://your-domain.com/*
```

#### MongoDB Atlas
```
Network Access → IP Access List
Add: 0.0.0.0/0 (for Vercel)
Or specific IPs for your platform
```

### 3. Configure Custom Domain (Optional)

**On Vercel**:
1. Project Settings → Domains
2. Add domain (e.g., `sportify.com`, `www.sportify.com`)
3. Update DNS records at your domain registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.19.19

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-30 minutes)
5. SSL certificate auto-generated

### 4. Enable Analytics (Optional)

**Vercel Analytics**:
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 5. Set Up Monitoring

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Vercel Analytics** for performance
- **Google Analytics** for user tracking

---

## Troubleshooting

### Build Failures

**Error**: `Module not found: Can't resolve 'fs'`
```bash
# Solution: This is normal for client-side code
# Next.js automatically handles it
```

**Error**: `Environment variable not defined`
```bash
# Solution: Ensure all env vars are set in hosting platform
# Check for typos in variable names
```

**Error**: `Cannot find module '@/...'`
```bash
# Solution: Check tsconfig.json paths configuration
# Verify all imports use correct aliases
```

### Runtime Errors

**MongoDB Connection Failed**
```bash
# Check:
1. MONGODB_URI is correct
2. Database user has correct permissions
3. IP whitelist includes hosting platform IPs (0.0.0.0/0 for Vercel)
4. Password is URL-encoded if it contains special chars
```

**Payment Verification Failed**
```bash
# Check:
1. Using production Razorpay keys (rzp_live_)
2. RAZORPAY_KEY_SECRET matches key ID
3. Webhook signature validation is enabled
```

**Email Not Sending**
```bash
# Check:
1. Using Gmail App Password (not regular password)
2. 2-Factor Authentication enabled on Gmail
3. EMAIL_USER and EMAIL_PASSWORD are correct
4. Less secure app access NOT enabled (use app password instead)
```

**File Upload Failed**
```bash
# Check:
1. Cloudinary credentials are correct
2. Upload preset allows unsigned uploads (if using)
3. File size is within limits (10MB default)
```

### Performance Issues

**Slow API Responses**
```bash
# Solutions:
1. Add MongoDB indexes (already configured)
2. Enable Vercel Edge Functions for API routes
3. Implement caching for tournament listings
4. Optimize database queries with .lean()
```

**High Build Times**
```bash
# Solutions:
1. Use npm ci instead of npm install
2. Enable Turbopack: next dev --turbo
3. Configure output: 'standalone' in next.config.ts
```

### Debugging Tips

**Enable Debug Logs**:
```bash
# Add to .env
DEBUG=*
NODE_ENV=development
```

**Check Vercel Logs**:
```bash
# Via CLI
vercel logs [deployment-url]

# Via Dashboard
Project → Deployments → Select deployment → Logs
```

**Test API Routes Locally**:
```bash
# Start dev server
npm run dev

# Test API endpoint
curl http://localhost:3000/api/tournaments

# Check with authentication
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/organizer/tournaments
```

---

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Razorpay Integration](https://razorpay.com/docs/payments/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

## Security Checklist

Before going live:

- [ ] All environment variables use production credentials
- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] MongoDB has strong password and IP whitelist
- [ ] Razorpay webhook signature validation enabled
- [ ] Google Maps API key has domain restrictions
- [ ] Cloudinary has allowed domain list
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] No sensitive data in Git history
- [ ] `.env.local` in `.gitignore`
- [ ] Rate limiting configured for API routes
- [ ] CORS properly configured
- [ ] Input validation on all forms

---

## Support

For issues or questions:
- Open an issue: [GitHub Issues](https://github.com/Piyush-codez0/Sportify/issues)
- Check logs in hosting platform dashboard
- Review Next.js documentation
- Contact service providers (Vercel, MongoDB, etc.)

---

**Made with ❤️ for Indian Sports Community**

*Last Updated: December 2024*
