# 📋 Production Deployment Checklist - JNV Spectra

## 🎯 Project Overview

**JNV Spectra Event Management System** - Complete cloud-native deployment on AWS with Hostinger domain.

```
Architecture:
┌─────────────────────────────────────────────┐
│ Hostinger Domain: jnvspectra.com            │
└─────────────────────────────────────────────┘
    │
    ├─→ AWS Route 53 (DNS)
    │
    ├─── admin.jnvspectra.com → CloudFront → S3 (Admin Portal)
    ├─── www.jnvspectra.com → CloudFront → S3 (Website)
    ├─── checkout.jnvspectra.com → CloudFront → S3 (Checkout App)
    │
    └─── api.jnvspectra.com → EC2 (Backend API)
         └─→ RDS (PostgreSQL Database)
         └─→ S3 (File Storage)
```

---

## ✅ Pre-Deployment Checklist

### **Phase 0: Prerequisites (Before AWS Setup)**

- [ ] GitHub repository created and code pushed
- [ ] Hostinger domain purchased and activated
- [ ] AWS account created
- [ ] AWS CLI installed on local machine
- [ ] SSH key generation tool available (OpenSSH or PuTTYgen)
- [ ] Text editor handy for keeping notes

### **Phase 1: AWS Infrastructure Setup** ⏱️ ~2-3 hours

Follow: **AWS_INFRASTRUCTURE_SETUP.md**

#### EC2 Backend Server
- [ ] EC2 instance launched (t3.medium, Ubuntu 22.04 LTS)
- [ ] Security group configured (SSH, HTTP, HTTPS, 3000)
- [ ] Key pair created and downloaded (.pem file)
- [ ] SSH connection tested: `ssh -i key.pem ubuntu@ip-address`
- [ ] Elastic IP allocated and associated

#### S3 Buckets for Frontend Apps
- [ ] S3 bucket created: `jnv-spectra-admin`
- [ ] S3 bucket created: `jnv-spectra-website`
- [ ] S3 bucket created: `jnv-spectra-checkout`
- [ ] Static website hosting enabled on all 3 buckets
- [ ] Public access blocked on all 3 buckets

#### CloudFront Distributions
- [ ] CloudFront distribution created for Admin Portal
  - CNAME: `admin.jnvspectra.com`
  - Default root object: `index.html`
  - Distribution ID saved: ________________
- [ ] CloudFront distribution created for Website
  - CNAME: `www.jnvspectra.com`
  - Default root object: `index.html`
  - Distribution ID saved: ________________
- [ ] CloudFront distribution created for Checkout
  - CNAME: `checkout.jnvspectra.com`
  - Default root object: `index.html`
  - Distribution ID saved: ________________

#### Route 53 DNS
- [ ] Hosted zone created: `jnvspectra.com`
- [ ] Nameservers copied from Route 53
- [ ] Hostinger nameservers updated to Route 53 NS records
- [ ] DNS propagation verified: `nslookup jnvspectra.com`
- [ ] Route 53 A records created:
  - [ ] `jnvspectra.com` → CloudFront (website)
  - [ ] `www.jnvspectra.com` → CloudFront (website)
  - [ ] `admin.jnvspectra.com` → CloudFront (admin)
  - [ ] `checkout.jnvspectra.com` → CloudFront (checkout)
  - [ ] `api.jnvspectra.com` → EC2 Elastic IP

#### SSL/TLS Certificates
- [ ] ACM certificate requested for `jnvspectra.com`
- [ ] SANs added:
  - [ ] `*.jnvspectra.com`
  - [ ] `www.jnvspectra.com`
  - [ ] `admin.jnvspectra.com`
  - [ ] `checkout.jnvspectra.com`
  - [ ] `api.jnvspectra.com`
- [ ] Certificate validated and active
- [ ] Certificate attached to CloudFront distributions (3)
- [ ] HTTPS working on all domains

#### IAM & Security
- [ ] ECR repository created: `jnv-backend`
- [ ] IAM user created: `github-actions-deploy`
- [ ] IAM policies attached (S3, CloudFront, EC2, ECR)
- [ ] Access keys generated and saved securely
- [ ] AWS credentials never saved in git repository

