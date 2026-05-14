# 🚀 AWS Production Deployment - Quick Start Guide

## 📋 What's Been Set Up

Your JNV Spectra Event Management System is now ready for AWS production deployment. Here's what has been configured:

### ✅ Completed Configurations

1. **GitHub Actions CI/CD Workflows** 
   - Backend deployment to EC2 via Docker/ECR
   - Frontend deployment to S3 + CloudFront
   - Code quality and security scanning
   - Automated on every push to `main` branch

2. **Updated Deployment Workflows**
   - Changed from Vercel to **AWS-only** deployment
   - Frontend apps deploy to S3 + CloudFront (your Hostinger domain subdomain)
   - Backend deploys to EC2 with Docker

3. **Comprehensive Documentation Created**
   - AWS Infrastructure Setup Guide
   - GitHub Secrets Configuration Guide
   - EC2 Server Setup Script (automated)
   - Production Deployment Checklist
   - Updated Deployment Guide

---

## 🎯 Your Next Steps (In Order)

### **Phase 1: AWS Infrastructure (2-3 hours)**

Follow the guide: **[AWS_INFRASTRUCTURE_SETUP.md](./AWS_INFRASTRUCTURE_SETUP.md)**

This covers:
- ✅ Creating EC2 instance
- ✅ Creating S3 buckets for frontend apps
- ✅ Setting up CloudFront distributions
- ✅ Configuring Route 53 DNS
- ✅ Creating SSL certificates
- ✅ Setting up IAM user for CI/CD

**What you'll need:**
- AWS Account
- Your Hostinger domain
- 1-2 hours of time

**Output:** AWS infrastructure ready, credentials saved

---

### **Phase 2: GitHub Secrets Configuration (30 minutes)**

Follow the guide: **[GITHUB_SECRETS_GUIDE.md](./GITHUB_SECRETS_GUIDE.md)**

This covers:
- ✅ Where to find each secret value
- ✅ How to add secrets to GitHub
- ✅ Verification steps
- ✅ Security best practices

**What you'll do:**
1. Open GitHub → Repository Settings → Secrets
2. Add 12 GitHub Secrets from AWS setup
3. Verify all secrets are correct

**Output:** GitHub Secrets configured ✓

---

### **Phase 3: EC2 Server Setup (15 minutes)**

SSH into your EC2 instance and run automated setup:

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Run setup script (download from your repo or upload locally)
bash setup-ec2.sh

# Then configure environment
nano ~/.env          # Edit with actual credentials
nano ~/.aws/credentials  # Add AWS credentials
```

Or follow: **[AWS_INFRASTRUCTURE_SETUP.md](./AWS_INFRASTRUCTURE_SETUP.md)** → "EC2 Server Setup"

**Output:** EC2 fully configured and ready ✓

---

### **Phase 4: First Deployment (10 minutes)**

Push code to trigger GitHub Actions:

```bash
# Make a small change
echo "# Production deployment" >> README.md

# Push to main
git add README.md
git commit -m "Trigger: First production deployment"
git push origin main

# Watch deployment
# GitHub → Actions tab → Monitor workflow
```

**Output:** Applications deployed to production! 🎉

---

## 📊 Deployment Architecture

```
Your Hostinger Domain: jnvspectra.com
        ↓
AWS Route 53 (DNS)
        ↓
    ┌───┴───┬───────────┬──────────┐
    ↓       ↓           ↓          ↓
Admin   Website    Checkout     Backend
Portal              App          API
  ↓        ↓           ↓          ↓
CloudFront (CDN) ← → S3    →    EC2
                              (Docker)
                                  ↓
                            AWS RDS
                        (PostgreSQL)
                                  +
                            AWS S3
                        (File Storage)
