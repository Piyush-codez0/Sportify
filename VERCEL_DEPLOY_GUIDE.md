# 🚀 Quick Vercel Deployment Guide for Sportify

This guide will help you deploy Sportify to Vercel in just a few minutes.

## 📋 Prerequisites

Before deploying, make sure you have:

- ✅ A Vercel account ([Sign up free](https://vercel.com/signup))
- ✅ All service accounts configured (MongoDB, Razorpay, Cloudinary, Gmail, Google Maps)
- ✅ Your environment variables ready (see `.env.example`)

## 🎯 Three Ways to Deploy

### Option 1: One-Click Deploy (Easiest) ⚡

**Best for: First-time deployment**

1. Click this button:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Piyush-codez0/Sportify)

2. **Connect GitHub**: Sign in with your GitHub account

3. **Configure Repository**:
   - Repository name: `Sportify` (or your preferred name)
   - Private/Public: Your choice
   - Click "Create"

4. **Add Environment Variables**:
   - Click "Environment Variables" section
   - Add all 10 variables from `.env.example`:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=<generate with: openssl rand -base64 32>
     NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
     RAZORPAY_KEY_SECRET=...
     CLOUDINARY_CLOUD_NAME=...
     CLOUDINARY_API_KEY=...
     CLOUDINARY_API_SECRET=...
     EMAIL_USER=your@gmail.com
     EMAIL_PASSWORD=<16-char app password>
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
     ```

5. **Deploy**: Click "Deploy" button

6. **Wait**: Build takes 2-3 minutes

7. **Done!** 🎉 Your site is live at `https://sportify-xxx.vercel.app`

---

### Option 2: Vercel Dashboard (Manual) 🖱️

**Best for: More control over settings**

1. **Go to Vercel Dashboard**: [vercel.com/new](https://vercel.com/new)

2. **Import Git Repository**:
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose `Piyush-codez0/Sportify`

3. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Environment Variables**:
   - Expand "Environment Variables"
   - Add each variable from `.env.example`
   - Make sure to use **production values** (not test/dummy values)

5. **Deploy**: Click "Deploy"

6. **Monitor Build**:
   - Watch the build logs
   - Should complete in 2-3 minutes
   - If errors occur, check environment variables

7. **Success**: Your deployment URL will be shown

---

### Option 3: Vercel CLI (Command Line) 💻

**Best for: Developers, automation**

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

Enter your email, check inbox for verification link, and click it.

#### Step 3: Navigate to Project

```bash
cd /path/to/Sportify
```

#### Step 4: Deploy

**For Preview Deployment** (test first):
```bash
vercel
```

**For Production Deployment**:
```bash
vercel --prod
```

#### Step 5: Add Environment Variables

**Option A: Via Dashboard** (Recommended)
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Select your project → Settings → Environment Variables
- Add all variables from `.env.example`

**Option B: Via CLI** (One at a time)
```bash
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production
# ... repeat for all variables
```

#### Step 6: Redeploy After Adding Variables

```bash
vercel --prod
```

---

## 🛠️ Using the Deployment Script

We've included a convenient script to automate the CLI deployment:

```bash
# Make it executable (if needed)
chmod +x deploy-to-vercel.sh

# Run the script
./deploy-to-vercel.sh
```

The script will:
- ✅ Check for Vercel CLI installation
- ✅ Verify you're logged in
- ✅ Link your project
- ✅ Guide you through environment setup
- ✅ Deploy to preview or production

---

## 🔐 Environment Variables Checklist

Make sure you have all these ready:

| Variable | Where to Get | Example |
|----------|--------------|---------|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) | `mongodb+srv://...` |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` | `abc123...` (32+ chars) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | [Razorpay Dashboard](https://dashboard.razorpay.com) | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard | `secret123...` |
| `CLOUDINARY_CLOUD_NAME` | [Cloudinary Console](https://console.cloudinary.com) | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary Console | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary Console | `secret123...` |
| `EMAIL_USER` | Your Gmail address | `your@gmail.com` |
| `EMAIL_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) | `AIzaSy...` |

