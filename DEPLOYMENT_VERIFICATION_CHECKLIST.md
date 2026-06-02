# ✅ Production Deployment Verification Checklist

Use this checklist to verify everything is configured before deploying to production.

---

## 🔐 Step 1: Verify GitHub Secrets

Navigate to: **GitHub → Settings → Secrets and variables → Actions**

### AWS Credentials
- [ ] `AWS_ACCESS_KEY_ID` exists
  - Get from: AWS Console → IAM → Users → Select user → Security credentials → Access keys
  - Format: `AKIA` + 16 characters
  - ❌ Missing? Create new access key in IAM

- [ ] `AWS_SECRET_ACCESS_KEY` exists
  - Get from: Same location as above (shown only once when created)
  - ⚠️ If lost, create a new access key
  - Never commit to git!
  - ❌ Missing? Create new access key in IAM

- [ ] `AWS_REGION` exists
  - Value: `us-east-1`
  - ❌ Missing? Add this secret

### Backend Deployment (EC2 + Docker)
- [ ] `AWS_ECR_REPOSITORY` exists
  - Value: `jnv-spectra-backend`
  - What it is: AWS Elastic Container Registry repository name
  - ❌ Missing? Create ECR repository in AWS, then add secret

- [ ] `EC2_HOST` exists
  - Get from: AWS Console → EC2 → Instances → Copy "Public IPv4 DNS"
  - Format: `ec2-123-45-67-89.compute-1.amazonaws.com`
  - Example: `ec2-3-86-52-108.compute-1.amazonaws.com`
  - ❌ Missing? Go to AWS, get your EC2 host, add secret

- [ ] `EC2_USER` exists
  - Value: `ubuntu` (if using Ubuntu 22.04 LTS)
  - Or: `ec2-user` (if using Amazon Linux 2)
  - ❌ Missing? Add this secret based on your AMI

- [ ] `EC2_SSH_KEY` exists
  - Content: Entire private key from your `.pem` file
  - Get from: Your `jnv-backend-key.pem` file
  - Format: Include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
  - How to copy:
    ```bash
    # Windows PowerShell
    Get-Content "C:\path\to\jnv-backend-key.pem" | Set-Clipboard
    
    # Then paste into GitHub secret
    ```
  - ❌ Missing? Copy entire .pem file content and add secret

### Frontend Deployment (S3 + CloudFront)
- [ ] `S3_BUCKET_ADMIN` exists
  - Value: `jnv-spectra-admin`
  - What it is: S3 bucket name for admin portal
  - ❌ Missing? Create S3 bucket, then add secret

- [ ] `S3_BUCKET_WEBSITE` exists
  - Value: `jnv-spectra-website`
  - What it is: S3 bucket name for website
  - ❌ Missing? Create S3 bucket, then add secret

- [ ] `S3_BUCKET_CHECKOUT` exists
  - Value: `jnv-spectra-checkout`
  - What it is: S3 bucket name for checkout app
  - ❌ Missing? Create S3 bucket, then add secret

### CloudFront Distribution IDs
- [ ] `CLOUDFRONT_ADMIN_DISTRIBUTION_ID` exists
  - Get from: AWS Console → CloudFront → Select admin distribution → Distribution ID
  - Format: About 13 characters, e.g., `E1A2B3C4D5E6F`
  - ❌ Missing? Go to CloudFront, copy distribution ID, add secret

- [ ] `CLOUDFRONT_WEBSITE_DISTRIBUTION_ID` exists
  - Get from: AWS Console → CloudFront → Select website distribution → Distribution ID
  - ❌ Missing? Go to CloudFront, copy distribution ID, add secret

- [ ] `CLOUDFRONT_CHECKOUT_DISTRIBUTION_ID` exists
  - Get from: AWS Console → CloudFront → Select checkout distribution → Distribution ID
  - ❌ Missing? Go to CloudFront, copy distribution ID, add secret

---

## 🏗️ Step 2: Verify AWS Infrastructure

### EC2 Instance
- [ ] EC2 instance created and running
  - Status should be "Running" (green)
  - Name: `jnv-backend-server` (or similar)
  - AMI: Ubuntu 22.04 LTS
  - SSH key pair: `jnv-backend-key.pem`
  - Security group allows port 3000 (for backend)
  - ❌ Not created? Create EC2 instance with Ubuntu 22.04 LTS

- [ ] EC2 security group configured
  - Inbound rules:
    - [ ] Port 22 (SSH) - from your IP or 0.0.0.0/0
    - [ ] Port 3000 (Backend) - from 0.0.0.0/0
    - [ ] Port 80 (HTTP) - optional, from 0.0.0.0/0
    - [ ] Port 443 (HTTPS) - optional, from 0.0.0.0/0
  - ❌ Not configured? Update security group rules

- [ ] Docker installed on EC2
  - SSH to instance and verify:
    ```bash
    docker --version
    docker ps
    ```
  - ❌ Not installed? Run `setup-ec2.sh` on instance

### S3 Buckets
- [ ] `jnv-spectra-admin` bucket exists
  - Policy: Public read access or CloudFront OAI
  - Versioning: Enabled (optional)
  - ❌ Not created? Create S3 bucket in AWS

