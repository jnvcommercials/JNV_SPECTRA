# 🔐 GitHub Secrets Configuration Guide

## 📋 Overview

GitHub Secrets are encrypted environment variables used by GitHub Actions workflows. They're used to securely pass AWS credentials, domain names, and other sensitive data without storing them in the repository.

---

## ✅ How to Add GitHub Secrets

### Step 1: Navigate to Secrets Settings

1. Go to your GitHub repository: https://github.com/jnvcommercials/JNV_SPECTRA
2. Click **Settings** tab
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Add Each Secret

For each secret below, follow this process:
1. Enter the secret **Name** (exactly as shown)
2. Paste the **Value** from the sources below
3. Click **Add secret**

---

## 🔑 Required GitHub Secrets

### **Group 1: AWS Credentials** (For both frontend and backend deployment)

#### `AWS_ACCESS_KEY_ID`
**Where to get it:**
1. AWS Console → IAM → Users → github-actions-deploy
2. Security credentials tab
3. Create access key → Copy "Access Key ID"

**Format:** Text like `AKIA2HQZXXXXXXXXXXXX`

**Copy from:** AWS access key

---

#### `AWS_SECRET_ACCESS_KEY`
**Where to get it:**
1. Same as above, save when creating access key
2. Shows only once! Save it securely
3. If lost, create new access key

**Format:** Long text string with special characters

**⚠️ WARNING:** This is extremely sensitive - never share or commit to git!

**Copy from:** AWS secret access key (shown only during creation)

---

### **Group 2: Backend Deployment** (EC2 + Docker)

#### `EC2_HOST`
**What it is:** Your EC2 server's hostname for SSH deployment

**Where to get it:**
1. AWS Console → EC2 → Instances
2. Find instance `jnv-backend-server`
3. Copy either:
   - **Public IPv4 DNS:** `ec2-123-45-67-89.compute-1.amazonaws.com` (preferred)
   - **Public IPv4 address:** `123.45.67.89` (dynamic, can change)

**Format:** `ec2-123-45-67-89.compute-1.amazonaws.com` or IP address

**Example:** `ec2-3-86-52-108.compute-1.amazonaws.com`

---

#### `EC2_USER`
**What it is:** SSH username for your EC2 instance

**Value based on AMI:**
- Ubuntu 22.04 LTS: `ubuntu` (recommended)
- Amazon Linux 2: `ec2-user`
- Debian: `admin`
- RedHat: `ec2-user`

**Format:** `ubuntu`

---

#### `EC2_SSH_KEY`
**What it is:** Private SSH key content for EC2 access

**Where to get it:**
1. Your local machine where you saved `jnv-backend-key.pem`
2. Open file in text editor

**How to copy:**
```bash
# On Mac/Linux
cat jnv-backend-key.pem | pbcopy

# On Windows PowerShell
Get-Content jnv-backend-key.pem | Set-Clipboard

# On Windows (Git Bash)
cat jnv-backend-key.pem | clip
```

**Format:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA2xxxxxxxxxxx...
... (middle lines) ...
... (KEY CONTENT)...
-----END RSA PRIVATE KEY-----
```

**⚠️ IMPORTANT:** Include the entire content with BEGIN and END lines

---

### **Group 3: Frontend Deployment - S3 Bucket Names**

#### `S3_BUCKET_ADMIN`
**What it is:** S3 bucket name for admin portal

**Format:** `jnv-spectra-admin`

**Where created:** AWS Console → S3

---

#### `S3_BUCKET_WEBSITE`
**What it is:** S3 bucket name for main website

**Format:** `jnv-spectra-website`

**Where created:** AWS Console → S3

---

#### `S3_BUCKET_CHECKOUT`
**What it is:** S3 bucket name for checkout app

**Format:** `jnv-spectra-checkout`

**Where created:** AWS Console → S3

---

### **Group 4: Frontend Deployment - CloudFront Distribution IDs**

#### `CLOUDFRONT_DISTRIBUTION_ADMIN`
**What it is:** CloudFront distribution ID for admin portal

**Where to get it:**
1. AWS Console → CloudFront → Distributions
2. Click distribution for `admin.jnvspectra.com`
3. Copy the **Distribution ID** (starts with `E`)

**Format:** `E3JSTWY7ASXYYYYYYY`

---

#### `CLOUDFRONT_DISTRIBUTION_WEBSITE`
**What it is:** CloudFront distribution ID for main website

**Where to get it:**
1. AWS Console → CloudFront → Distributions
2. Click distribution for `www.jnvspectra.com`
3. Copy the **Distribution ID**

**Format:** `E1A2B3C4D5EEEEEEE`

---

#### `CLOUDFRONT_DISTRIBUTION_CHECKOUT`
**What it is:** CloudFront distribution ID for checkout app

**Where to get it:**
1. AWS Console → CloudFront → Distributions
2. Click distribution for `checkout.jnvspectra.com`
3. Copy the **Distribution ID**

**Format:** `EXAMPLEDISTID123`

---

## 📝 Quick Copy Template

Use this as a checklist when adding secrets:

```
AWS Credentials:
☐ AWS_ACCESS_KEY_ID: [from IAM user]
☐ AWS_SECRET_ACCESS_KEY: [from IAM user - show secret]

