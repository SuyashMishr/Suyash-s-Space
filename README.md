# 🔒 Confidential Portfolio Website  https://suyashspace.netlify.app


A secure, full-stack portfolio website built with the MERN stack and integrated AI assistant. This project showcases professional work while maintaining strict confidentiality and security measures.

## 🚨 CONFIDENTIAL NOTICE

**This website and its contents are PRIVATE and CONFIDENTIAL. Unauthorized access, distribution, or indexing is strictly prohibited.**

## ✨ Features

### 🔐 Security & Privacy
- **JWT-based Authentication** with secure admin access
- **Rate Limiting** on all API endpoints
- **Password Encryption** using bcrypt with salt rounds
- **CORS Protection** with configurable origins
- **Security Headers** implemented with Helmet.js
- **robots.txt** to prevent search engine indexing
- **Confidential Watermarks** throughout the UI
- **Account Lockout** after failed login attempts

### 🤖 AI Integration
- **Local LLM** powered by Hugging Face Transformers
- **RAG (Retrieval Augmented Generation)** with portfolio context
- **Session Management** for chat conversations
- **Fallback Responses** when AI service is unavailable
- **Context-Aware Responses** based on portfolio data

### 💻 Full-Stack Features
- **Responsive Design** with dark/light theme toggle
- **Modern UI/UX** built with React and Tailwind CSS
- **RESTful API** with Express.js backend
- **MongoDB Database** for data persistence
- **Docker Support** for easy deployment
- **Environment Configuration** for different stages

## 🛠 Tech Stack

### Frontend
- **React.js 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Helmet** - Security headers

### AI Service
- **Python FastAPI** - High-performance API framework
- **Hugging Face Transformers** - LLM integration
- **Sentence Transformers** - Text embeddings
- **scikit-learn** - Machine learning utilities
- **NumPy** - Numerical computing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (optional)
- **Environment Variables** - Configuration management

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Python 3.8+
- MongoDB 4.4+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-website
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

3. **Start MongoDB**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Ubuntu
   sudo systemctl start mongod
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - AI Service: http://localhost:8000

## 📁 Project Structure

```
portfolio-website/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   └── Dockerfile          # Frontend container
├── backend/                 # Node.js backend
│   ├── routes/             # API route handlers
│   ├── models/             # MongoDB models
│   ├── middleware/         # Express middleware
│   └── Dockerfile          # Backend container
├── ai-service/             # Python AI service
│   ├── services/           # AI service modules
│   ├── app.py             # FastAPI application
│   └── Dockerfile         # AI service container
├── data/                   # Portfolio data files
├── docker-compose.yml      # Multi-container setup
└── setup.sh               # Automated setup script
```

## 🔧 Configuration

### Environment Variables

The setup script automatically generates secure environment files:

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration  
- `ai-service/.env` - AI service configuration

### Admin Account Creation

To create an admin account, use the generated `ADMIN_REGISTRATION_KEY` from `backend/.env`:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com", 
    "password": "SecurePassword123!",
    "adminKey": "YOUR_ADMIN_REGISTRATION_KEY"
  }'
```

## 🐳 Docker Deployment

### Development
```bash
npm run docker:build
npm run docker:up
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with configurable expiration
- Refresh token rotation
- Account lockout after failed attempts
- Role-based access control

### API Security
- Rate limiting per IP address
- Request validation and sanitization
- CORS protection
- Security headers (HSTS, CSP, etc.)

### Data Protection
- Password hashing with bcrypt
- Sensitive data exclusion from API responses
- Environment variable protection
- Database connection encryption

## 🤖 AI Assistant

The integrated AI assistant provides:

- **Portfolio Q&A** - Answers questions about skills and experience
- **Project Information** - Details about completed projects
- **Context-Aware Responses** - Uses portfolio data for accurate answers
- **Session Management** - Maintains conversation context
- **Fallback Handling** - Graceful degradation when AI is unavailable

### AI Configuration

Customize the AI behavior in `ai-service/.env`:

```env
MODEL_NAME=microsoft/DialoGPT-medium
MAX_LENGTH=512
TEMPERATURE=0.7
```

## 📊 Monitoring & Analytics

- Request logging with Morgan
- Error tracking and reporting
- Session analytics
- Performance monitoring
- Security event logging

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start all services
npm run frontend:dev     # Frontend only
npm run backend:dev      # Backend only
npm run ai:dev          # AI service only

# Production
npm run build           # Build frontend
npm start              # Start backend

# Docker
npm run docker:build   # Build containers
npm run docker:up      # Start containers
npm run docker:down    # Stop containers
```

### Adding New Features

1. **Frontend Components** - Add to `frontend/src/components/`
2. **API Routes** - Add to `backend/routes/`
3. **Database Models** - Add to `backend/models/`
4. **AI Context** - Update data files in `data/`

## 🚨 Security Considerations

### For Production Deployment

1. **Change Default Secrets** - Generate new JWT secrets
2. **Configure HTTPS** - Use SSL certificates
3. **Database Security** - Enable MongoDB authentication
4. **Firewall Rules** - Restrict access to necessary ports
5. **Regular Updates** - Keep dependencies updated
6. **Backup Strategy** - Implement regular backups

### Confidentiality Measures

- All pages include confidential watermarks
- robots.txt prevents search engine indexing
- Meta tags block social media previews
- Admin access requires strong authentication
- All API responses include confidential headers

## 📝 License

**PRIVATE AND CONFIDENTIAL** - This project is proprietary and confidential. All rights reserved.

## 📞 Contact

For authorized access or inquiries:
- Email: suyashmishraa983@gmail.com
- LinkedIn: [Suyash Mishra](https://www.linkedin.com/in/suyash-mishra-b8667a253/)

---

**⚠️ IMPORTANT: This is a confidential portfolio website. Unauthorized access, copying, or distribution is strictly prohibited.**
# Suyash-s-Space
# Suyash-s-Space