### **Phase 2: GitHub Secrets Configuration** ⏱️ ~30 minutes

Follow: **GITHUB_SECRETS_GUIDE.md**

- [ ] GitHub Secrets added to repository:

**AWS Core Credentials:**
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`

**EC2 Deployment:**
- [ ] `EC2_HOST` (Public IPv4 DNS or Elastic IP)
- [ ] `EC2_USER` (ubuntu)
- [ ] `EC2_SSH_KEY` (complete .pem file content)

**S3 Bucket Names:**
- [ ] `S3_BUCKET_ADMIN`
- [ ] `S3_BUCKET_WEBSITE`
- [ ] `S3_BUCKET_CHECKOUT`

**CloudFront Distribution IDs:**
- [ ] `CLOUDFRONT_DISTRIBUTION_ADMIN`
- [ ] `CLOUDFRONT_DISTRIBUTION_WEBSITE`
- [ ] `CLOUDFRONT_DISTRIBUTION_CHECKOUT`

- [ ] All secrets verified (not truncated)
- [ ] Secret names match exactly (case-sensitive)
- [ ] No credentials committed to git

### **Phase 3: EC2 Server Initialization** ⏱️ ~15 minutes

1. **SSH into EC2 instance:**
   ```bash
   ssh -i jnv-backend-key.pem ubuntu@your-ec2-ip
   ```

2. **Download setup script:**
   ```bash
   curl -O https://raw.githubusercontent.com/jnvcommercials/JNV_SPECTRA/main/setup-ec2.sh
   chmod +x setup-ec2.sh
   bash setup-ec2.sh
   ```

   Or from local file:
   ```bash
   scp -i jnv-backend-key.pem setup-ec2.sh ubuntu@your-ec2-ip:~/
   ssh -i jnv-backend-key.pem ubuntu@your-ec2-ip "bash setup-ec2.sh"
   ```

- [ ] setup-ec2.sh executed successfully
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] AWS CLI installed
- [ ] Application directories created

3. **Configure environment on EC2:**
   ```bash
   ssh -i jnv-backend-key.pem ubuntu@your-ec2-ip
   
   # Edit .env file
   nano ~/.env
   # Update with:
   # - DB_PASSWORD (from RDS)
   # - AWS_ACCESS_KEY_ID
   # - AWS_SECRET_ACCESS_KEY
   # - JWT_SECRET
   # - All other credentials
   
   # Configure AWS CLI
   nano ~/.aws/credentials
   # Paste IAM user credentials
   chmod 600 ~/.aws/credentials
   ```

- [ ] `.env` file created and populated with actual values
- [ ] AWS credentials configured
- [ ] File permissions set correctly (chmod 600)

4. **Test ECR login:**
   ```bash
   # Replace 123456789 with your AWS Account ID
   aws ecr get-login-password --region us-east-1 | \
   docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
   ```

- [ ] ECR login successful

### **Phase 4: Verify CI/CD Workflows** ⏱️ ~5 minutes

- [ ] Check GitHub Actions workflows enabled
- [ ] Verify workflows files exist:
  - [ ] `.github/workflows/deploy-backend.yml`
  - [ ] `.github/workflows/deploy-frontend.yml`
  - [ ] `.github/workflows/code-quality.yml`
  - [ ] `.github/workflows/secrets-scan.yml`

### **Phase 5: First Production Deployment** ⏱️ ~10-15 minutes

1. **Trigger deployment:**
   ```bash
   git add .
   git commit -m "Deploy: Production deployment - AWS + Hostinger domain"
   git push origin main
   ```

2. **Monitor in GitHub Actions:**
   - [ ] Go to GitHub → Actions tab
   - [ ] Watch "Deploy Backend" workflow
   - [ ] Watch "Deploy Frontend Applications" workflow
   - [ ] All jobs complete successfully

3. **If workflows succeed:**
   - Backend Docker image pushed to ECR
   - Backend deployed to EC2
   - Frontend apps built and deployed to S3
   - CloudFront caches invalidated

---

## 🧪 Post-Deployment Testing

### **Test Backend API**

```bash
# Health check
curl https://api.jnvspectra.com/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"2024-05-14T..."}
```

- [ ] API responds with status: ok
- [ ] HTTPS working (not HTTP)
- [ ] Response time < 1 second

**If failing:**
- [ ] SSH to EC2 and check Docker logs: `docker logs jnv-backend`
- [ ] Verify .env file has correct database credentials
- [ ] Check RDS security group allows EC2 connection
- [ ] Check API endpoint returns 200 status

### **Test Frontend Applications**

Open in browser and verify each loads:

**Admin Portal:**
- [ ] https://admin.jnvspectra.com loads
- [ ] HTTPS padlock appears
- [ ] No certificate warnings
- [ ] Page interactive (login form works)
- [ ] Network requests go to api.jnvspectra.com

**Website:**
- [ ] https://www.jnvspectra.com loads
- [ ] https://jnvspectra.com redirects to www
- [ ] HTTPS padlock appears
- [ ] No certificate warnings
- [ ] Page displays content correctly
- [ ] CloudFront cache header visible: `curl -I https://www.jnvspectra.com | grep X-Cache`

