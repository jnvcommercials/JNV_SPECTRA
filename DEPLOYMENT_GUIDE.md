# 🚀 AWS Production Deployment Guide - JNV Spectra Event Management System

## 📊 **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOSTINGER DOMAIN                        │
│                        jnvspectra.com                           │
└──────────────────────────────────────────────────────────────────┘
         │                    │                      │
         ↓                    ↓                      ↓
    ┌─────────┐         ┌──────────┐          ┌──────────┐
    │ CloudFront   │         │ CloudFront   │          │ CloudFront   │
    │ Admin        │         │ Website      │          │ Checkout     │
    └────┬────┘         └──────┬────┘          └──────┬────┘
         │                    │                      │
         ↓                    ↓                      ↓
    ┌─────────┐         ┌──────────┐          ┌──────────┐
    │ S3       │         │ S3       │          │ S3       │
    │ Bucket   │         │ Bucket   │          │ Bucket   │
    └─────────┘         └──────────┘          └──────────┘
         
         ┌─────────────────────────────┐
         │     EC2 Instance            │
         │  ┌───────────────────────┐  │
         │  │ Docker Container      │  │
         │  │ Backend API (Node.js) │  │
         │  └────────┬──────────────┘  │
         │           │                 │
         └───────────┼─────────────────┘
                     ↓
         ┌───────────────────────┐
         │  AWS RDS PostgreSQL   │
         │  jnvspectra.com       │
         └───────────────────────┘
                     
         ┌───────────────────────┐
         │  AWS S3 (jnv-images)  │
         │  File Storage         │
         └───────────────────────┘
```

---

## ✅ **COMPLETED STEPS**

### **1. CI/CD Pipeline Setup**
- ✅ Backend deployment: Docker + ECR + EC2
- ✅ Frontend deployment: AWS S3 + CloudFront (updated from Vercel)
- ✅ Security scanning and code quality checks
- ✅ Secrets detection scanning

### **2. Git Security Cleanup**
- ✅ Removed sensitive `.env` files from git tracking
- ✅ Removed `PROJECT_ARCHITECTURE.md` containing AWS secrets from git history
- ✅ Updated `.gitignore` to prevent future secret commits
- ✅ Successfully pushed clean code to GitHub

---

## 🔧 **STEP 1: Configure GitHub Secrets**

Go to: **GitHub Repository → Settings → Secrets and variables → Actions** → Click "New repository secret"

### **Required GitHub Secrets**

#### **AWS Credentials**
```
AWS_ACCESS_KEY_ID
  Purpose: Access to AWS services
  Get from: AWS Console → IAM → User → Security credentials
  Permission: Admin or specific S3, EC2, CloudFront permissions

AWS_SECRET_ACCESS_KEY
  Purpose: Secret key paired with Access Key ID
  Get from: AWS Console → IAM → User → Security credentials
  WARNING: Only shown once when created - save securely!
```

#### **Backend Deployment Secrets**
```
EC2_HOST
  Example: ec2-3-87-123-45.compute-1.amazonaws.com
  Get from: AWS Console → EC2 → Instances → Public IPv4 address/DNS

EC2_USER
  Value: ubuntu (for Ubuntu 22.04 LTS)
  or: ec2-user (for Amazon Linux 2)

EC2_SSH_KEY
  Get from: Your EC2 key pair .pem file
  Usage: Paste entire content of your-key.pem file