```

---

## 📁 Documentation Files

| File | Purpose | Action |
|------|---------|--------|
| **AWS_INFRASTRUCTURE_SETUP.md** | Step-by-step AWS setup | 👉 Start here |
| **GITHUB_SECRETS_GUIDE.md** | How to add GitHub Secrets | After AWS setup |
| **DEPLOYMENT_GUIDE.md** | Complete deployment workflow | Reference as needed |
| **setup-ec2.sh** | Automated EC2 setup script | Run on EC2 |
| **PRODUCTION_DEPLOYMENT_CHECKLIST.md** | Comprehensive checklist | Track progress |
| **ENVIRONMENT_SETUP.md** | Environment variables | Reference |

---

## 🔑 What You'll Need

### **1. AWS Account**
- Already have? ✓
- Need one? Go to https://aws.amazon.com → Create Account

### **2. Hostinger Domain**
- Already have? ✓
- Need one? Go to https://hostinger.com or similar

### **3. GitHub Repository**
- Already have code pushed? ✓

### **4. Local Tools**
- SSH client (comes with Mac/Linux, git bash on Windows)
- Text editor (VS Code, Nano, etc.)
- AWS CLI (optional but helpful)

---

## 📚 Quick Reference

### **Deployment URLs (After Completion)**

```
API:      https://api.jnvspectra.com
Admin:    https://admin.jnvspectra.com
Website:  https://www.jnvspectra.com
Checkout: https://checkout.jnvspectra.com
```

### **AWS Services Used**

| Service | Purpose | Cost |
|---------|---------|------|
| EC2 | Backend API server | ~$30-40/mo |
| RDS | PostgreSQL database | ~$30-50/mo |
| S3 | Frontend hosting + file storage | ~$5-10/mo |
| CloudFront | CDN for global distribution | ~$30-100/mo |
| Route 53 | DNS management | ~$1/mo |
| Certificate Manager | SSL/TLS certificates | Free |
| **Total** | **Full production stack** | **~$100-200/mo** |

---

## ⚡ Quick Troubleshooting

### **"I don't know where to start"**
→ Open **AWS_INFRASTRUCTURE_SETUP.md** and follow step-by-step

### **"I got an AWS error"**
→ See troubleshooting section in relevant markdown file

### **"Deployment failed"**
→ Check GitHub Actions logs → Look in DEPLOYMENT_GUIDE.md troubleshooting

### **"Domain not working"**
→ Check DNS propagation: `nslookup jnvspectra.com`

---

## 🔒 Security Reminders

⚠️ **NEVER do these:**
- ❌ Commit AWS credentials to git
- ❌ Share secret keys or credentials
- ❌ Post secrets in Slack/email
- ❌ Use root AWS account credentials
- ❌ Leave SSH keys unprotected

✅ **DO these:**
- ✅ Keep credentials in GitHub Secrets only
- ✅ Rotate keys every 90 days
- ✅ Use IAM users for service automation
- ✅ Enable MFA on AWS root account
- ✅ Review CloudTrail logs regularly

---

## 📞 Need Help?

### **1. Check the Documentation**
All common issues are documented in:
- AWS_INFRASTRUCTURE_SETUP.md → Troubleshooting
- DEPLOYMENT_GUIDE.md → Troubleshooting
- GITHUB_SECRETS_GUIDE.md → Troubleshooting

### **2. Review GitHub Actions Logs**
- GitHub → Actions tab → Failed workflow
- Click job → Look for error messages

### **3. SSH to EC2 and Check Logs**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
docker logs jnv-backend
docker-compose logs app
```

### **4. Common Commands**

```bash
# Test DNS
nslookup jnvspectra.com
dig api.jnvspectra.com

# Test HTTP endpoints
curl https://api.jnvspectra.com/api/v1/health
curl -I https://admin.jnvspectra.com

# SSH to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# View Docker logs
docker logs container-id
docker-compose logs -f

# Check AWS credentials
aws iam get-user
aws s3 ls
```

---

## 🎯 Success Criteria

You'll know everything is working when:

✅ EC2 instance is running and accessible via SSH  
✅ All GitHub Secrets are configured (12 total)  
✅ First deployment completes in GitHub Actions  
✅ Backend API responds: `https://api.jnvspectra.com/api/v1/health`  
✅ Admin portal loads: `https://admin.jnvspectra.com`  
✅ Website loads: `https://www.jnvspectra.com`  
✅ Checkout app loads: `https://checkout.jnvspectra.com`  
✅ HTTPS shows padlock in browser  
✅ Database contains data from migrations  
✅ File uploads go to S3  

---

## 🚀 Deployment Timeline

```
Day 1: AWS Infrastructure Setup (2-3 hours)
  └─ EC2, S3, CloudFront, Route 53, ACM

Day 1: GitHub Secrets Configuration (30 min)
  └─ Add 12 secrets from AWS

Day 1: EC2 Server Setup (15 min)
  └─ Run setup script, configure .env

Day 1: First Deployment (15 min)
  └─ Push code, watch GitHub Actions

Day 1: Verification (15 min)
  └─ Test all URLs, verify functionality

TOTAL: ~4-5 hours to go live! 🎉
```

---

## 📊 What Gets Deployed Automatically

Every time you push to `main` branch:

**Frontend (Automatic):**
- Admin portal → admin.jnvspectra.com
- Website → www.jnvspectra.com
- Checkout app → checkout.jnvspectra.com

**Backend (Automatic):**
- Docker image built
- Pushed to AWS ECR
- Deployed to EC2
- Running with updated code

**Every deployment includes:**
- Code quality checks
- Security scanning
- Secrets verification
- Build tests
- Automated deployment

---

## 🎉 That's It!

You have everything you need to deploy your JNV Spectra application to production!

### **Start Now:**

1. **Open:** AWS_INFRASTRUCTURE_SETUP.md
2. **Follow:** Each step in order
3. **Ask:** Check troubleshooting if stuck
4. **Deploy:** Push code to main when ready

---

**You've got this! Let's go live! 🚀**

Questions? Review the documentation files. They contain everything you need.

Good luck! 🌟

