# 🏗️ AWS Infrastructure Setup Guide - JNV Spectra

## 📋 Table of Contents
1. [Pre-requisites](#pre-requisites)
2. [AWS Account Setup](#aws-account-setup)
3. [EC2 Backend Server](#ec2-backend-server)
4. [S3 + CloudFront Setup](#s3--cloudfront-setup)
5. [Route 53 DNS Configuration](#route-53-dns-configuration)
6. [SSL/TLS Certificates](#ssltls-certificates)
7. [IAM User Setup](#iam-user-setup)
8. [Cost Optimization](#cost-optimization)

---

## 📦 Pre-requisites

- AWS Account (free tier eligible)
- Hostinger domain (jnvspectra.com)
- Git repository with code pushed to GitHub
- AWS CLI installed on your local machine
- SSH key pair for EC2 access

---

## 🔑 AWS Account Setup

### 1. Create AWS Account

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Fill in account details
4. Enable billing alerts: **Billing → Budgets → Create budget**

### 2. Enable Services (Optional)

Most services are enabled by default, but verify:
- **EC2** (Elastic Compute Cloud)
- **S3** (Simple Storage Service)
- **RDS** (Relational Database Service) - Already configured
- **CloudFront** (Content Delivery Network)
- **Route 53** (Domain Name System)
- **Certificate Manager** (ACM)
- **IAM** (Identity and Access Management)

### 3. Set Up Billing Alerts

```
AWS Console → Billing → Preferences → Enable billing alerts
AWS Console → Billing → Budgets → Create budget (set to $100/month)
```

---

## 🖥️ EC2 Backend Server Setup

### Step 1: Launch EC2 Instance

**In AWS Console → EC2 Dashboard:**

1. Click **"Launch Instance"**
2. **Name and tags:**
   - Name: `jnv-backend-server`
   - (Optional) Add tags: `Environment: production`, `Project: jnv-spectra`

3. **Application and OS Images:**
   - Search: `ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server`
   - Click Select

4. **Instance Type:**
   - Select `t3.medium` (recommended for production)
   - Or `t3.small` if cost is concern (less powerful)
   - **Free tier:** t2.micro (1GB RAM - not recommended for production)

5. **Key Pair:**
   - Click "Create new key pair"
   - Name: `jnv-backend-key`
   - Type: RSA
   - Format: .pem (for Mac/Linux) or .ppk (for PuTTY)
   - Download and save securely

6. **Network Settings:**
   - VPC: Use default VPC
   - Subnet: Any availability zone
   - Auto-assign public IP: **Enable**

7. **Security Group:**
   - Click "Create security group"
   - Name: `jnv-backend-sg`
   - Description: "Security group for JNV Spectra backend"
   
   **Add these inbound rules:**
   
   | Type | Protocol | Port | Source | Purpose |
   |------|----------|------|--------|---------|
   | SSH | TCP | 22 | Your IP/0.0.0.0 | SSH access |
   | HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
   | HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |
   | Custom TCP | TCP | 3000 | 0.0.0.0/0 | Backend API |
   
   **Outbound rules (default):**
   - Allow all traffic (0.0.0.0/0)

8. **Storage Configuration:**
   - Size: 30 GB
   - Type: gp3 (General Purpose SSD)
   - Encrypted: Yes
   - Delete on termination: Yes

9. **Advanced Details:**
   - IAM instance profile: Create if needed (or use existing)
   - Monitoring: Enable detailed CloudWatch monitoring
   - Termination protection: Disable (for now)

10. **Review and Launch:**
    - Review all settings
    - Click "Launch Instance"

### Step 2: Allocate Elastic IP

Static public IP for consistent access:

```bash
# In AWS Console → EC2 → Elastic IPs
# Click "Allocate Elastic IP address"
# Select the EC2 instance you just created
# Associate it
```

### Step 3: Connect to EC2

```bash
# Change key permissions
chmod 400 jnv-backend-key.pem

# SSH into instance (replace IP with your instance IP)
ssh -i jnv-backend-key.pem ubuntu@your-instance-ip

# Or using Elastic IP (if allocated)
ssh -i jnv-backend-key.pem ubuntu@your-elastic-ip
```

### Step 4: Initial Server Setup

Once connected to EC2:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y docker.io git curl wget htop net-tools

# Add Ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker installation
docker --version

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify Docker Compose
docker-compose --version

# Exit and reconnect for docker group changes to take effect
exit
ssh -i jnv-backend-key.pem ubuntu@your-instance-ip
```

---

## 🗂️ S3 + CloudFront Setup

### Create S3 Buckets for Frontend Apps

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
```

### Enable Static Website Hosting

```bash
# For each bucket, enable static website hosting
aws s3api put-bucket-website \
  --bucket jnv-spectra-admin \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'

# Repeat for other buckets
aws s3api put-bucket-website \
  --bucket jnv-spectra-website \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'

aws s3api put-bucket-website \
  --bucket jnv-spectra-checkout \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'
```

### Block Public Access (CloudFront only)

```bash
# Block public access but allow CloudFront
aws s3api put-bucket-public-access-block \
  --bucket jnv-spectra-admin \
  --public-access-block-configuration '{
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }'

# Repeat for other buckets
aws s3api put-bucket-public-access-block \
  --bucket jnv-spectra-website \
  --public-access-block-configuration '{
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }'

aws s3api put-bucket-public-access-block \
  --bucket jnv-spectra-checkout \
  --public-access-block-configuration '{
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }'
```

### Create CloudFront Distributions

**Method 1: AWS Console (Easier for first time)**

In AWS Console → CloudFront → Create distribution:

**For Admin Bucket (jnv-spectra-admin):**
1. **Origin domain:** Select `jnv-spectra-admin.s3.amazonaws.com`
2. **HTTP Settings:**
   - Viewer protocol policy: `Redirect HTTP to HTTPS`
3. **Function Associations:**
   - Keep default
4. **Cache Key and Origin Requests:**
   - Query strings: Include all
5. **Response Headers Policy:**
   - Enable CORS headers
6. **Alternate domain names (CNAMEs):**
   - Add: `admin.jnvspectra.com`
7. **SSL Certificate:**
   - Select ACM certificate for jnvspectra.com (create if needed)
8. **Default root object:** `index.html`
9. **Create distribution**

**Repeat for Website and Checkout buckets:**
- Website: CNAME: `www.jnvspectra.com`
- Checkout: CNAME: `checkout.jnvspectra.com`

**Note:** Save the Distribution IDs (e.g., `E3JSTWY7ASXYZ`) for GitHub Secrets

**Method 2: AWS CLI**

```bash
# Create CloudFront distribution via CLI (advanced)
# Save distribution config to JSON, then:
aws cloudfront create-distribution-with-tags \
  --distribution-config-with-tags file://admin-distribution.json
```

---

## 🌐 Route 53 DNS Configuration

### Create Hosted Zone

In AWS Console → Route 53 → Hosted zones → Create hosted zone:

1. **Domain name:** `jnvspectra.com`
2. **Type:** Public
3. **Create hosted zone**

AWS will create 4 nameservers. **Copy these NS records.**

### Update Hostinger Nameservers

1. **In Hostinger Control Panel:**
   - Domain → DNS settings
   - Change nameservers to AWS Route 53 NS records
   - Wait for propagation (5 minutes to 24 hours)

### Create Route 53 Records

In AWS Console → Route 53 → Hosted zones → jnvspectra.com → Create records:

```
Record 1: Website Root
Name: jnvspectra.com
Type: A (Alias)
Alias target: CloudFront distribution (website)
Routing policy: Simple

Record 2: Website WWW
Name: www.jnvspectra.com
Type: A (Alias)
Alias target: CloudFront distribution (website)
Routing policy: Simple

Record 3: Admin Portal
Name: admin.jnvspectra.com
Type: A (Alias)
Alias target: CloudFront distribution (admin)
Routing policy: Simple

Record 4: Checkout App
Name: checkout.jnvspectra.com
Type: A (Alias)
Alias target: CloudFront distribution (checkout)
Routing policy: Simple

Record 5: Backend API
Name: api.jnvspectra.com
Type: A
Value: Your EC2 Elastic IP (e.g., 52.123.45.67)
TTL: 300
```

**Verify DNS propagation:**
```bash
nslookup jnvspectra.com
dig admin.jnvspectra.com
```

---

## 🔒 SSL/TLS Certificates

### Request Certificate in ACM

In AWS Console → Certificate Manager → Request certificate:

1. **Domain name:** `jnvspectra.com`
2. **Subject Alternative Names (SANs):**
   - `*.jnvspectra.com` (wildcard for all subdomains)
   - `www.jnvspectra.com`
   - `admin.jnvspectra.com`
   - `checkout.jnvspectra.com`
   - `api.jnvspectra.com`

3. **Validation method:** `DNS validation` (recommended for Route 53)
4. **Request certificate**

AWS will create DNS validation records automatically via Route 53. Validation happens automatically.

### Attach Certificate to CloudFront

For each CloudFront distribution:
1. AWS Console → CloudFront → Select distribution → Edit
2. **SSL Certificate:** Select your ACM certificate
3. **Save changes**

---

## 👤 IAM User Setup for CI/CD

### Create IAM User

In AWS Console → IAM → Users → Create user:

1. **Username:** `github-actions-deploy`
2. **Programmatic access:** Enabled
3. **Console access:** Disable (not needed)
4. **Create user**

### Attach Policies

```bash
# Create inline policy with these permissions:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy",
        "s3:PutBucketWebsite"
      ],
      "Resource": [
        "arn:aws:s3:::jnv-spectra-*/*",
        "arn:aws:s3:::jnv-spectra-*"
      ]
    },
    {
      "Sid": "CloudFrontAccess",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetDistribution",
        "cloudfront:ListDistributions"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECRAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:us-east-1:*:repository/jnv-backend"
    },
    {
      "Sid": "EC2Access",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ssm:StartSession",
        "ssm:SendCommand"
      ],
      "Resource": "*"
    }
  ]
}
```

### Generate Access Keys

1. **AWS Console → IAM → Users → github-actions-deploy → Security credentials**
2. **Create access key**
3. **Copy:**
   - `Access Key ID`
   - `Secret Access Key` (save securely!)
4. **Add to GitHub Secrets**

---

## 💰 Cost Optimization

### Recommended Settings

1. **EC2 Savings:**
   - Use `t3.medium` with on-demand pricing
   - Or use `t3.small` if budget is tight
   - Enable detailed monitoring (small additional cost)

2. **S3 Savings:**
   - Enable S3 Intelligent-Tiering
   - Set lifecycle policies to move old objects to cheaper storage
   - Enable S3 Versioning for backups (consumes space)

3. **CloudFront Savings:**
   - Use CloudFront to cache content (reduces origin requests)
   - Enable HTTP/2 and HTTP/3 support
   - Set appropriate cache TTLs (default 24 hours)

4. **Route 53 Savings:**
   - Only pay for hosted zones and queries
   - Standard: $0.50/zone/month

5. **Data Transfer Savings:**
   - CloudFront reduces egress from S3 (cheaper)
   - EC2 to RDS within same region (free)
   - Use VPC endpoints if heavy data traffic

### Cost Breakdown

```
Monthly Cost Estimate:

EC2 t3.medium (24/7)              ~$30
RDS db.t3.micro PostgreSQL        ~$30
S3 Storage (50GB)                 ~$1
S3 Data Transfer                  ~$2
CloudFront CDN (1TB/month)        ~$85
Route 53 (1 zone)                 ~$1
ECR (Docker image storage)        ~$0.50
ACM Certificate                   ~$0 (free)
CloudWatch Monitoring             ~$2

TOTAL MONTHLY: ~$150-160 USD
```

### Free Tier Eligibility

- EC2: 750 hours/month free (t2.micro)
- S3: 5GB storage free
- RDS: Not free, but smallest instance is ~$30/month
- CloudFront: 1TB/month free! (after free tier)

---

## ✅ Infrastructure Checklist

Before proceeding to deployment:

- [ ] EC2 instance launched and secured
- [ ] Elastic IP allocated
- [ ] S3 buckets created
- [ ] CloudFront distributions created and associated
- [ ] Route 53 hosted zone created
- [ ] Hostinger nameservers updated
- [ ] SSL/TLS certificates requested and validated
- [ ] IAM user created with access keys
- [ ] GitHub Secrets configured with all AWS credentials
- [ ] Database (RDS) accessible from EC2
- [ ] Backup and monitoring configured

---

## 🚀 Next Steps

1. **Add GitHub Secrets** - See DEPLOYMENT_GUIDE.md
2. **Set up environment on EC2** - Run server setup commands
3. **Test connectivity** - Verify all AWS services working
4. **Trigger first deployment** - Push code to main branch
5. **Monitor and optimize** - Watch CloudWatch logs

---

**AWS infrastructure is ready for production deployment!** 🎉

