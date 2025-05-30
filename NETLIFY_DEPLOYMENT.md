# 🚀 Netlify Deployment Guide

This guide will help you deploy your confidential portfolio website to Netlify.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Backend Deployment** - Deploy backend to Heroku/Railway/Render first

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 1.2 Update Environment Variables
Edit `frontend/.env.production` with your deployed backend URL:
```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
REACT_APP_ENV=production
REACT_APP_ENABLE_CHATBOT=true
REACT_APP_ENABLE_ANALYTICS=true
```

## 🌐 Step 2: Deploy to Netlify

### 2.1 Connect Repository
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your portfolio repository

### 2.2 Configure Build Settings
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/build`

### 2.3 Environment Variables
In Netlify dashboard, go to Site settings > Environment variables and add:
```
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
REACT_APP_ENV=production
REACT_APP_ENABLE_CHATBOT=true
REACT_APP_ENABLE_ANALYTICS=true
GENERATE_SOURCEMAP=false
```

### 2.4 Deploy
Click "Deploy site" - Netlify will build and deploy automatically!

## 🔒 Step 3: Security Configuration

### 3.1 Custom Domain (Optional)
1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS records as instructed

### 3.2 HTTPS & Security Headers
- HTTPS is enabled by default
- Security headers are configured in `netlify.toml`
- Password protection available in Site settings > Access control

## 🛠️ Step 4: Backend Deployment Options

### Option A: Heroku (Recommended)
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-portfolio-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-connection-string
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set FRONTEND_URL=https://your-netlify-site.netlify.app

# Deploy
git subtree push --prefix backend heroku main
```

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select backend folder
4. Add environment variables
5. Deploy

### Option C: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect repository, select backend folder
4. Add environment variables
5. Deploy

## 🤖 Step 5: AI Service Deployment

### Option A: Heroku
```bash
heroku create your-portfolio-ai-service
heroku config:set PORT=8000
heroku config:set AI_SERVICE_API_KEY=your-api-key
git subtree push --prefix ai-service heroku main
```

### Option B: Railway/Render
Similar process as backend, but for ai-service folder.

## 📝 Step 6: Update Configuration

After deploying backend and AI service, update:

1. **Frontend environment**:
```env
REACT_APP_API_URL=https://your-backend.herokuapp.com
```

2. **Backend environment**:
```env
FRONTEND_URL=https://your-site.netlify.app
AI_SERVICE_URL=https://your-ai-service.herokuapp.com
CORS_ORIGIN=https://your-site.netlify.app
```

3. **Redeploy** all services with updated URLs

## 🧪 Step 7: Testing

1. **Frontend**: Visit your Netlify URL
2. **API**: Test `https://your-backend.herokuapp.com/api/health`
3. **AI Service**: Test `https://your-ai-service.herokuapp.com/health`
4. **Login**: Test admin login functionality
5. **Chatbot**: Test AI assistant

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Node.js version (use 18.x)
   - Verify all dependencies in package.json
   - Check build logs in Netlify dashboard

2. **API Calls Fail**
   - Verify CORS settings in backend
   - Check environment variables
   - Ensure HTTPS for all services

3. **Chatbot Not Working**
   - Verify AI service is deployed and running
   - Check backend can reach AI service
   - Verify API keys and environment variables

4. **Login Issues**
   - Check JWT secrets match
   - Verify database connection
   - Check CORS origins

## 📊 Monitoring

### Netlify Analytics
- Enable in Site settings > Analytics
- Monitor traffic and performance

### Error Tracking
- Check Netlify function logs
- Monitor backend logs on Heroku/Railway
- Set up error tracking (Sentry, LogRocket)

## 🔄 Continuous Deployment

Netlify automatically redeploys when you push to GitHub:
```bash
git add .
git commit -m "Update portfolio content"
git push origin main
# Netlify will automatically rebuild and deploy
```

## 🎯 Production Checklist

- [ ] Backend deployed and accessible
- [ ] AI service deployed and accessible
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Database connected
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Admin login working
- [ ] Chatbot functional
- [ ] All pages loading correctly
- [ ] Mobile responsive
- [ ] Performance optimized

## 📞 Support

If you encounter issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser console for errors
5. Review CORS and security settings

Your confidential portfolio is now ready for production! 🎉
