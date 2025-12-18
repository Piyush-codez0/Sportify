<div align="center">

# ⚽ Sportify - Revolutionizing Local Sports in India 🏆

### _Where Tournaments Meet Technology_

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[![CI](https://github.com/Piyush-codez0/Sportify/actions/workflows/ci.yml/badge.svg)](https://github.com/Piyush-codez0/Sportify/actions/workflows/ci.yml)
[![Deploy to Vercel](https://github.com/Piyush-codez0/Sportify/actions/workflows/deploy-vercel.yml/badge.svg)](https://github.com/Piyush-codez0/Sportify/actions/workflows/deploy-vercel.yml)

_A comprehensive digital ecosystem connecting tournament organizers, players, and sponsors across India_

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Deployment](#-deployment) • [Setup Guide](#-complete-setup-guide)

---

## 🚀 Deployment

**Deploy to production in minutes:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Piyush-codez0/Sportify)

### Quick Deploy Options

| Method | Time | Best For |
|--------|------|----------|
| **[One-Click Vercel](https://vercel.com/new/clone?repository-url=https://github.com/Piyush-codez0/Sportify)** | 5 mins | First-time deployment |
| **[CLI Deployment](#vercel-cli-deployment)** | 3 mins | Developers |
| **[Automated Script](./deploy-to-vercel.sh)** | 2 mins | Quick setup |

### Vercel CLI Deployment

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod

# Or use our automated script
chmod +x deploy-to-vercel.sh
./deploy-to-vercel.sh
```

📖 **Detailed Guides:**
- **[Quick Start Guide →](VERCEL_DEPLOY_GUIDE.md)** - Step-by-step with screenshots
- **[Complete Documentation →](DEPLOYMENT.md)** - All platforms and advanced options

✨ **Features:**
- GitHub Actions CI/CD configured
- Automatic deployments on push to `main`
- Environment variables template (`.env.example`)
- Support for Vercel, Netlify, Railway, and more

---

</div>

## 📖 Abstract

**Sportify** is a cutting-edge web platform designed to **transform the landscape of local sports tournaments in India**. Built with modern web technologies, Sportify bridges the gap between sports organizers, enthusiastic players, and potential sponsors, creating a unified ecosystem for grassroots sports development.

### 🎯 The Problem We Solve

Local sports tournaments in India face numerous challenges:

- **Fragmented Communication**: Organizers struggle to reach potential participants
- **Manual Registration Chaos**: Paper-based registrations lead to errors and inefficiencies
- **Limited Visibility**: Talented players miss opportunities due to lack of awareness
- **Sponsorship Disconnection**: Brands can't easily find relevant tournaments to sponsor
- **Trust Issues**: No verification system for participants or transparent payment tracking

### 💡 Our Solution

Sportify provides a **digital-first approach** with:

- 🗺️ **Location-Based Discovery** using geospatial queries (find tournaments within 50km radius)
- 🔐 **Digital Identity Verification** through Aadhar document uploads
- 💳 **Transparent Payment System** with Razorpay integration and server-side verification
- 📧 **Automated Communication** via email notifications for every important event
- 🌓 **Modern UI/UX** with dark mode support and animated sports-themed backgrounds
- 🎭 **Role-Based Dashboards** tailored for organizers, players, and sponsors

### 🌟 Impact

By digitizing the entire tournament lifecycle—from creation to registration to payment—Sportify empowers:

- **Organizers** to manage tournaments professionally with minimal overhead
- **Players** to discover nearby opportunities and build competitive profiles
- **Sponsors** to maximize ROI by targeting relevant sports communities
- **Communities** to foster local sports culture through accessible, transparent platforms

---

## ✨ Features

### 🎭 **Three Distinct User Roles**

#### 🏆 Organizers

- ✅ Create and manage multiple tournaments
- ✅ Set tournament parameters (dates, fees, rules, prizes)
- ✅ Pin exact locations using Google Maps integration
- ✅ Verify player registrations and Aadhar documents
- ✅ Track participant count in real-time
- ✅ Review and manage sponsorship proposals
- ✅ Send automated email notifications to participants

#### ⚽ Players

- ✅ Browse tournaments by location, sport, or city
- ✅ Filter tournaments within custom radius (e.g., 50km)
- ✅ Register individually or as team captain with full roster
- ✅ Upload Aadhar documents for identity verification
- ✅ Complete secure payments via Razorpay gateway
- ✅ Track registration status and payment confirmations
- ✅ View tournament details with Google Maps links

#### 💼 Sponsors

- ✅ Discover relevant tournaments by location and sport
- ✅ Submit sponsorship proposals with custom amounts
- ✅ Choose sponsorship tiers (Title, Platinum, Gold, Silver, Bronze, Associate)
- ✅ Track proposal status (pending/accepted/rejected)
- ✅ Promote brand visibility in sports communities

---

### 🚀 **Core Capabilities**

<table>
<tr>
<td width="50%">

#### 🗺️ **Location Intelligence**

- **Geospatial Indexing**: MongoDB 2dsphere indexes for lightning-fast location queries
- **Radius Search**: Find tournaments within X kilometers of your location
- **City/State Filtering**: Browse by administrative boundaries
- **Google Maps Integration**: Direct navigation to tournament venues
- **Coordinates Storage**: Precise lat/lng for every tournament

</td>
<td width="50%">

#### 🔐 **Security & Verification**

- **JWT Authentication**: Secure token-based auth with 30-day expiration
- **Password Hashing**: bcryptjs with industry-standard salt rounds
- **Aadhar Verification**: Mandatory ID upload for all participants
- **Payment Verification**: HMAC SHA256 signature validation
- **Role-Based Access**: Middleware protection for sensitive routes

</td>
</tr>
<tr>
<td width="50%">

#### 💳 **Payment Processing**

- **Razorpay Integration**: India's leading payment gateway
- **Server-Side Verification**: Cryptographic signature validation
- **Order Management**: Create → Pay → Verify flow
- **Payment Status Tracking**: Real-time updates
- **Refund Support**: Ready for dispute resolution
- **Test Mode**: Safe development with test cards

</td>
<td width="50%">

#### 📧 **Communication System**

- **Automated Emails**: Registration, payment, verification updates
- **Gmail SMTP**: Reliable email delivery
- **Rich Templates**: HTML emails with tournament details
- **Event Notifications**: Reminders for upcoming tournaments
- **Verification Alerts**: Aadhar approval/rejection notices
- **Async Processing**: Non-blocking email queue

</td>
</tr>
<tr>
<td width="50%">

#### 📂 **File Management**

- **Cloudinary Integration**: Cloud-based document storage
- **Aadhar Upload**: Secure ID document handling
- **File Validation**: Type and size restrictions
- **CDN Delivery**: Fast document retrieval
- **Permanent Storage**: Reliable backup system
- **Direct URLs**: Easy access for organizers

</td>
<td width="50%">

#### 🎨 **User Experience**

- **Dark Mode**: System-aware theme with manual toggle
- **Responsive Design**: Mobile-first approach
- **Animated Backgrounds**: Sports-themed doodles
- **Real-time Updates**: Dynamic data without page refresh
- **Form Validation**: Client + server-side checks
- **Loading States**: Clear feedback for async operations

</td>
</tr>
</table>

---

### 🎯 **Advanced Features**

- **Team Registration**: Captains register entire teams with member details
- **Multi-Sport Support**: Cricket, Football, Basketball, Badminton, etc.
- **Tournament Status Tracking**: Upcoming → Ongoing → Completed → Cancelled
- **Registration Deadlines**: Auto-close registrations after deadline
- **Participant Limits**: Max capacity enforcement
- **Prize Pool Management**: Define prizes for multiple positions
- **Entry Fee Flexibility**: Free or paid tournaments
- **Age Group Filtering**: U19, U23, Open, etc.
- **Skill Level Matching**: Beginner, Intermediate, Advanced
- **Sponsorship Tiers**: 6 levels from Title to Associate

---

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 5 (Type-safe development)
- **Styling**: Tailwind CSS 4 (Utility-first, dark mode support)
- **State Management**: React Context API (Auth, Theme)
- **Forms**: Controlled components with validation
- **Icons**: SVG inline components
- **Animations**: CSS keyframes with Tailwind

### **Backend**

- **Runtime**: Node.js (Next.js API Routes)
- **API Design**: RESTful with proper HTTP methods
- **Middleware**: JWT verification, role-based guards
- **File Upload**: Multer for multipart/form-data
- **Error Handling**: Structured error responses

### **Database**

- **Database**: MongoDB Atlas (Cloud-hosted)
- **ODM**: Mongoose 9 (Schema validation, middleware)
- **Indexes**: 2dsphere for geospatial queries, unique for emails
- **Relationships**: Population for cross-collection queries
- **Transactions**: Support for atomic operations

### **Third-Party Services**

- **Payment Gateway**: Razorpay (Test & Production modes)
- **File Storage**: Cloudinary (CDN-backed)
- **Email Service**: Nodemailer with Gmail SMTP
- **Maps**: Google Maps JavaScript API (Places library)

### **Security**

- **Authentication**: JWT (jsonwebtoken library)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv via Next.js
- **CORS**: Next.js built-in handling
- **XSS Protection**: React's auto-escaping

### **Development Tools**

- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Code Quality**: TypeScript strict mode
- **Version Control**: Git
- **Hot Reload**: Next.js Fast Refresh

---

## 🚀 Quick Start

Get Sportify running locally in 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/sportify.git
cd sportify

# 2. Install dependencies
npm install

# 3. Set up environment variables (see .env.local.example)
cp .env.local.example .env.local
# Edit .env.local with your credentials

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔧 Complete Setup Guide

### **Prerequisites**

Before starting, ensure you have:

| Requirement         | Version   | Purpose             |
| ------------------- | --------- | ------------------- |
| Node.js             | 18+       | JavaScript runtime  |
| npm                 | 9+        | Package manager     |
| MongoDB Atlas       | Latest    | Cloud database      |
| Cloudinary Account  | Free tier | File storage        |
| Razorpay Account    | Test mode | Payment processing  |
| Gmail Account       | -         | Email notifications |
| Google Maps API Key | -         | Location services   |

---

### **Step 1: Clone and Install**

```bash
# Clone the repository
git clone https://github.com/yourusername/sportify.git
cd sportify

# Install all dependencies
npm install
```

**Dependencies installed**:

- Next.js, React, TypeScript (framework)
- Mongoose, MongoDB (database)
- bcryptjs, jsonwebtoken (security)
- Razorpay, Cloudinary, Nodemailer (services)
- Tailwind CSS (styling)

---

### **Step 2: MongoDB Setup**

#### Option A: MongoDB Atlas (Recommended)

1. **Create Account**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Choose free M0 tier
3. **Database Access**:
   - Create database user (username + password)
   - Save credentials securely
4. **Network Access**:
   - Add IP: `0.0.0.0/0` (allow all) OR your specific IP
5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sportify?retryWrites=true&w=majority`
   - **Important**: URL-encode password if it contains special characters (@, #, etc.)

#### Option B: Local MongoDB

```bash
# Install MongoDB Community Edition
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com

# Start MongoDB
mongod --dbpath /path/to/data

# Connection string
mongodb://localhost:27017/sportify
```

---

### **Step 3: Cloudinary Setup**

1. **Sign Up**: [cloudinary.com](https://cloudinary.com) (Free tier: 25GB storage)
2. **Get Credentials**:
   - Dashboard → Account Details
   - Copy: `Cloud Name`, `API Key`, `API Secret`
3. **Configure Upload Preset** (Optional):
   - Settings → Upload → Add preset
   - Unsigned for easier integration

---

### **Step 4: Razorpay Setup**

1. **Create Account**: [razorpay.com](https://razorpay.com)
2. **Switch to Test Mode**: Toggle at top-right
3. **Get API Keys**:
   - Settings → API Keys → Generate Test Keys
   - Copy: `Key ID` (starts with `rzp_test_`)
   - Copy: `Key Secret`
4. **Webhook** (Optional):
   - Settings → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/webhooks/razorpay`

---

### **Step 5: Gmail SMTP Setup**

1. **Enable 2-Factor Authentication**:
   - Google Account → Security → 2-Step Verification → Turn On
2. **Generate App Password**:
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Sportify"
   - Copy 16-character password (no spaces)
3. **Important**: Use this app password, NOT your Gmail password

---

### **Step 6: Google Maps API Setup**

1. **Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Create Project**: "Sportify" (or any name)
3. **Enable APIs**:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. **Create Credentials**:
   - APIs & Services → Credentials → Create Credentials → API Key
   - Copy API key
5. **Restrict Key** (Recommended):
   - Edit API key → Application restrictions → HTTP referrers
   - Add: `http://localhost:3000/*`, `https://yourdomain.com/*`
   - API restrictions → Restrict to: Maps JS, Places, Geocoding

---

### **Step 7: Environment Variables**

Create `.env.local` in the project root:

```env
# ========================================
# DATABASE
# ========================================
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sportify?retryWrites=true&w=majority

# ========================================
# AUTHENTICATION
# ========================================
# Generate strong secret: openssl rand -base64 32
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# ========================================
# PAYMENT GATEWAY (RAZORPAY)
# ========================================
# Test keys (start with rzp_test_)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# ========================================
# FILE STORAGE (CLOUDINARY)
# ========================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ========================================
# EMAIL SERVICE (GMAIL SMTP)
# ========================================
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password

# ========================================
# GOOGLE MAPS
# ========================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Security Tips**:

- ✅ Never commit `.env.local` to Git (already in `.gitignore`)
- ✅ Use strong, unique passwords for each service
- ✅ Generate JWT secret: `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- ✅ URL-encode special characters in MongoDB password

---

### **Step 8: Database Initialization**

The application auto-creates indexes on first run, but you can verify:

```bash
# Start dev server (this will connect to MongoDB)
npm run dev

# MongoDB will automatically:
# ✅ Create database 'sportify'
# ✅ Create collections (users, tournaments, registrations, sponsorships)
# ✅ Create 2dsphere indexes for location fields
# ✅ Create unique index on user.email
```

**Verify in MongoDB Atlas**:

- Browse Collections → Check indexes tab
- Should see `location_2dsphere` indexes

---

### **Step 9: Run Development Server**

```bash
# Start Next.js dev server with Turbopack
npm run dev

# Server starts on http://localhost:3000
# API routes available at http://localhost:3000/api/*
```

**Expected Output**:

```
✓ Starting...
✓ Ready in 2.5s
○ Local:   http://localhost:3000
✓ Compiled in 1.2s
```

---

### **Step 10: Test the Application**

#### **1. Register Users**

Visit [http://localhost:3000/auth/register](http://localhost:3000/auth/register)

Create accounts for each role:

- **Organizer**: Test organizing tournaments
- **Player**: Test browsing and registrations
- **Sponsor**: Test sponsorship proposals

#### **2. Create a Tournament** (as Organizer)

- Login → Organizer Dashboard → "Organise a Tournament"
- Fill in details:
  - Name: "Annual Cricket Tournament"
  - Sport: Cricket
  - Location: Search or click on map
  - Dates: Set registration and tournament dates
  - Entry Fee: ₹500 (or free)

#### **3. Register for Tournament** (as Player)

- Login as Player → Browse Tournaments
- Click tournament → "Register"
- Choose Individual or Team
- Upload Aadhar document (any image for testing)
- Proceed to payment

#### **4. Test Payment**

Use Razorpay test cards:

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: `123456` (test mode auto-success)

#### **5. Verify Registration** (as Organizer)

- Organizer Dashboard → Tournament → "Registrations"
- Review Aadhar documents
- Approve or reject

#### **6. Check Email Notifications**

- Registration confirmation email
- Payment confirmation email
- Verification status email

---

### **Step 11: Production Deployment**

**🚀 Quick Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Piyush-codez0/Sportify)

**📖 For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

#### **Quick Vercel Deployment**

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Add all environment variables from `.env.example`
4. Deploy!

#### **Or use Vercel CLI:**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy to production
vercel --prod
```

#### **Production Checklist**

- [ ] Switch to **production Razorpay keys** (rzp_live_*)
- [ ] Update `NEXT_PUBLIC_RAZORPAY_KEY_ID` in hosting platform
- [ ] Set **strong JWT_SECRET** (different from dev)
- [ ] Configure **MongoDB Atlas IP whitelist** (0.0.0.0/0 for Vercel)
- [ ] Add **production domain** to Cloudinary allowed origins
- [ ] Update **Google Maps API key** restrictions (add prod domain)
- [ ] Enable **MongoDB Atlas backup** (recommended)
- [ ] Set up **monitoring** (Vercel Analytics, Sentry, etc.)
- [ ] Test **all payment flows** with real test transactions
- [ ] Configure **custom domain** (optional)

**💡 See [DEPLOYMENT.md](DEPLOYMENT.md) for:**
- GitHub Actions CI/CD setup
- Multiple hosting options (Netlify, Railway, etc.)
- Troubleshooting guide
- Security best practices
- Post-deployment configuration

---


=======
## 👥 Team

**Project**: Sportify - Sports Tournament Management Platform  
**Type**: Full-Stack Web Application  
**Tech**: Next.js, TypeScript, MongoDB, Tailwind CSS  
**Status**: Active Development

---

<div align="center">

**Made with ❤️ for Indian Sports Community by Piyush Rawat**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/yourusername/sportify/issues) • [Request Feature](https://github.com/yourusername/sportify/issues)

</div>
