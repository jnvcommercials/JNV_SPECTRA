# 🚀 Production Deployment Guide - Quick Start

## Your Setup
- **Frontend Hosting:** AWS S3 + CloudFront (3 apps: Admin, Website, Checkout)
- **Backend Hosting:** AWS EC2 (Docker container)
- **Domain:** Hostinger (pointing to AWS Route53)
- **Database:** AWS RDS PostgreSQL
- **File Storage:** AWS S3 (jnv-images bucket)
- **CI/CD:** GitHub Actions (automated on push to main)

---

## ⚡ Fastest Deployment Method (Recommended)

### Option 1: Automatic CI/CD Deployment (Easiest)

**Just push your code to GitHub main branch!**

```bash
cd /c/Users/jnvsp/JNV_SPECTRA

# Make your changes to any files...

# Commit changes
git add .
git commit -m "Your commit message"

# Push to main (triggers automatic deployment)
git push origin main
```

**That's it!** GitHub Actions will automatically:
1. ✅ Run tests and security scans
2. ✅ Build Docker image for backend
3. ✅ Push to AWS ECR (container registry)
4. ✅ Deploy to EC2 instance
5. ✅ Build and deploy 3 frontend apps to S3
6. ✅ Invalidate CloudFront caches

**Total time:** 5-10 minutes

**Monitor deployment:** Go to GitHub → Actions tab → View live logs

---

## 📋 Prerequisites for CI/CD Deployment

Before pushing, ensure you have configured all GitHub Secrets:

### Step 1: Verify GitHub Secrets are Set

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

**Required Secrets:**
- [ ] `AWS_ACCESS_KEY_ID` - Your AWS access key
- [ ] `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- [ ] `AWS_REGION` - us-east-1
- [ ] `AWS_ECR_REPOSITORY` - jnv-spectra-backend
- [ ] `EC2_HOST` - Your EC2 public DNS
- [ ] `EC2_USER` - ubuntu
- [ ] `EC2_SSH_KEY` - Your EC2 .pem key file content
- [ ] `S3_BUCKET_ADMIN` - jnv-spectra-admin
- [ ] `S3_BUCKET_WEBSITE` - jnv-spectra-website
- [ ] `S3_BUCKET_CHECKOUT` - jnv-spectra-checkout
- [ ] `CLOUDFRONT_ADMIN_DISTRIBUTION_ID` - Your CloudFront distribution ID
- [ ] `CLOUDFRONT_WEBSITE_DISTRIBUTION_ID` - Your CloudFront distribution ID
- [ ] `CLOUDFRONT_CHECKOUT_DISTRIBUTION_ID` - Your CloudFront distribution ID

**Missing secrets?** See [GITHUB_SECRETS_GUIDE.md](./GITHUB_SECRETS_GUIDE.md)

---

## 🔍 Verify Deployment Status

### Check GitHub Actions Workflow

1. Go to: **GitHub → Actions tab**
2. Click the latest workflow run
3. View real-time logs for:
   - Backend build & deploy
   - Frontend build & deploy
4. Look for green checkmarks ✅

### Check Backend Deployment

```bash
# SSH into EC2 and verify backend is running
ssh -i "your-key.pem" ubuntu@your-ec2-host

# Check Docker container
docker ps

# View backend logs
docker logs jnv-spectra-backend

# Test backend endpoint
curl http://localhost:3000/health
```

### Check Frontend Deployment

1. **Admin Portal:** https://jnvspectra.com/admin (or CloudFront URL)
2. **Website:** https://jnvspectra.com (or CloudFront URL)
3. **Checkout:** https://jnvspectra.com/checkout (or CloudFront URL)

If not accessible, check:
- CloudFront distribution status
- S3 bucket policies
- Route53 DNS records
- Hostinger domain configuration

---

## 🔧 Manual Deployment (If Needed)

### Backend Manual Deployment

```bash
# 1. Build Docker image
docker build -t jnv-spectra-backend:latest .

# 2. Tag for ECR
docker tag jnv-spectra-backend:latest AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jnv-spectra-backend:latest

# 3. Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# 4. Push to ECR
docker push AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jnv-spectra-backend:latest

