# 🚀 Deployment Guide - JNV Spectra Event Management System

## ✅ **COMPLETED STEPS**

### **1. CI/CD Pipeline Setup**
- ✅ Created GitHub Actions workflows for automated deployment
- ✅ Backend deployment: Docker + ECR + EC2
- ✅ Frontend deployment: Vercel for all apps
- ✅ Security scanning and code quality checks
- ✅ Secrets detection scanning

### **2. Git Security Cleanup**
- ✅ Removed sensitive `.env` files from git tracking
- ✅ Removed `PROJECT_ARCHITECTURE.md` containing AWS secrets from git history
- ✅ Updated `.gitignore` to prevent future secret commits
- ✅ Successfully pushed clean code to GitHub

---

## 🔧 **NEXT STEPS - Configure GitHub Secrets**

### **Required GitHub Secrets** (Add to: Settings → Secrets and variables → Actions)

#### **Backend Deployment (AWS)**
```
AWS_ACCESS_KEY_ID          # Your AWS access key
AWS_SECRET_ACCESS_KEY      # Your AWS secret access key
EC2_HOST                   # Your EC2 instance IP/domain (e.g., ec2-123-45-67-89.compute-1.amazonaws.com)
EC2_USER                   # SSH user (usually 'ec2-user' or 'ubuntu')
EC2_SSH_KEY                # Private SSH key content (base64 encoded)
SLACK_WEBHOOK              # (Optional) Slack webhook for notifications
```

#### **Frontend Deployment (Vercel)**
```
VERCEL_TOKEN               # Vercel API token from https://vercel.com/account/tokens
VERCEL_ORG_ID              # Vercel organization ID
VERCEL_PROJECT_ID_ADMIN    # Admin portal project ID
VERCEL_PROJECT_ID_WEBSITE  # Website project ID
VERCEL_PROJECT_ID_CHECKOUT # Checkout app project ID
```

---

## 🏗️ **INFRASTRUCTURE SETUP**

### **AWS Setup Requirements**

#### **1. EC2 Instance**
```bash
# Launch EC2 instance with:
# - Ubuntu 22.04 LTS
# - t3.medium or larger
# - Security group allowing SSH (22), HTTP (80), HTTPS (443)
```

#### **2. ECR Repository**
```bash
# Create ECR repository named 'jnv-backend'
aws ecr create-repository --repository-name jnv-backend --region us-east-1
```

#### **3. RDS PostgreSQL Database**
- ✅ Already configured: `jnvspectra.cqzcueeo8qb6.us-east-1.rds.amazonaws.com`
- ✅ Database: `jnvdb`
- ✅ User: `root`

#### **4. S3 Bucket**
- ✅ Already configured: `jnv-images` bucket
- ✅ Region: `us-east-1`

---

## 📋 **DEPLOYMENT WORKFLOW**

### **How CI/CD Works**

```
Developer Push to Main Branch
           ↓
GitHub Actions Triggers
           ↓
┌─────────────────────────────┐
│  Code Quality Checks        │
│  - Lint                     │
│  - Tests                    │
│  - Security Scan            │
│  - Secrets Detection        │
└─────────────────────────────┘
           ↓
    ✅ All Checks Pass
           ↓
┌─────────────────────────────┐
│  Parallel Deployment        │
│  ┌─────────────────────┐    │
│  │ Backend (Docker)    │    │
│  │ - Build Docker img  │    │
│  │ - Push to ECR       │    │
│  │ - Deploy to EC2      │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ Frontend (Vercel)   │    │
│  │ - Admin Portal      │    │
│  │ - Website           │    │
│  │ - Checkout App      │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
           ↓
    🎉 Deployment Complete
    📢 Slack Notification
```

---

## 🔐 **PRODUCTION ENVIRONMENT SETUP**

### **1. EC2 Server Setup**

Connect to your EC2 instance and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /home/ubuntu/jnv-backend
sudo chown ubuntu:ubuntu /home/ubuntu/jnv-backend

# Create production .env file
nano /home/ubuntu/.env
```

**Production .env content:**
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://mmrblmtshtwucjhamxnc.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Database (AWS RDS)
DB_HOST=jnvspectra.cqzcueeo8qb6.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=jnvdb
DB_USER=root
DB_PASSWORD=Jnvspectra25
DB_SSL=false

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=jnv-images

# JWT
JWT_SECRET=your_long_jwt_secret
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=gunasundar29@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=gunasundar29@gmail.com
EMAIL_FROM_NAME=JNV Spectra

# Square Payment
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_square_location_id

# Frontend URLs
FRONTEND_URL=https://your-vercel-domain.com
FRONTEND_CHECKOUT_URL=https://checkout-your-vercel-domain.com
```

---

## 🚀 **FIRST DEPLOYMENT**

### **1. Configure GitHub Secrets**
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add all the secrets listed above.

### **2. Trigger Deployment**
```bash
# Make a small change and push to trigger CI/CD
echo "# Deployment test" >> README.md
git add README.md
git commit -m "Trigger CI/CD deployment"
git push origin main
```

### **3. Monitor Deployment**
- Go to GitHub → Actions tab
- Watch the workflow execution
- Check deployment logs

### **4. Verify Deployment**
- Backend API: `https://your-ec2-ip:3000/api-docs`
- Admin Portal: Vercel URL
- Website: Vercel URL
- Checkout: Vercel URL

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues**

#### **EC2 Deployment Fails**
```bash
# Check EC2 logs
ssh ubuntu@your-ec2-ip
cd ~/jnv-backend
docker logs app
```

#### **Vercel Deployment Fails**
- Check Vercel dashboard for build logs
- Verify environment variables in Vercel project settings

#### **Database Connection Issues**
- Verify RDS security group allows EC2 access
- Check database credentials in production .env

#### **S3 Upload Issues**
- Verify IAM permissions for EC2 instance
- Check S3 bucket CORS policy

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Checks**
- Backend health: `GET /api/v1/health`
- Database connectivity
- S3 bucket access
- Email service status

### **Logs**
```bash
# Backend logs
docker logs app

# Application logs
tail -f logs/combined.log
tail -f logs/error.log
```

### **Backup Strategy**
- Database: AWS RDS automated backups
- Files: S3 versioning enabled
- Code: GitHub repository

---

## 💰 **COST ESTIMATES**

| Service | Monthly Cost | Purpose |
|---------|-------------|---------|
| EC2 t3.medium | $30-50 | Backend server |
| RDS PostgreSQL | $15-30 | Database |
| S3 | $1-5 | File storage |
| Vercel | $0-20 | Frontend hosting |
| **Total** | **$46-105** | **Full stack** |

---

## 📞 **SUPPORT**

If deployment issues occur:
1. Check GitHub Actions logs
2. Verify all secrets are configured
3. Test local deployment first
4. Check AWS service status
5. Review server logs

---

**🎉 Your CI/CD pipeline is ready! Push to main branch to trigger automated deployments.**
