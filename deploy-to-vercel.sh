#!/bin/bash
# Deployment script for Sportify to Vercel
# This script helps automate the Vercel deployment process

set -e  # Exit on error

echo "============================================"
echo "  Sportify - Vercel Deployment Script"
echo "============================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed successfully"
else
    echo "✅ Vercel CLI is already installed ($(vercel --version))"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo ""
echo "Before deploying, ensure you have:"
echo "  ✓ MongoDB Atlas cluster created and configured"
echo "  ✓ Razorpay account with production keys"
echo "  ✓ Cloudinary account configured"
echo "  ✓ Gmail app password generated"
echo "  ✓ Google Maps API key obtained"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found!"
    echo ""
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo ""
    echo "❗ IMPORTANT: Edit .env.local with your actual credentials before deploying!"
    echo "   Required variables:"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - NEXT_PUBLIC_RAZORPAY_KEY_ID"
    echo "   - RAZORPAY_KEY_SECRET"
    echo "   - CLOUDINARY_CLOUD_NAME"
    echo "   - CLOUDINARY_API_KEY"
    echo "   - CLOUDINARY_API_SECRET"
    echo "   - EMAIL_USER"
    echo "   - EMAIL_PASSWORD"
    echo "   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
    echo ""
    read -p "Press Enter after you've configured .env.local..."
fi

echo ""
echo "🔐 Checking Vercel authentication..."

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel"
    echo ""
    echo "Please login to Vercel:"
    vercel login
    echo ""
    echo "✅ Successfully logged in to Vercel"
else
    echo "✅ Already logged in as: $(vercel whoami)"
fi

echo ""
echo "🔗 Linking project to Vercel..."
echo ""
echo "If this is your first deployment:"
echo "  1. Choose 'Y' to link to existing project or 'N' to create new"
echo "  2. Select your scope (personal account or team)"
echo "  3. Name your project (e.g., 'sportify' or 'sportify-tournament')"
echo ""

# Link the project
if [ ! -d .vercel ]; then
    vercel link
else
    echo "✅ Project already linked"
fi

echo ""
echo "⚙️  Configuring environment variables..."
echo ""
echo "You need to add environment variables to Vercel."
echo "Choose one of the following methods:"
echo ""
echo "Method 1: Add via Vercel Dashboard (Recommended)"
echo "  1. Go to: https://vercel.com/dashboard"
echo "  2. Select your project"
echo "  3. Go to Settings → Environment Variables"
echo "  4. Add all variables from .env.example"
echo ""
echo "Method 2: Add via CLI (one by one)"
echo "  Run: vercel env add VARIABLE_NAME"
echo "  For each variable in .env.example"
echo ""

read -p "Have you added all environment variables? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled. Please add environment variables first."
    exit 1
fi

echo ""
echo "🚀 Starting deployment..."
echo ""
echo "Choose deployment type:"
echo "  1. Preview deployment (test before production)"
echo "  2. Production deployment"
echo ""
read -p "Enter choice (1 or 2): " deploy_choice

if [ "$deploy_choice" = "1" ]; then
    echo ""
    echo "📦 Deploying to preview..."
    vercel
elif [ "$deploy_choice" = "2" ]; then
    echo ""
    echo "📦 Deploying to production..."
    vercel --prod
else
    echo "❌ Invalid choice. Defaulting to preview deployment..."
    vercel
fi

echo ""
echo "============================================"
echo "  ✅ Deployment Complete!"
echo "============================================"
echo ""
echo "📊 Next Steps:"
echo ""
echo "1. Test your deployment URL thoroughly"
echo "2. Check all features:"
echo "   - User registration/login"
echo "   - Tournament creation"
echo "   - Payment processing (use test cards)"
echo "   - Email notifications"
echo "   - File uploads"
echo "   - Google Maps integration"
echo ""
echo "3. Update service configurations:"
echo "   - Razorpay: Add webhook URL"
echo "   - Cloudinary: Add domain to whitelist"
echo "   - Google Maps: Add domain restrictions"
echo "   - MongoDB Atlas: Verify IP whitelist"
echo ""
echo "4. Configure custom domain (optional):"
echo "   - In Vercel Dashboard → Domains"
echo ""
echo "📖 For more details, see DEPLOYMENT.md"
echo ""
