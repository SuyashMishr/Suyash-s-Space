# 🚀 Complete Deployment Guide for Vercel + Render

This guide will help you deploy your portfolio system with:
- **Vercel**: Frontend + Admin Panel
- **Render**: Backend API + AI Service

## 📋 Prerequisites

1. **Accounts needed:**
   - [GitHub](https://github.com) (code repository)
   - [Vercel](https://vercel.com) (frontend deployment)
   - [Render](https://render.com) (backend deployment)
   - [MongoDB Atlas](https://mongodb.com/atlas) (database)

2. **Prepare your repository:**
   - Push your code to GitHub
   - Make sure all environment files are in `.gitignore`

## 🔧 Step-by-Step Deployment

### STEP 1: Set up MongoDB Atlas

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://mongodb.com/atlas)
   - Create a free cluster
   - Create a database user
   - Whitelist all IP addresses (0.0.0.0/0) for production

2. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority`

### STEP 2: Deploy Backend on Render

1. **Create New Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

2. **Configure Backend Service:**
   ```
   Name: portfolio-backend
   Environment: Node
   Region: Your preferred region
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

3. **Add Environment Variables:**
   Go to Environment tab and add these variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
   JWT_REFRESH_EXPIRES_IN=7d
   ADMIN_REGISTRATION_KEY=your-admin-key
   PORT=10000
   AI_SERVICE_URL=https://your-ai-service.onrender.com
   AI_SERVICE_API_KEY=secure-ai-api-key
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CONTACT_RATE_LIMIT=10
   CONTACT_RATE_WINDOW=900000
   ```

4. **Deploy Backend:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the backend URL (e.g., `https://portfolio-backend.onrender.com`)

### STEP 3: Deploy AI Service on Render

1. **Create Second Web Service:**
   - Click "New" → "Web Service"
   - Select same repository

2. **Configure AI Service:**
   ```
   Name: portfolio-ai-service
   Environment: Python
   Region: Same as backend
   Branch: main
   Root Directory: ai-service
   Build Command: pip install -r requirements-simple.txt
   Start Command: python simple_app.py
   ```

3. **Add Environment Variables:**
   ```
   ENVIRONMENT=production
   PORT=10000
   HOST=0.0.0.0
   API_KEY=secure-ai-api-key
   MAX_TOKENS=150
   TEMPERATURE=0.7
   UVICORN_WORKERS=2
   ```

4. **Deploy AI Service:**
   - Click "Create Web Service"
   - Note the AI service URL (e.g., `https://portfolio-ai-service.onrender.com`)

### STEP 4: Deploy Frontend on Vercel

1. **Import Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub
   - Select your repository

2. **Configure Frontend:**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

3. **Add Environment Variables:**
   Go to Settings → Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   REACT_APP_AI_SERVICE_URL=https://your-ai-service.onrender.com
   REACT_APP_ENV=production
   GENERATE_SOURCEMAP=false
   ```

4. **Deploy Frontend:**
   - Click "Deploy"
   - Note the frontend URL (e.g., `https://your-portfolio.vercel.app`)

### STEP 5: Deploy Admin Panel on Vercel

1. **Create New Project:**
   - Click "New Project" in Vercel
   - Select same repository

2. **Configure Admin Panel:**
   ```
   Framework Preset: Create React App
   Root Directory: admin-panel
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

3. **Add Environment Variables:**
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   REACT_APP_ENV=production
   GENERATE_SOURCEMAP=false
   ```

4. **Deploy Admin Panel:**
   - Click "Deploy"
   - Note the admin URL (e.g., `https://your-admin.vercel.app`)

### STEP 6: Update Backend CORS Settings

1. **Update Backend Environment:**
   - Go back to Render → Backend Service → Environment
   - Add/Update:
   ```
   FRONTEND_URL=https://your-portfolio.vercel.app
   ADMIN_PANEL_URL=https://your-admin.vercel.app
   CORS_ORIGINS=https://your-portfolio.vercel.app,https://your-admin.vercel.app
   ```

2. **Redeploy Backend:**
   - Click "Manual Deploy" → "Deploy latest commit"

### STEP 7: Final Configuration Updates

1. **Update AI Service URL in Backend:**
   - In Render Backend environment, update:
   ```
   AI_SERVICE_URL=https://your-actual-ai-service.onrender.com
   ```

2. **Update Frontend Environment:**
   - In Vercel Frontend settings, update:
   ```
   REACT_APP_API_URL=https://your-actual-backend.onrender.com
   REACT_APP_AI_SERVICE_URL=https://your-actual-ai-service.onrender.com
   REACT_APP_ADMIN_URL=https://your-actual-admin.vercel.app
   ```

## 🎯 Post-Deployment Setup

### Create Admin User

1. **Use the backend API:**
   ```bash
   curl -X POST https://your-backend.onrender.com/api/auth/register-admin \
   -H "Content-Type: application/json" \
   -d '{
     "username": "admin",
     "email": "admin@yoursite.com",
     "password": "SecurePassword123!",
     "registrationKey": "your-admin-registration-key"
   }'
   ```

### Test All Services

1. **Frontend:** Visit `https://your-portfolio.vercel.app`
2. **Admin Panel:** Visit `https://your-admin.vercel.app`
3. **Backend API:** Visit `https://your-backend.onrender.com/api/health`
4. **AI Service:** Visit `https://your-ai-service.onrender.com/health`

## 🔒 Security Checklist

- [ ] Changed all default passwords and API keys
- [ ] Updated CORS origins to your actual domains
- [ ] Set strong JWT secrets (min 32 characters)
- [ ] Configured MongoDB Atlas with proper authentication
- [ ] Set up proper email configuration for contact form
- [ ] Enabled HTTPS for all services
- [ ] Set up proper rate limiting

## 📊 Monitoring & Maintenance

### Render Services
- Check logs in Render dashboard
- Monitor resource usage
- Set up health checks

### Vercel Deployments
- Monitor build logs
- Check analytics
- Set up custom domains if needed

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors:** Ensure all URLs in CORS_ORIGINS match exactly
2. **Environment Variables:** Check all env vars are set correctly
3. **Build Failures:** Check build logs for missing dependencies
4. **Database Connection:** Verify MongoDB Atlas connection string
5. **API Timeouts:** Render free tier has cold starts - consider upgrading

### Debug URLs:
- Backend Health: `https://your-backend.onrender.com/api/health`
- AI Service Health: `https://your-ai-service.onrender.com/health`
- Backend API Docs: `https://your-backend.onrender.com/api-docs` (if implemented)

## 💰 Cost Estimation

### Free Tier Limits:
- **Render:** 750 hours/month per service (backend + AI = 1500 hours needed)
- **Vercel:** Unlimited for personal use
- **MongoDB Atlas:** 512MB free tier

### Upgrade Recommendations:
- Consider Render paid plan for production ($7/month per service)
- MongoDB Atlas paid tier for production workloads
- Custom domains for professional appearance

## 🎉 You're Done!

Your portfolio is now live with:
- ✅ Professional frontend
- ✅ Secure admin panel  
- ✅ Robust backend API
- ✅ AI-powered chatbot
- ✅ Contact form functionality
- ✅ Content management system

Remember to regularly update dependencies and monitor your services!
