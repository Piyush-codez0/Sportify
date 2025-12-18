# 🚀 Deploy Sportify to Vercel NOW

## Quick Start - Choose Your Method

### 🎯 Method 1: One-Click Deploy (Recommended for First Time)

**Time: 5 minutes**

1. **Click this button** → [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Piyush-codez0/Sportify)

2. **Sign in** with your GitHub account (or create free Vercel account)

3. **Configure Project**:
   - Repository Name: `Sportify` (or your choice)
   - Keep all default settings (Next.js detected automatically)

4. **Add Environment Variables** - Expand the section and add these 10 variables:

   ```bash
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/sportify?retryWrites=true&w=majority
   JWT_SECRET=<run: openssl rand -base64 32>
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_yourkey
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

5. **Click Deploy** - Wait 2-3 minutes

6. **Done!** 🎉 Your site is live at `https://sportify-xxx.vercel.app`

---

### 🤖 Method 2: Automated Script (Fastest)

**Time: 2 minutes**

```bash
# Step 1: Make script executable
chmod +x deploy-to-vercel.sh

# Step 2: Run the script
./deploy-to-vercel.sh
```

The script will:
- ✅ Install Vercel CLI if needed
- ✅ Login to Vercel (opens browser)
- ✅ Link your project
- ✅ Guide you through adding environment variables
- ✅ Deploy to production

**Follow the prompts!**

---

### 💻 Method 3: Manual CLI (Most Control)

**Time: 3 minutes**

```bash
# Step 1: Install Vercel CLI
npm install -g vercel

# Step 2: Login
vercel login
# Check your email and click the verification link

# Step 3: Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? → No (first time)
# - What's your project's name? → sportify
# - In which directory? → ./ (press Enter)
# - Override settings? → No (press Enter)
```

After deployment, add environment variables:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add all 10 variables from above
5. Redeploy: `vercel --prod`

---

## 📋 Before You Deploy - Get Your Keys Ready

### 1. MongoDB Atlas
- **Sign up**: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Create cluster** (free M0 tier)
- **Get connection string**: Connect → Drivers → Copy connection string
- **Format**: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sportify?retryWrites=true&w=majority`

### 2. Razorpay (Payment Gateway)
- **Sign up**: [razorpay.com](https://razorpay.com)
- **Switch to Live Mode** (top-right toggle)
- **Get keys**: Settings → API Keys → Generate Live Keys
- **Note**: Key ID starts with `rzp_live_`

### 3. Cloudinary (File Storage)
- **Sign up**: [cloudinary.com](https://cloudinary.com)
- **Get credentials**: Dashboard → Account Details
- **Copy**: Cloud Name, API Key, API Secret

### 4. Gmail (Email Service)
- **Enable 2FA**: Google Account → Security → 2-Step Verification
- **Generate App Password**: Security → App Passwords → Mail → Other
- **Name it**: "Sportify"
- **Copy**: 16-character password (remove spaces)

### 5. Google Maps API
- **Console**: [console.cloud.google.com](https://console.cloud.google.com)
- **Create project**: "Sportify"
- **Enable APIs**: Maps JavaScript, Places API, Geocoding API
- **Create key**: APIs & Services → Credentials → Create API Key
- **Copy**: Your API key

### 6. JWT Secret
```bash
# Generate a secure random secret:
openssl rand -base64 32

# Copy the output - it should be at least 32 characters
```

---

## ✅ After Deployment Checklist

Once deployed, complete these steps:

### 1. Test Your Deployment ✓

Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] User registration
- [ ] User login
- [ ] Create tournament (as organizer)
- [ ] Browse tournaments
- [ ] Make payment (use test card: 4111 1111 1111 1111)
- [ ] Check email notifications
- [ ] Upload file (Aadhar)
- [ ] View map

### 2. Update Service Configurations ✓

#### Razorpay Webhook
```
1. https://dashboard.razorpay.com/app/webhooks
2. Add URL: https://YOUR-DOMAIN.vercel.app/api/webhooks/razorpay
3. Events: payment.captured, payment.failed
```

#### Cloudinary Domain
```
1. https://console.cloudinary.com/settings/security
2. Allowed domains: YOUR-DOMAIN.vercel.app
```

#### Google Maps Restrictions
```
1. https://console.cloud.google.com/apis/credentials
2. Edit API Key → HTTP referrers
3. Add: https://YOUR-DOMAIN.vercel.app/*
```

#### MongoDB IP Whitelist
```
1. https://cloud.mongodb.com/
2. Network Access → Add IP: 0.0.0.0/0
   (Allows all IPs - required for Vercel)
```

### 3. Set Custom Domain (Optional) ✓

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add Domain: `your-domain.com`
3. Configure DNS:
   ```
   A Record:    @ → 76.76.19.19
   CNAME Record: www → cname.vercel-dns.com
   ```
4. Wait 5-30 minutes for DNS propagation
5. SSL auto-enabled ✅

---

## 🐛 Common Issues & Solutions

### Issue: Build fails with "Module not found"
**Solution**: 
```bash
# Ensure dependencies are installed
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Issue: "Environment variable not found"
**Solution**: Go to Vercel Dashboard → Settings → Environment Variables
- Add ALL 10 variables
- Click "Redeploy" button

### Issue: MongoDB connection failed
**Solution**:
- Check IP whitelist (0.0.0.0/0)
- Verify MONGODB_URI is correct
- URL-encode password if it has special characters

### Issue: Payment not working
**Solution**:
- Use production keys (rzp_live_)
- Add webhook URL in Razorpay dashboard
- Check RAZORPAY_KEY_SECRET matches key ID

### Issue: Emails not sending
**Solution**:
- Use Gmail App Password (not regular password)
- Enable 2FA on Gmail account
- Remove spaces from app password

---

## 📞 Need Help?

- 📖 **Quick Guide**: [VERCEL_DEPLOY_GUIDE.md](VERCEL_DEPLOY_GUIDE.md)
- 📚 **Full Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🤝 **Get Support**: [GitHub Issues](https://github.com/Piyush-codez0/Sportify/issues)

---

## 🎉 Success!

Your Sportify application is now live! Share your URL:

**`https://YOUR-PROJECT.vercel.app`**

### Next Steps:
1. ✅ Test all features
2. ✅ Update service webhooks
3. ✅ Configure custom domain
4. ✅ Monitor with Vercel Analytics
5. ✅ Share with users!

**Made with ❤️ for Indian Sports Community** 🏆⚽🏏

---

*Deploy Time: ~5 minutes | Cost: $0 (Free tier) | Automatic SSL ✓*