```

#### **Frontend Deployment Secrets (S3 + CloudFront)**
```
S3_BUCKET_ADMIN
  Value: jnv-spectra-admin (you'll create this)

S3_BUCKET_WEBSITE
  Value: jnv-spectra-website (you'll create this)

S3_BUCKET_CHECKOUT
  Value: jnv-spectra-checkout (you'll create this)

CLOUDFRONT_DISTRIBUTION_ADMIN
  Get from: AWS Console → CloudFront → Distribution ID

CLOUDFRONT_DISTRIBUTION_WEBSITE
  Get from: AWS Console → CloudFront → Distribution ID

CLOUDFRONT_DISTRIBUTION_CHECKOUT
  Get from: AWS Console → CloudFront → Distribution ID
```

---

## 🏗️ **STEP 2: AWS Infrastructure Setup**

### **A. Create EC2 Instance for Backend**

1. **In AWS Console → EC2 → Instances → Launch Instances:**
   - **Name:** `jnv-backend-server`
   - **AMI:** Ubuntu 22.04 LTS (Free tier eligible)
   - **Instance Type:** t3.medium (1 vCPU, 4GB RAM)
   - **Key Pair:** Create new or use existing
   - **Security Group:** Allow:
     - SSH (22) from your IP
     - HTTP (80) from 0.0.0.0/0
     - HTTPS (443) from 0.0.0.0/0
     - Custom TCP 3000 from 0.0.0.0/0 (API)

2. **Launch and save the key pair securely**

### **B. Create S3 Buckets for Frontend Apps**

Run these commands in AWS CLI or use AWS Console:

```bash
# Admin Portal Bucket
aws s3api create-bucket \
  --bucket jnv-spectra-admin \
  --region us-east-1

# Website Bucket
aws s3api create-bucket \
  --bucket jnv-spectra-website \
  --region us-east-1

# Checkout App Bucket
aws s3api create-bucket \
  --bucket jnv-spectra-checkout \
  --region us-east-1

# Enable static website hosting on each bucket
aws s3api put-bucket-website \
  --bucket jnv-spectra-admin \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'

# (Repeat for other buckets)

# Block public access but allow CloudFront
aws s3api put-bucket-public-access-block \
  --bucket jnv-spectra-admin \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### **C. Create CloudFront Distributions**

For each S3 bucket, create a CloudFront distribution:

1. **In AWS Console → CloudFront → Create distribution:**
   - **Origin domain:** Select your S3 bucket
   - **Viewer protocol policy:** Redirect HTTP to HTTPS
   - **Default cache behavior:** Allow all methods
   - **Caching:** Standard cache settings
   - **Alternate domain names (CNAMEs):**
     - Admin: `admin.jnvspectra.com`
     - Website: `www.jnvspectra.com` (or `jnvspectra.com`)
     - Checkout: `checkout.jnvspectra.com`

2. **Save the Distribution IDs** - you'll need these for GitHub Secrets

### **D. Create IAM User for CI/CD**

For GitHub Actions to deploy:

1. **AWS Console → IAM → Users → Create user**
   - **Name:** `github-actions-deploy`

2. **Attach policies:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:*",
           "cloudfront:CreateInvalidation",
           "ec2:*",
           "ecr:*"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

3. **Create access keys** → Save for GitHub Secrets

### **E. ECR Repository for Backend**

```bash
aws ecr create-repository \
  --repository-name jnv-backend \
  --region us-east-1
```

### **F. RDS PostgreSQL Database**
- ✅ Already configured: `jnvspectra.cqzcueeo8qb6.us-east-1.rds.amazonaws.com`
- ✅ Database: `jnvdb`
- ✅ User: `root`
- ✅ Bucket for images: `jnv-images`

---

## 🖥️ **STEP 3: EC2 Server Setup & Backend Deployment**

### **Connect to EC2 Instance**

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Or if using Amazon Linux 2
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### **Install Docker & Docker Compose**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io git curl

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### **Login to ECR & Pull Backend Image**

```bash
# Configure AWS CLI (you already have credentials)
aws configure

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Create app directory
mkdir -p ~/jnv-backend
cd ~/jnv-backend
```

### **Create Production .env File**

```bash
# Create .env file
sudo nano /home/ubuntu/.env
```

**Paste this content (update with your actual values):**

```env
# Server Configuration
PORT=3000
NODE_ENV=production

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

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=JNV Spectra

# Square Payment
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_square_location_id

# Frontend URLs
FRONTEND_URL=https://www.jnvspectra.com
FRONTEND_ADMIN_URL=https://admin.jnvspectra.com
FRONTEND_CHECKOUT_URL=https://checkout.jnvspectra.com

# Supabase (if still using it)
SUPABASE_URL=https://mmrblmtshtwucjhamxnc.supabase.co
SUPABASE_KEY=your_supabase_key
```

### **Create Docker Compose File**

```bash
nano docker-compose.yml
```

```yaml
version: '3.8'

services:
  app:
    image: 123456789.dkr.ecr.us-east-1.amazonaws.com/jnv-backend:latest
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - AWS_REGION=${AWS_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_BUCKET_NAME=${AWS_BUCKET_NAME}
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### **Start Backend Service**

```bash
# Load environment variables
export $(cat .env | xargs)

# Pull latest image from ECR
docker-compose pull

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f app

# Check if running
curl http://localhost:3000/api/v1/health
```

---

## 🌐 **STEP 4: Configure Domain (Hostinger → AWS)**

### **Update Hostinger Nameservers to Route53**

1. **In AWS Console → Route 53 → Hosted Zones → Create hosted zone**
   - Domain: `jnvspectra.com`

2. **Copy the NS records (4 nameservers)**

3. **In Hostinger Control Panel:**
   - Go to DNS settings
   - Change nameservers to Route 53 NS records
   - Wait 24 hours for propagation (usually 15 minutes)

### **Create Route 53 Records**

In AWS Route 53, add these records:

```
Type: A (Alias)
Name: jnvspectra.com
Target: CloudFront distribution (website)
TTL: 300

Type: A (Alias)
Name: www.jnvspectra.com
Target: CloudFront distribution (website)
TTL: 300

Type: A (Alias)
Name: admin.jnvspectra.com
Target: CloudFront distribution (admin)
TTL: 300

Type: A (Alias)
Name: checkout.jnvspectra.com
Target: CloudFront distribution (checkout)
TTL: 300

Type: A (Record)
Name: api.jnvspectra.com
Value: Your EC2 Public IP
TTL: 300
```

### **Request SSL Certificates (AWS Certificate Manager)**

1. **AWS Console → Certificate Manager → Request certificate**
   - Domain: `jnvspectra.com`
   - Add SANs: `www.jnvspectra.com`, `admin.jnvspectra.com`, `checkout.jnvspectra.com`, `api.jnvspectra.com`

2. **Validate DNS records** (automatic via Route 53)

3. **Attach to CloudFront distributions**

---

## 🔄 **STEP 5: CI/CD Deployment Workflow**

### **How the Deployment Works**

```
Developer Push to Main Branch
           ↓
GitHub Actions Triggers Workflows
           ↓
┌──────────────────────────────────┐
│  Code Quality Checks             │
│  - Lint all apps                 │
│  - Build & test                  │
│  - Security scanning             │
│  - Secrets detection             │
└──────────────────────────────────┘
           ↓
     ✅ All Checks Pass
           ↓
┌─────────────────────────────────────────────────┐
│  Parallel Deployment to AWS                     │
│  ┌──────────────────────────────────┐           │
│  │ Backend → EC2                    │           │
│  │ - Build Docker image             │           │
│  │ - Push to ECR                    │           │
│  │ - Deploy to EC2 (docker-compose) │           │
│  └──────────────────────────────────┘           │
│  ┌──────────────────────────────────┐           │
│  │ Admin → S3 + CloudFront          │           │
│  │ - Build React app                │           │
│  │ - Upload to S3                   │           │
│  │ - Invalidate CloudFront cache    │           │
│  └──────────────────────────────────┘           │
│  ┌──────────────────────────────────┐           │
│  │ Website → S3 + CloudFront        │           │
│  │ - Build React app                │           │
│  │ - Upload to S3                   │           │
│  │ - Invalidate CloudFront cache    │           │
│  └──────────────────────────────────┘           │
│  ┌──────────────────────────────────┐           │
│  │ Checkout → S3 + CloudFront       │           │
│  │ - Build React app                │           │
│  │ - Upload to S3                   │           │
│  │ - Invalidate CloudFront cache    │           │
│  └──────────────────────────────────┘           │
└─────────────────────────────────────────────────┘
           ↓
     🎉 Deployment Complete!
```

### **Deployment Triggers**

GitHub Actions workflows automatically trigger on:
- Push to `main` branch
- Changes to relevant app directories
- Pull requests (tests only, no deployment)

---

## 🚀 **STEP 6: Trigger First Deployment**

### **Option A: Via GitHub Web Interface**

1. Go to **GitHub Repo → Actions tab**
2. Select workflow (e.g., "Deploy Backend")
3. Click "Run workflow" button

### **Option B: Via Git Command**

```bash
# Make a small change to trigger CI/CD
echo "# Production deployment initiated" >> README.md

# Commit and push
git add README.md
git commit -m "Trigger production deployment"
git push origin main

# Watch deployment in GitHub Actions tab
```

### **Monitor Deployment**

1. Go to **GitHub → Actions tab**
2. Click on the running workflow
3. Watch the job outputs in real-time
4. Check logs if any step fails

---

## ✅ **STEP 7: Verify Production Deployment**

After deployment completes, verify all services:

### **Backend API**
```bash
# Test API health
curl https://api.jnvspectra.com/api/v1/health

# Expected response
{"status": "ok", "timestamp": "2024-05-14T10:30:00Z"}
```

### **Frontend Applications**
Open in browser:
- **Admin Portal:** https://admin.jnvspectra.com
- **Website:** https://www.jnvspectra.com
- **Checkout App:** https://checkout.jnvspectra.com

### **Database Connectivity**
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check Docker logs
docker-compose logs app | grep "Connected to database"
```

### **S3 & CloudFront**
```bash
# Verify S3 buckets have files
aws s3 ls s3://jnv-spectra-admin/

# Check CloudFront cache
curl -I https://admin.jnvspectra.com

# Look for X-Cache header (Hit from cloudfront = good cache)
```

---

## 🔍 **TROUBLESHOOTING PRODUCTION ISSUES**

### **Backend Deployment Issues**

#### **Docker container crashes on EC2**
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check container status
docker ps -a

# View container logs
docker logs container_id

# Check system resources
docker stats
```

#### **Database connection failed**
```bash
# Verify RDS is accessible
psql -h jnvspectra.cqzcueeo8qb6.us-east-1.rds.amazonaws.com \
     -U root -d jnvdb -c "SELECT 1;"

# Check security group rules in AWS Console
# - EC2 security group must allow outbound to RDS port 5432
# - RDS security group must allow inbound from EC2 security group
```

#### **Out of storage on EC2**
```bash
# Check disk usage
df -h

# Clean up old Docker images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### **Frontend Deployment Issues**

#### **CloudFront not updating after deployment**
```bash
# The invalidation should happen automatically
# But you can manually invalidate:
aws cloudfront create-invalidation \
  --distribution-id E123EXAMPLE456 \
  --paths "/*"

# Or use AWS Console → CloudFront → Distribution → Invalidations tab
```

#### **S3 bucket access denied**
```bash
# Check IAM permissions
aws iam get-user

# Verify bucket policy allows CloudFront access
aws s3api get-bucket-policy --bucket jnv-spectra-admin
```

#### **CloudFront returning 404 errors**
- Check S3 bucket has `index.html` and app files
- Verify CloudFront origin points to correct S3 bucket
- Check CloudFront Default Root Object = `index.html`

### **Domain/DNS Issues**

#### **Domain not resolving**
```bash
# Check DNS propagation
nslookup jnvspectra.com
dig jnvspectra.com

# Verify Route 53 records are correct
aws route53 list-resource-record-sets --hosted-zone-id your-zone-id
```

#### **SSL certificate errors**
- Certificates must be in AWS Certificate Manager (ACM) in us-east-1
- Certificate must include all domains (jnvspectra.com, www, admin, checkout, api)
- Attach certificate to CloudFront distributions

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Checks**

**Backend API Health:**
```bash
# Regular health endpoint
curl https://api.jnvspectra.com/api/v1/health

# Database check
curl https://api.jnvspectra.com/api/v1/health -v
```

**Frontend Applications:**
```bash
# Check if CloudFront is serving content
curl -I https://admin.jnvspectra.com
curl -I https://www.jnvspectra.com
curl -I https://checkout.jnvspectra.com
```

### **View Logs**

**Backend logs on EC2:**
```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# View real-time logs
docker-compose logs -f app

# View specific number of lines
docker-compose logs app --tail 100
```

**CloudFront access logs** (Enable in AWS Console):
- Logs stored in S3 bucket
- Analyze with CloudFront logs parser

**GitHub Actions logs:**
- GitHub → Repository → Actions tab
- Click on workflow run to see detailed logs

### **Backup Strategy**

| Service | Backup Method | Status |
|---------|--------------|--------|
| PostgreSQL RDS | Automated snapshots (7 days) | ✅ Automatic |
| S3 Buckets | Versioning + Cross-region replication | ✅ Manual setup |
| Application Code | GitHub repository | ✅ Automatic |
| Database backups | AWS RDS automated backups, manual exports | ✅ In place |

**Manual backup:**
```bash
# Export RDS database
aws rds create-db-snapshot \
  --db-instance-identifier jnvspectra \
  --db-snapshot-identifier jnvspectra-backup-$(date +%Y%m%d)

# Backup S3 to another bucket
aws s3 sync s3://jnv-spectra-admin s3://jnv-spectra-admin-backup/
```

---

## 💰 **AWS COST ESTIMATES** (Monthly)

| Service | Configuration | Est. Cost |
|---------|---|---|
| **EC2** | t3.medium, 24/7 | $30-45 |
| **RDS PostgreSQL** | db.t3.micro, Multi-AZ | $25-50 |
| **S3 Storage** | 3 buckets, 50GB | $1-2 |
| **CloudFront** | ~1TB/month egress | $85 |
| **Data Transfer** | EC2 ↔ RDS, S3 | $5-10 |
| **Route 53** | Hosted zone + queries | $1 |
| **ACM Certificate** | Free (with CloudFront) | $0 |
| **ECR** | Backend Docker image | $0.50 |
| **Total** | **Production Full Stack** | **$148-194** |

*Note: Prices are in USD and vary by region. Check AWS pricing calculator for exact costs.*

---

## 🔐 **SECURITY BEST PRACTICES**

### **GitHub Secrets Management**
- ✅ Never commit `.env` files to git
- ✅ Rotate AWS access keys every 90 days
- ✅ Use IAM roles instead of access keys when possible
- ✅ Enable MFA on AWS root account

### **AWS Security**
- ✅ Security groups: Restrict SSH to your IP only
- ✅ NACLs: Default deny + explicit allow
- ✅ S3 buckets: Block public access + use CloudFront
- ✅ RDS: Enable Multi-AZ + automated backups
- ✅ Secrets Scanning: TruffleHog runs on every commit

### **Certificate & Domain Security**
- ✅ SSL/TLS enabled on all endpoints (HTTPS only)
- ✅ Auto-renewal via AWS ACM
- ✅ Domain name system (DNS) over HTTPS (DoH)
- ✅ DNSSEC enabled in Route 53

### **Application Security**
- ✅ CORS configured for CloudFront domains only
- ✅ HSTS headers enabled
- ✅ CSP (Content Security Policy) headers set
- ✅ Environment variables never logged

---

## 📋 **DEPLOYMENT CHECKLIST**

Before first deployment, ensure:

### **AWS Setup**
- [ ] AWS account created and configured
- [ ] IAM user `github-actions-deploy` created with permissions
- [ ] Access keys generated and saved securely

### **Infrastructure**
- [ ] EC2 instance launched (Ubuntu 22.04 LTS, t3.medium+)
- [ ] Security groups configured (SSH, HTTP, HTTPS, 3000)
- [ ] S3 buckets created (admin, website, checkout)
- [ ] CloudFront distributions created for each bucket
- [ ] ECR repository created (jnv-backend)
- [ ] RDS database accessible from EC2
- [ ] Route 53 hosted zone configured

### **GitHub Configuration**
- [ ] All GitHub Secrets added (AWS, EC2, S3, CloudFront)
- [ ] CI/CD workflows enabled
- [ ] Branch protection rules configured
- [ ] Secrets scanning enabled

### **Domain Configuration**
- [ ] Hostinger nameservers updated to Route 53
- [ ] Route 53 A records created for all subdomains
- [ ] ACM certificate requested and validated
- [ ] Certificate attached to CloudFront

### **Application Configuration**
- [ ] Production `.env` file created on EC2
- [ ] Backend Dockerfile verified
- [ ] Frontend build configurations correct
- [ ] API endpoint URLs updated (VITE_API_BASE_URL)

### **Monitoring Setup**
- [ ] CloudWatch alarms configured
- [ ] S3 access logging enabled
- [ ] EC2 detailed monitoring enabled
- [ ] Backup strategy implemented

---

## 🎯 **QUICK START - Production Deployment Summary**

```bash
# 1. Add GitHub Secrets (via GitHub web interface)
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
EC2_HOST, EC2_USER, EC2_SSH_KEY
S3_BUCKET_ADMIN, S3_BUCKET_WEBSITE, S3_BUCKET_CHECKOUT
CLOUDFRONT_DISTRIBUTION_ADMIN, CLOUDFRONT_DISTRIBUTION_WEBSITE, CLOUDFRONT_DISTRIBUTION_CHECKOUT

# 2. Push to main branch
git add .
git commit -m "Deploy to production"
git push origin main

# 3. Monitor on GitHub Actions
# - Go to GitHub → Actions tab
# - Watch workflow execution
# - Verify all steps pass

# 4. Verify deployment
curl https://api.jnvspectra.com/api/v1/health
open https://admin.jnvspectra.com
open https://www.jnvspectra.com
open https://checkout.jnvspectra.com
```

---

## 🌟 **WHAT'S DEPLOYED**

### **Backend API (EC2 + Docker)**
- **Domain:** api.jnvspectra.com
- **Port:** 3000 (via Route 53 A record)
- **Database:** AWS RDS PostgreSQL
- **Storage:** AWS S3 (jnv-images bucket)
- **Deployment:** CI/CD via docker-compose on EC2

### **Admin Portal (S3 + CloudFront)**
- **Domain:** admin.jnvspectra.com
- **Hosting:** AWS S3 static website
- **CDN:** AWS CloudFront
- **Deployment:** React/Vite build → S3 sync → CloudFront invalidation

### **Website (S3 + CloudFront)**
- **Domain:** jnvspectra.com / www.jnvspectra.com
- **Hosting:** AWS S3 static website
- **CDN:** AWS CloudFront
- **Deployment:** React/Vite build → S3 sync → CloudFront invalidation

### **Checkout App (S3 + CloudFront)**
- **Domain:** checkout.jnvspectra.com
- **Hosting:** AWS S3 static website
- **CDN:** AWS CloudFront
- **Deployment:** React/Vite build → S3 sync → CloudFront invalidation

---

## 📞 **SUPPORT & TROUBLESHOOTING**

**For issues during deployment:**

1. ✅ Check GitHub Actions logs for detailed error messages
2. ✅ Verify all GitHub Secrets are configured correctly
3. ✅ SSH into EC2 and check Docker logs
4. ✅ Test AWS credentials with AWS CLI
5. ✅ Verify Route 53 DNS records are correct
6. ✅ Check CloudFront origin configuration
7. ✅ Monitor RDS connection from EC2
8. ✅ Review security group rules

**Emergency rollback:**
```bash
# Revert to previous Docker image on EC2
docker-compose down
docker pull 123456789.dkr.ecr.us-east-1.amazonaws.com/jnv-backend:previous-tag
docker-compose up -d
```

---

## 🎉 **SUCCESS!**

Your JNV Spectra Event Management System is now:**
- ✅ Automatically deployed on every push to main
- ✅ Hosted on AWS infrastructure
- ✅ Using your Hostinger domain
- ✅ Protected with SSL/TLS certificates
- ✅ Distributed globally via CloudFront CDN
- ✅ Monitored with health checks
- ✅ Backed up automatically

**Ready for production traffic!** 🚀