EC2 Deployment:
☐ EC2_HOST: [Public IPv4 DNS from EC2 instance]
☐ EC2_USER: ubuntu
☐ EC2_SSH_KEY: [content of jnv-backend-key.pem file]

S3 Buckets:
☐ S3_BUCKET_ADMIN: jnv-spectra-admin
☐ S3_BUCKET_WEBSITE: jnv-spectra-website
☐ S3_BUCKET_CHECKOUT: jnv-spectra-checkout

CloudFront Distributions:
☐ CLOUDFRONT_DISTRIBUTION_ADMIN: [Distribution ID for admin]
☐ CLOUDFRONT_DISTRIBUTION_WEBSITE: [Distribution ID for website]
☐ CLOUDFRONT_DISTRIBUTION_CHECKOUT: [Distribution ID for checkout]
```

---

## 🔍 Verify Secrets Are Added Correctly

### Check Secrets in GitHub UI

1. **GitHub → Repository → Settings → Secrets and variables → Actions**
2. You should see all secrets with a green ✓ icon
3. Click on each to edit/update

### Test Secrets in GitHub Actions

After adding secrets, they'll automatically be used in workflows:

1. **GitHub → Actions tab**
2. Select any workflow
3. Push a test commit to trigger workflow
4. Watch logs to verify secrets are being used

**If workflow fails:**
- Check GitHub Actions logs for error messages
- Verify secret names match exactly (case-sensitive)
- Ensure secret values are complete
- Re-check AWS credentials are valid

---

## 🔐 Security Best Practices

### ✅ DO:
- ✅ Rotate AWS access keys every 90 days
- ✅ Keep EC2 SSH key in secure location
- ✅ Use different keys for different environments
- ✅ Enable MFA on AWS root account
- ✅ Review GitHub Actions logs for security
- ✅ Limit IAM user permissions to minimum needed

### ❌ DON'T:
- ❌ Ever commit any secrets to git
- ❌ Share secret values in Slack/email
- ❌ Hardcode values in configuration files
- ❌ Use root AWS account credentials
- ❌ Post secrets in GitHub issues/comments
- ❌ Leave SSH keys in shared locations

---

## 🚨 If Secrets Are Compromised

### Immediate Actions:

1. **AWS Access Keys:**
   ```bash
   # Disable compromised key immediately
   aws iam list-access-keys --user-name github-actions-deploy
   aws iam delete-access-key --user-name github-actions-deploy --access-key-id AKIA...
   
   # Create new access key
   # Update GitHub Secrets with new credentials
   ```

2. **EC2 SSH Key:**
   ```bash
   # Create new EC2 key pair
   # Update GitHub Secrets with new private key
   # Optionally rotate EC2 authorized_keys file
   ```

3. **GitHub Secrets:**
   ```bash
   # Remove compromised secret from GitHub
   # Push code through Git (GitHub will re-scan)
   # Create new credentials in AWS
   # Add new values to GitHub Secrets
   ```

---

## ✅ Verification Checklist

Before your first deployment:

- [ ] All 12 GitHub Secrets added
- [ ] Secret names match exactly (case-sensitive)
- [ ] All secret values are complete (no truncation)
- [ ] AWS access keys are valid
- [ ] EC2 SSH key is complete (includes BEGIN/END lines)
- [ ] S3 bucket names match created buckets
- [ ] CloudFront Distribution IDs are correct
- [ ] EC2_HOST is accessible (DNS or IP)
- [ ] Test workflow run succeeds without secret errors
- [ ] Secrets are never logged in GitHub Actions output

---

## 🎯 Next Steps

After adding all GitHub Secrets:

1. **Follow AWS Infrastructure Setup** - AWS_INFRASTRUCTURE_SETUP.md
2. **Follow Deployment Guide** - DEPLOYMENT_GUIDE.md
3. **Trigger first deployment** - Push to main branch
4. **Monitor in GitHub Actions** - Watch workflow execution
5. **Verify production deployment** - Test all URLs

---

## 📞 Troubleshooting

### Secrets not working in workflow?

**Check 1: Secret name case sensitivity**
```bash
# WRONG: aws_access_key_id
# RIGHT: AWS_ACCESS_KEY_ID
```

**Check 2: Repository secrets vs organization secrets**
- Use **Repository secrets** (Settings → Secrets)
- Not organization secrets (unless shared across repos)

**Check 3: Workflow has access to secrets**
- Only workflows in the repo can use repo secrets
- Forks cannot access private repo secrets

**Check 4: Verify in GitHub Actions logs**
```bash
# Workflow will show if secret was loaded correctly
# Look for: "Successfully loaded secret: AWS_ACCESS_KEY_ID"
```

### AWS credentials not working?

```bash
# Test credentials locally first
aws configure --profile github-actions
aws s3 ls

# If fails:
# 1. Check Access Key ID and Secret Access Key match AWS console
# 2. Verify IAM user has correct permissions
# 3. Check if access key is active (not disabled)
```

---

**✅ GitHub Secrets configured! Ready for deployment!** 🚀