---

## ✅ Post-Deployment Checklist

After deployment, complete these steps:

### 1. Test Your Deployment

Visit your deployment URL and test:
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Tournament creation (as organizer)
- [ ] Tournament browsing
- [ ] Payment flow (use test cards)
- [ ] Email notifications received
- [ ] File uploads work
- [ ] Google Maps displays correctly

### 2. Update Service Configurations

#### Razorpay
```
1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Add webhook URL: https://your-domain.vercel.app/api/webhooks/razorpay
3. Select events: payment.captured, payment.failed
4. Save
```

#### Cloudinary
```
1. Go to: https://console.cloudinary.com/settings/security
2. Add to Allowed domains: your-domain.vercel.app
3. Save
```

#### Google Maps
```
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your API key
3. Under "Application restrictions" → HTTP referrers
4. Add: https://your-domain.vercel.app/*
5. Save
```

#### MongoDB Atlas
```
1. Go to: https://cloud.mongodb.com/
2. Network Access → IP Access List
3. Add IP: 0.0.0.0/0 (or specific Vercel IPs)
4. Save
```

### 3. Configure Custom Domain (Optional)

If you have a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `sportify.com`)
4. Follow DNS configuration instructions:
   ```
   Type: A
   Name: @
   Value: 76.76.19.19

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. Wait 5-30 minutes for DNS propagation
6. SSL certificate is automatically generated

### 4. Enable Analytics (Optional)

**Vercel Analytics**:
```bash
npm install @vercel/analytics
```

Then add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// Inside your component
<Analytics />
```

---

## 🐛 Troubleshooting

### Build Fails with "Module not found"

**Solution**: Ensure all dependencies are in `package.json` and `package-lock.json` is committed.

### "Environment variable not found" error

**Solution**: 
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure ALL variables from `.env.example` are added
3. Click "Redeploy" button

### MongoDB Connection Failed

**Solution**:
1. Check MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
2. Verify `MONGODB_URI` is correct
3. Ensure password is URL-encoded if it contains special characters

### Payment/Razorpay not working

**Solution**:
1. Verify you're using production keys (`rzp_live_...`)
2. Check `RAZORPAY_KEY_SECRET` matches the key ID
3. Add webhook URL in Razorpay dashboard

### Emails not sending

**Solution**:
1. Verify Gmail App Password (not regular password)
2. Ensure 2-Factor Authentication is enabled on Gmail
3. Check `EMAIL_USER` and `EMAIL_PASSWORD` are correct

---

## 📊 Monitoring Your Deployment

### View Logs
```bash
# Real-time logs
vercel logs

# Logs for specific deployment
vercel logs <deployment-url>
```

### Check Build Status
- Vercel Dashboard → Your Project → Deployments
- Click on deployment to see detailed logs

### Performance Monitoring
- Vercel Dashboard → Your Project → Analytics
- View: Traffic, Performance, Speed Insights

---

## 🔄 Updating Your Deployment

### Automatic Deployments (GitHub Integration)

Every push to `main` branch automatically deploys to production!

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Manual Redeployment

```bash
# Via CLI
vercel --prod

# Via Dashboard
# Click "Redeploy" button on any previous deployment
```

---

## 🎯 Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check who's logged in
vercel whoami

# List deployments
vercel ls

# View logs
vercel logs

# Add environment variable
vercel env add VARIABLE_NAME production

# Link to existing project
vercel link

# Pull environment variables
vercel env pull
```

---

## 🆘 Need Help?

- **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md) - Comprehensive guide
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **GitHub Issues**: [Report a problem](https://github.com/Piyush-codez0/Sportify/issues)

---

## 🎉 Success!

Your Sportify application should now be live on Vercel! 

**Share your deployment URL**: `https://your-project.vercel.app`

Don't forget to:
- ✅ Test all features thoroughly
- ✅ Update service configurations
- ✅ Monitor logs for any errors
- ✅ Set up custom domain (optional)

**Happy hosting! 🚀⚽🏆**

---

*Made with ❤️ for Indian Sports Community*