- [ ] `jnv-spectra-website` bucket exists
  - Policy: Public read access or CloudFront OAI
  - ❌ Not created? Create S3 bucket in AWS

- [ ] `jnv-spectra-checkout` bucket exists
  - Policy: Public read access or CloudFront OAI
  - ❌ Not created? Create S3 bucket in AWS

- [ ] `jnv-images` bucket exists (for file uploads)
  - CORS enabled (if needed)
  - ❌ Not created? Create S3 bucket in AWS

### CloudFront Distributions
- [ ] CloudFront distribution for admin portal
  - Origin: S3 bucket `jnv-spectra-admin`
  - Default cache behavior configured
  - ❌ Not created? Create CloudFront distribution

- [ ] CloudFront distribution for website
  - Origin: S3 bucket `jnv-spectra-website`
  - ❌ Not created? Create CloudFront distribution

- [ ] CloudFront distribution for checkout
  - Origin: S3 bucket `jnv-spectra-checkout`
  - ❌ Not created? Create CloudFront distribution

### RDS Database
- [ ] PostgreSQL database running
  - Endpoint: `jnvspectra.cqzcueeo8qb6.us-east-1.rds.amazonaws.com:5432`
  - Database name: `jnvspectra`
  - User: `postgres`
  - Password: Securely stored
  - ❌ Not created? Create RDS PostgreSQL instance

### Route53 (DNS)
- [ ] Hosted zone created
  - Domain: `jnvspectra.com`
  - ❌ Not created? Create hosted zone in Route53

- [ ] A records configured
  - [ ] Admin: `admin.jnvspectra.com` → CloudFront distribution
  - [ ] Website: `jnvspectra.com` → CloudFront distribution
  - [ ] Checkout: `checkout.jnvspectra.com` → CloudFront distribution
  - [ ] Backend: `api.jnvspectra.com` → EC2 elastic IP/domain
  - ❌ Not configured? Add A records in Route53

### Hostinger Domain (DNS)
- [ ] Domain nameservers updated to point to Route53
  - Hostinger → Domain Management → Nameservers
  - Change to Route53 nameservers
  - ❌ Not updated? Contact Hostinger support or update nameservers

---

## 📁 Step 3: Verify Local Code

- [ ] All code committed to GitHub
  ```bash
  cd C:\Users\jnvsp\JNV_SPECTRA
  git status  # Should show "nothing to commit"
  ```
  - ❌ Uncommitted changes? Run: `git add . && git commit -m "message"`

- [ ] No secrets in code
  ```bash
  # Check for passwords, keys, tokens
  git log --all -S "password" -S "secret" -S "AKIA"
  # Should return nothing
  ```
  - ❌ Secrets found? Remove from git history

- [ ] `.env` file NOT in git
  ```bash
  git ls-files | grep -i ".env"
  # Should return nothing
  ```
  - ❌ .env in git? Remove it with: `git rm --cached .env`

- [ ] Environment files configured locally
  - [ ] `event_management_backend_final/.env` exists (but not in git)
  - [ ] `event_management_admin/.env` or `.env.production` configured
  - [ ] `jnv_spectra_website/.env` or `.env.production` configured
  - [ ] `jnv-checkout-app/.env` or `.env.production` configured

---

## 🚀 Step 4: Ready to Deploy?

If you've checked all items above:

```bash
# Make sure you're on main branch
git checkout main

# Make your code changes...

# Commit and push
git add .
git commit -m "Production update: description of changes"
git push origin main
```

**Then:**
1. Go to GitHub Actions tab
2. Watch the deployment workflow run
3. Wait for all jobs to complete (5-10 minutes)
4. Check production URLs

---

## 📋 Items Completed ✅
- [x] GitHub repository created
- [x] Code consolidated into monorepo
- [x] CI/CD workflows created (deploy-backend.yml, deploy-frontend.yml)
- [x] .gitignore updated
- [x] Vite config for Windows compatibility

## 📋 Items Still Needed ⚠️
- [ ] All GitHub Secrets configured (see Step 1)
- [ ] AWS infrastructure created (see Step 2)
- [ ] EC2 security groups configured
- [ ] Docker installed on EC2
- [ ] S3 buckets created and configured
- [ ] CloudFront distributions created
- [ ] RDS database configured
- [ ] Route53 hosted zone created and DNS records added
- [ ] Hostinger nameservers updated to Route53

---

## 🆘 Need Help?

See detailed guides:
- **GitHub Secrets:** [GITHUB_SECRETS_GUIDE.md](./GITHUB_SECRETS_GUIDE.md)
- **AWS Setup:** [AWS_INFRASTRUCTURE_SETUP.md](./AWS_INFRASTRUCTURE_SETUP.md)
- **Full Deployment:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Production Quick Start:** [PRODUCTION_DEPLOYMENT_QUICK.md](./PRODUCTION_DEPLOYMENT_QUICK.md)

---

## ✨ Success = All Items Checked!

When all items are checked, your production deployment is ready. Just push to main and watch GitHub Actions do the rest! 🎉

