# 🎯 Quick Deployment Reference

## 📁 Environment Files Created:

### Backend (.env.production)
```bash
NODE_ENV=production
MONGODB_URI=your-atlas-connection-string
JWT_SECRET=your-32-char-secret
AI_SERVICE_URL=https://your-ai-service.onrender.com
# ... (see full file for all variables)
```

### AI Service (.env.production)  
```bash
ENVIRONMENT=production
PORT=10000
API_KEY=secure-ai-api-key
# ... (see full file for all variables)
```

### Frontend (.env.prod)
```bash
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_AI_SERVICE_URL=https://your-ai-service.onrender.com
# ... (see full file for all variables)
```

### Admin Panel (.env.production)
```bash
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_ENV=production
# ... (see full file for all variables)
```

## 🚀 Deployment Order:

1. **MongoDB Atlas** → Set up database
2. **Render Backend** → Deploy API server  
3. **Render AI Service** → Deploy AI chatbot
4. **Vercel Frontend** → Deploy main portfolio
5. **Vercel Admin** → Deploy admin panel

## 🔗 Service URLs Pattern:

- Backend: `https://portfolio-backend.onrender.com`
- AI Service: `https://portfolio-ai-service.onrender.com`  
- Frontend: `https://your-portfolio.vercel.app`
- Admin: `https://your-admin.vercel.app`

## ⚡ Quick Commands:

```bash
# Prepare for deployment
./prepare-deployment.sh

# Push to GitHub
git add .
git commit -m "Ready for production deployment"
git push

# Test local build (before deploying)
cd frontend && npm run build
cd ../admin-panel && npm run build
cd ../backend && npm install --production
```

## 🔧 Critical Configuration:

1. **Update CORS origins** in backend after getting Vercel URLs
2. **Set AI_SERVICE_URL** in backend after AI service is deployed  
3. **Set REACT_APP_API_URL** in frontend after backend is deployed
4. **Create admin user** via API after backend is deployed

## 📋 Environment Variables Checklist:

### Must Change:
- [ ] `MONGODB_URI` → Your Atlas connection string
- [ ] `JWT_SECRET` → 32+ character secure string  
- [ ] `ADMIN_REGISTRATION_KEY` → Secure admin key
- [ ] `AI_SERVICE_API_KEY` → Secure API key
- [ ] All service URLs → Your actual deployed URLs

### Optional:
- [ ] Email configuration for contact form
- [ ] Google Analytics ID  
- [ ] Custom domain names

## 💡 Pro Tips:

- Deploy backend first, then update frontend URLs
- Use Render logs to debug backend issues
- Use Vercel deployment logs to debug frontend builds  
- Test each service individually before connecting them
- Keep environment files secure (never commit to git)

See `DEPLOYMENT_GUIDE.md` for complete step-by-step instructions!