# 5. SSH to EC2 and pull/restart
ssh -i "your-key.pem" ubuntu@your-ec2-host
docker pull AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jnv-spectra-backend:latest
docker stop jnv-spectra-backend || true
docker run -d --name jnv-spectra-backend --restart always -p 3000:3000 \
  -e DB_HOST=$DB_HOST \
  -e DB_PORT=$DB_PORT \
  -e DB_NAME=$DB_NAME \
  -e DB_USER=$DB_USER \
  -e DB_PASSWORD=$DB_PASSWORD \
  -e AWS_REGION=us-east-1 \
  -e AWS_S3_BUCKET=jnv-images \
  AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jnv-spectra-backend:latest
```

### Frontend Manual Deployment

```bash
# 1. Build admin portal
cd event_management_admin
npm run build
aws s3 sync dist/ s3://jnv-spectra-admin --delete

# 2. Build website
cd ../jnv_spectra_website
npm run build
aws s3 sync dist/ s3://jnv-spectra-website --delete

# 3. Build checkout
cd ../jnv-checkout-app
npm run build
aws s3 sync dist/ s3://jnv-spectra-checkout --delete

# 4. Invalidate CloudFront caches
aws cloudfront create-invalidation --distribution-id ADMIN_DISTRIBUTION_ID --paths "/*"
aws cloudfront create-invalidation --distribution-id WEBSITE_DISTRIBUTION_ID --paths "/*"
aws cloudfront create-invalidation --distribution-id CHECKOUT_DISTRIBUTION_ID --paths "/*"
```

---

## 📊 Deployment Workflow Diagram

```
Your Code Changes
       ↓
git push origin main
       ↓
GitHub Actions Triggered
       ├─ Backend Workflow
       │  ├─ Run tests
       │  ├─ Build Docker image
       │  ├─ Push to ECR
       │  └─ Deploy to EC2
       │
       └─ Frontend Workflow
          ├─ Run tests
          ├─ Build Admin Portal
          ├─ Build Website
          ├─ Build Checkout App
          ├─ Upload to S3 buckets
          └─ Invalidate CloudFront
       ↓
Production Live! ✅
```

---

## ⚠️ Troubleshooting Deployment Issues

### Backend Deployment Failed

**Check logs:**
```bash
# View GitHub Actions logs
# GitHub → Actions → Failed workflow → Click job → View logs

# Or SSH to EC2 and check:
docker logs jnv-spectra-backend
docker ps -a  # Show all containers
```

**Common issues:**
- ECR credentials expired → Regenerate AWS credentials
- EC2 SSH failed → Check EC2_SSH_KEY secret is correct
- Docker build failed → Check Dockerfile syntax

### Frontend Not Updating

**Check:**
1. CloudFront cache invalidation succeeded
2. S3 bucket has new files: `aws s3 ls s3://jnv-spectra-admin`
3. Try hard refresh: `Ctrl+Shift+R` (not just F5)
4. Check CloudFront distribution status

**Force invalidation:**
```bash
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

### Domain Not Working

**Verify DNS settings:**
1. Hostinger → Domain Management
2. Confirm nameservers point to AWS Route53
3. Route53 → Hosted Zone → Verify A records point to CloudFront

**Test DNS:**
```bash
nslookup jnvspectra.com      # Verify DNS resolution
```

---

## 🚀 Deployment Checklist

Before each production push:

- [ ] All code tested locally on localhost
- [ ] No secrets in code (run: `git log --all -S "password" -S "secret"`)
- [ ] `.env` file NOT committed
- [ ] GitHub Secrets are up to date
- [ ] No merge conflicts
- [ ] Code review completed
- [ ] Ready for production?

**When ready:**
```bash
git push origin main
# Then monitor GitHub Actions
```

---

## 📞 Need Help?

**Check logs at:**
1. **GitHub Actions:** https://github.com/jnvcommercials/JNV_SPECTRA/actions
2. **CloudFront:** AWS Console → CloudFront → Monitoring
3. **EC2:** AWS Console → EC2 → Instances → Select instance → View logs
4. **S3:** AWS Console → S3 → Buckets → Check last modified times

---

## ✅ Success Indicators

Deployment is successful when:
- ✅ GitHub Actions workflow shows green checkmarks
- ✅ Backend responds to API calls
- ✅ Admin portal loads at production URL
- ✅ Website loads at production URL
- ✅ Checkout app loads at production URL
- ✅ CloudFront shows no errors
- ✅ No 404 errors in browser console

---

## 🎉 You're Done!

Your changes are now live in production! 

**Next steps:**
- Monitor application performance
- Check users are accessing correctly
- Watch server logs for errors
- Plan next update

Happy deploying! 🚀

