# 🚀 Deployment Guide

This guide covers deploying the Confidential Portfolio Website to production environments.

## 🔒 Security Checklist

Before deploying to production, ensure you have:

- [ ] Changed all default passwords and secrets
- [ ] Generated strong JWT secrets (32+ characters)
- [ ] Configured SSL/TLS certificates
- [ ] Set up proper firewall rules
- [ ] Enabled MongoDB authentication
- [ ] Configured secure Redis password
- [ ] Set up proper backup strategy
- [ ] Configured monitoring and logging
- [ ] Reviewed all environment variables
- [ ] Tested the application thoroughly

## 🌐 Production Deployment Options

### Option 1: Docker Compose (Recommended)

1. **Prepare the environment**
   ```bash
   # Copy production environment file
   cp .env.production .env
   
   # Edit the .env file with your actual values
   nano .env
   ```

2. **Update critical secrets**
   ```bash
   # Generate strong secrets
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For JWT_REFRESH_SECRET
   openssl rand -base64 16  # For ADMIN_REGISTRATION_KEY
   ```

3. **Configure SSL certificates**
   ```bash
   # Create SSL directory
   mkdir -p nginx/ssl
   
   # Copy your SSL certificates
   cp your-cert.pem nginx/ssl/cert.pem
   cp your-key.pem nginx/ssl/key.pem
   ```

4. **Deploy with Docker Compose**
   ```bash
   # Build and start all services
   docker-compose -f docker-compose.yml up -d
   
   # Check service status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

### Option 2: Manual Deployment

1. **Server Requirements**
   - Ubuntu 20.04+ or CentOS 8+
   - Node.js 16+
   - Python 3.8+
   - MongoDB 5.0+
   - Redis 6.0+
   - Nginx 1.18+

2. **Install dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Python
   sudo apt install python3 python3-pip -y
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Install Redis
   sudo apt install redis-server -y
   
   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Configure services**
   ```bash
   # Configure MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Configure Redis
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   
   # Configure Nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

4. **Deploy application**
   ```bash
   # Clone repository
   git clone <your-repo-url> /var/www/portfolio
   cd /var/www/portfolio
   
   # Install dependencies
   npm run install:all
   
   # Build frontend
   npm run build
   
   # Start services with PM2
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

## 🔧 Configuration Files

### Nginx Configuration

Create `/etc/nginx/sites-available/portfolio`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";

    # Frontend
    location / {
        root /var/www/portfolio/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log)$ {
        deny all;
    }
}
```

### PM2 Ecosystem Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'portfolio-backend',
      script: './backend/server.js',
      cwd: '/var/www/portfolio',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'portfolio-ai',
      script: 'python',
      args: 'app.py',
      cwd: '/var/www/portfolio/ai-service',
      instances: 1,
      env: {
        ENVIRONMENT: 'production',
        PORT: 8000
      },
      error_file: './logs/ai-error.log',
      out_file: './logs/ai-out.log',
      log_file: './logs/ai-combined.log',
      time: true
    }
  ]
};
```

## 🔐 Security Hardening

### 1. Firewall Configuration

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. MongoDB Security

```bash
# Enable authentication
sudo nano /etc/mongod.conf

# Add to mongod.conf:
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod

# Create admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "your-strong-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

### 3. Redis Security

```bash
# Configure Redis
sudo nano /etc/redis/redis.conf

# Add/modify:
requirepass your-redis-password
bind 127.0.0.1

# Restart Redis
sudo systemctl restart redis-server
```

## 📊 Monitoring and Logging

### 1. Log Rotation

Create `/etc/logrotate.d/portfolio`:

```
/var/www/portfolio/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Health Monitoring

Create a health check script:

```bash
#!/bin/bash
# health-check.sh

BACKEND_URL="http://localhost:5000/health"
AI_URL="http://localhost:8000/health"

# Check backend
if ! curl -f $BACKEND_URL > /dev/null 2>&1; then
    echo "Backend is down!" | mail -s "Portfolio Backend Alert" admin@your-domain.com
    pm2 restart portfolio-backend
fi

# Check AI service
if ! curl -f $AI_URL > /dev/null 2>&1; then
    echo "AI Service is down!" | mail -s "Portfolio AI Alert" admin@your-domain.com
    pm2 restart portfolio-ai
fi
```

Add to crontab:
```bash
# Check every 5 minutes
*/5 * * * * /var/www/portfolio/health-check.sh
```

## 🔄 Backup Strategy

### 1. Database Backup

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/portfolio"
mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --host localhost --port 27017 --username admin --password your-password --authenticationDatabase admin --db portfolio --out $BACKUP_DIR/mongodb_$DATE

# Compress backup
tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz $BACKUP_DIR/mongodb_$DATE
rm -rf $BACKUP_DIR/mongodb_$DATE

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +30 -delete
```

### 2. Application Backup

```bash
#!/bin/bash
# backup-app.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/portfolio"
APP_DIR="/var/www/portfolio"

# Create application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='.git' \
    $APP_DIR

# Remove old backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   sudo netstat -tulpn | grep :5000
   sudo lsof -i :5000
   ```

2. **Permission issues**
   ```bash
   sudo chown -R www-data:www-data /var/www/portfolio
   sudo chmod -R 755 /var/www/portfolio
   ```

3. **Service not starting**
   ```bash
   # Check logs
   pm2 logs
   sudo journalctl -u mongod
   sudo journalctl -u redis-server
   sudo journalctl -u nginx
   ```

4. **Memory issues**
   ```bash
   # Monitor resources
   htop
   free -h
   df -h
   ```

## 📞 Support

For deployment issues or questions:
- Email: suyashmishraa983@gmail.com
- Check logs in `/var/www/portfolio/logs/`
- Review PM2 status: `pm2 status`
- Check Docker status: `docker-compose ps`

---

**⚠️ Remember: This is a confidential portfolio website. Ensure all security measures are properly implemented before going live.**
