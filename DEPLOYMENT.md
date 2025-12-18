# Vercel Deployment Guide for Sportify

## Prerequisites

1. Create accounts on:
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
   - [Cloudinary](https://cloudinary.com/) (Free tier available)
   - [Razorpay](https://razorpay.com/) (For payment processing)
   - [Vercel](https://vercel.com/) (Free hobby plan)

## Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/sportify`)
5. Replace `<password>` with your actual password
6. Replace `myFirstDatabase` with `sportify`

## Step 2: Set Up Cloudinary

1. Go to https://cloudinary.com/
2. Sign up and get your dashboard credentials
3. Note down:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: Set Up Razorpay

1. Go to https://razorpay.com/
2. Create an account
3. Go to Settings → API Keys
4. Generate Test/Live Keys
5. Note down:
   - Key ID
   - Key Secret

## Step 4: Configure Environment Variables Locally

Create a `.env.local` file in the project root with these variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sportify

# JWT Authentication
JWT_SECRET=generate_a_random_32_character_string_here

# NextAuth
NEXTAUTH_SECRET=generate_another_random_32_character_string
NEXTAUTH_URL=http://localhost:3000

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

To generate random secrets for JWT_SECRET and NEXTAUTH_SECRET, run in PowerShell:

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

## Step 5: Test Build Locally

```bash
npm run build
```

If successful, you should see: ✓ Compiled successfully

## Step 6: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI globally:

```bash
npm i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy:

```bash
vercel
```

4. When prompted:

   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time) or **Y** (subsequent)
   - Project name: `sportify`
   - Directory: `./` (press Enter)
   - Override settings? **N**

5. Add environment variables:

```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

For each command, paste the value and select "Production, Preview, Development"

6. Redeploy to apply environment variables:

```bash
vercel --prod
```

### Option B: Using Vercel Dashboard (Easier)

1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Click "Environment Variables"
6. Add all variables from your `.env.local`:
   - MONGODB_URI
   - JWT_SECRET
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (use `https://your-project.vercel.app`)
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
7. Click "Deploy"

## Step 7: Update NEXTAUTH_URL

After first deployment:

1. Go to Vercel dashboard
2. Find your deployment URL (e.g., `sportify-abc123.vercel.app`)
3. Update `NEXTAUTH_URL` environment variable to: `https://sportify-abc123.vercel.app`
4. Redeploy

## Step 8: Configure MongoDB Network Access

1. Go to MongoDB Atlas dashboard
2. Click "Network Access"
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required for Vercel's dynamic IPs
5. Click "Confirm"

## Troubleshooting Common Errors

### Error: "MONGODB_URI environment variable not defined"

- Make sure you added the environment variable in Vercel dashboard
- Redeploy after adding variables

### Error: "Failed to connect to MongoDB"

- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify connection string is correct
- Ensure password doesn't contain special characters (or URL encode them)

### Error: "Cloudinary configuration error"

- Verify all three Cloudinary variables are set correctly
- Check for typos in API keys

### Error: Build fails with TypeScript errors

- Run `npm run build` locally first
- Fix any TypeScript errors before deploying

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test login functionality
- [ ] Test tournament creation
- [ ] Test image uploads
- [ ] Test payment integration (use Razorpay test mode)
- [ ] Check all API routes work
- [ ] Verify email notifications (if configured)

## Useful Commands

```bash
# View deployment logs
vercel logs

# Check environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.local

# Promote staging to production
vercel --prod

# Remove a deployment
vercel rm <deployment-url>
```

## Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Update NEXTAUTH_URL to your custom domain

## Monitoring & Analytics

- Check Vercel Analytics dashboard for performance metrics
- Set up Vercel Monitoring for real-time error tracking
- Use MongoDB Atlas monitoring for database metrics

---

Need help? Check the official docs:

- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Next.js on Vercel](https://nextjs.org/docs/deployment)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