**Checkout App:**
- [ ] https://checkout.jnvspectra.com loads
- [ ] HTTPS padlock appears
- [ ] Form submits successfully
- [ ] Connects to backend API correctly

### **Test Database Connectivity**

SSH to EC2:
```bash
ssh -i jnv-backend-key.pem ubuntu@your-ec2-ip

# Check database connection
docker exec jnv-backend npx knex migrate:latest

# Should show any pending migrations completed
```

- [ ] Database migrations run successfully
- [ ] No connection errors

### **Test File Upload (S3)**

Through admin portal or API:
```bash
# Try uploading an image/file
# Should store in jnv-images S3 bucket
```

- [ ] Files upload successfully
- [ ] Files appear in S3 bucket: `aws s3 ls s3://jnv-images/`
- [ ] Files accessible via CloudFront

### **Test Email Functionality**

Trigger an email action (e.g., user registration):
- [ ] Email sent successfully
- [ ] Email arrives in mailbox
- [ ] Email formatting correct

### **Test Payment Integration (Square)**

If checkout implemented:
- [ ] Square payment form loads
- [ ] Test transaction processes (use Square test cards)
- [ ] Transaction recorded in backend

---

## 📊 Performance & Monitoring Setup

### **CloudWatch Monitoring**

```bash
# Enable detailed monitoring on EC2
aws ec2 monitor-instances --instance-ids i-xxxxx --region us-east-1

# Create CloudWatch alarms for:
```

- [ ] EC2 CPU utilization > 80%
- [ ] EC2 Network in > 1GB/hour
- [ ] RDS database connections > 90% available
- [ ] S3 bucket size > 50GB

### **CloudFront Analytics**

In AWS Console → CloudFront → Distributions:
- [ ] Enable CloudFront access logging
- [ ] Logs stored in separate S3 bucket
- [ ] Review cache hit ratio (should be > 80%)

### **Route 53 Health Checks**

```bash
# Create health checks for all critical endpoints
aws route53 create-health-check ...
```

- [ ] Health check for api.jnvspectra.com
- [ ] Health check for www.jnvspectra.com
- [ ] Alerts configured if any endpoint down

---

## 🔒 Security Post-Deployment

- [ ] All traffic uses HTTPS (redirect HTTP → HTTPS)
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] CloudFront distribution using HTTPS
- [ ] S3 buckets block public access
- [ ] EC2 security group restricts SSH to known IPs only
- [ ] RDS database uses encryption at rest
- [ ] OpenSSH key regularly rotated
- [ ] AWS credentials rotated every 90 days
- [ ] MFA enabled on AWS root account
- [ ] IAM user permissions follow principle of least privilege

---

## 📈 Cost Monitoring

### **Set up AWS Budgets**

AWS Console → Billing → Budgets:
- [ ] Create Total Cost budget: $200/month
- [ ] Alert at: 80%, 100%, 110%
- [ ] Receive notifications via email

### **Monthly Cost Breakdown**

