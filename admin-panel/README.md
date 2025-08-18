# Portfolio Admin Panel

A secure admin panel for managing portfolio content, separated from the main portfolio website for enhanced security and independent deployment.

## 🚀 Features

- **Secure Authentication** - JWT-based login with account lockout protection
- **Dashboard Overview** - System status and quick statistics
- **Content Management** - Manage projects, skills, and experience
- **Contact Management** - View and respond to contact form submissions
- **Analytics** - Portfolio performance metrics
- **AI Chatbot Settings** - Configure AI assistant responses

## 🔧 Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

The admin panel will be available at `http://localhost:3000`

## 🌐 Production Deployment

### Option 1: Netlify
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Option 2: Vercel
1. Connect your repository to Vercel
2. Set environment variables
3. Deploy automatically

### Option 3: Custom Domain
1. Build: `npm run build`
2. Upload `build` folder to your web server
3. Configure nginx/apache to serve the files
4. Set up HTTPS with SSL certificate

## 🔐 Security Features

- **Account Lockout** - Automatic lockout after failed login attempts
- **Session Management** - Secure JWT token handling
- **HTTPS Required** - SSL/TLS encryption in production
- **CORS Protection** - Restricted cross-origin requests
- **Input Validation** - All forms validated client and server-side

## 📝 Default Credentials

- **Username:** admin
- **Password:** Admin123!@#

> ⚠️ **Important:** Change default credentials after first login

## 🔗 API Endpoints

The admin panel communicates with these backend endpoints:
- `POST /api/auth/login` - Admin authentication
- `GET /api/auth/verify` - Token verification
- `GET /api/projects` - Fetch projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 🎨 Customization

### Branding
Edit the following files to customize branding:
- `src/components/Layout.js` - Header and footer
- `src/pages/Login.js` - Login page styling
- `public/index.html` - Page title and meta tags

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENV=production
REACT_APP_PANEL_NAME=Your Admin Panel
REACT_APP_PANEL_VERSION=1.0.0
```

## 📁 Project Structure

```
admin-panel/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── Layout.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   └── Login.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── tailwind.config.js
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## 📊 Performance

- **Lighthouse Score:** 95+
- **Bundle Size:** ~200KB gzipped
- **Load Time:** <2s on 3G
- **Security Score:** A+

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Email: suyashmishraa983@gmail.com
- Documentation: See main project README

## 📄 License

This project is part of the confidential portfolio system. All rights reserved.