| Service | Est. Cost | Status |
|---------|-----------|--------|
| EC2 t3.medium | $30-45 | ✓ |
| RDS PostgreSQL | $25-50 | ✓ |
| S3 Storage + Transfer | $5-10 | ✓ |
| CloudFront | $30-100 | ✓ |
| Route 53 | $1 | ✓ |
| ECR | $0.50 | ✓ |
| **Total** | **$91-206** | ✓ |

---

## 🆘 Troubleshooting Guide

### **Deployment Failed**

1. Check GitHub Actions logs
2. SSH to EC2: `docker logs jnv-backend`
3. Check RDS connectivity from EC2
4. Verify all GitHub Secrets are correct
5. Check AWS credentials have proper permissions

### **Backend Not Responding**

```bash
# SSH to EC2
ssh -i key.pem ubuntu@ip

# Check container status
docker ps

# View logs
docker-compose logs -f app

# Restart container
cd ~/jnv-backend
docker-compose restart
```

### **Frontend Pages Not Loading**

1. Check S3 buckets have files: `aws s3 ls s3://jnv-spectra-admin/`
2. Verify CloudFront is pointing to correct S3 origin
3. Check CloudFront cache: `curl -I https://admin.jnvspectra.com`
4. Invalidate cache: `aws cloudfront create-invalidation --distribution-id E123 --paths "/*"`

### **DNS Not Resolving**

```bash
# Check Route 53 records
nslookup jnvspectra.com
dig admin.jnvspectra.com

# Verify Hostinger nameservers
# AWS Console → Route 53 → Hosted zones → jnvspectra.com
# Copy NS records and verify in Hostinger DNS settings
```

### **HTTPS Certificate Issues**

1. Verify certificate in AWS Console → ACM
2. Check certificate status: `Issued`
3. Verify SANs include all required domains
4. Attach certificate to CloudFront in distribution settings
5. Wait 10-15 minutes for propagation

---

## 🎯 Deployment Completion

When all checkboxes are checked ✓, your production deployment is complete!

### **You have successfully deployed:**

✅ **Backend API** on EC2 with Docker  
✅ **Admin Portal** on S3 + CloudFront  
✅ **Website** on S3 + CloudFront  
✅ **Checkout App** on S3 + CloudFront  
✅ **Database** on AWS RDS PostgreSQL  
✅ **File Storage** on AWS S3  
✅ **DNS** managed by Route 53  
✅ **SSL/TLS** via AWS ACM  
✅ **CI/CD** via GitHub Actions  
✅ **Monitoring** via CloudWatch  

---

## 📚 Documentation References

| Document | Purpose |
|----------|---------|
| **AWS_INFRASTRUCTURE_SETUP.md** | Detailed AWS infrastructure setup steps |
| **GITHUB_SECRETS_GUIDE.md** | How to configure GitHub Secrets |
| **DEPLOYMENT_GUIDE.md** | Complete deployment workflow and troubleshooting |
| **setup-ec2.sh** | Automated EC2 initialization script |
| **ENVIRONMENT_SETUP.md** | Environment variables reference |

---

## 🚀 What's Deployed and Running

```
Production URLs:
┌──────────────────────────────────────────────────┐
│ https://api.jnvspectra.com                       │ → Backend API
│ https://admin.jnvspectra.com                     │ → Admin Portal
│ https://www.jnvspectra.com                       │ → Website
│ https://checkout.jnvspectra.com                  │ → Checkout App
│ https://jnvspectra.com                           │ → Website (redirect)
└──────────────────────────────────────────────────┘

Database: PostgreSQL on AWS RDS
Storage: S3 bucket (jnv-images)
Monitoring: CloudWatch + CloudFront logs
Backups: Automatic RDS snapshots
CDN: AWS CloudFront (global distribution)
```

---

## 🎉 Success!

Your JNV Spectra Event Management System is now live in production on AWS with your Hostinger domain!

- 📊 Monitor performance via CloudWatch
- 📈 Track costs via AWS Billing
- 🔐 Keep security up-to-date
- 📝 Review and optimize deployment regularly

**Ready for production traffic!** 🚀

---

**Last Updated:** May 14, 2024  
**Version:** 1.0 - Production Ready  
**Status:** ✅ Complete

