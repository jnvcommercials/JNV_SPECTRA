#!/bin/bash

# 🚀 JNV Spectra - EC2 Production Server Setup Script
# Run this script on your EC2 instance after SSH connection
# Usage: bash setup-ec2.sh

set -e  # Exit on error

echo "🚀 Starting JNV Spectra EC2 Server Setup..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# ============================================================
# STEP 1: System Updates
# ============================================================
print_info "STEP 1/5: Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
print_success "System updated"
echo ""

# ============================================================
# STEP 2: Install Docker & Docker Compose
# ============================================================
print_info "STEP 2/5: Installing Docker and Docker Compose..."

# Install Docker
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

print_success "Docker installed and enabled"

# Install Docker Compose v2
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

print_success "Docker Compose installed"
echo ""

# ============================================================
# STEP 3: Install AWS CLI
# ============================================================
print_info "STEP 3/5: Installing AWS CLI..."

sudo apt-get install -y awscli

# Verify installation
aws --version
print_success "AWS CLI installed"
echo ""

# ============================================================
# STEP 4: Create Application Directory
# ============================================================
print_info "STEP 4/5: Creating application directories..."

# Create directories
mkdir -p ~/jnv-backend
mkdir -p ~/.aws

print_success "Directories created at ~/jnv-backend"
echo ""

# ============================================================
# STEP 5: Create .env Template
# ============================================================
print_info "STEP 5/5: Creating .env template file..."

cat > ~/.env << 'EOF'
# 🚀 JNV Spectra - Production Environment Configuration
# Update these values with your actual credentials

# ============================================================
# Server Configuration
# ============================================================
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# ============================================================
# Database (AWS RDS PostgreSQL)
# ============================================================
DB_HOST=jnvspectra.cqzcueeo8qb6.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=jnvdb
DB_USER=root
DB_PASSWORD=Jnvspectra25
DB_SSL=false

# ============================================================
# AWS Configuration
# ============================================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_BUCKET_NAME=jnv-images

# ============================================================
# JWT Configuration
# ============================================================
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRES_IN=24h

# ============================================================
# Rate Limiting
# ============================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================================
# Email Configuration (Gmail SMTP)
# ============================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=JNV Spectra

# ============================================================
# Square Payment Integration
# ============================================================
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=your_square_access_token_here
SQUARE_LOCATION_ID=your_square_location_id_here

# ============================================================
# Frontend URLs
# ============================================================
FRONTEND_URL=https://www.jnvspectra.com
FRONTEND_ADMIN_URL=https://admin.jnvspectra.com
FRONTEND_CHECKOUT_URL=https://checkout.jnvspectra.com

# ============================================================
# Supabase Configuration (if using)
# ============================================================
SUPABASE_URL=https://mmrblmtshtwucjhamxnc.supabase.co
SUPABASE_KEY=your_supabase_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
EOF

print_success ".env template created at ~/.env"
print_warning "IMPORTANT: Edit ~/.env with your actual credentials"
echo ""

# ============================================================
# Create Docker Compose Template
# ============================================================
cat > ~/jnv-backend/docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    image: 123456789.dkr.ecr.us-east-1.amazonaws.com/jnv-backend:latest
    container_name: jnv-backend
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
      - DB_SSL=${DB_SSL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
      - AWS_REGION=${AWS_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_BUCKET_NAME=${AWS_BUCKET_NAME}
      - RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS}
      - RATE_LIMIT_MAX_REQUESTS=${RATE_LIMIT_MAX_REQUESTS}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_SECURE=${SMTP_SECURE}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - EMAIL_FROM=${EMAIL_FROM}
      - EMAIL_FROM_NAME=${EMAIL_FROM_NAME}
      - SQUARE_ENVIRONMENT=${SQUARE_ENVIRONMENT}
      - SQUARE_ACCESS_TOKEN=${SQUARE_ACCESS_TOKEN}
      - SQUARE_LOCATION_ID=${SQUARE_LOCATION_ID}
      - FRONTEND_URL=${FRONTEND_URL}
      - FRONTEND_ADMIN_URL=${FRONTEND_ADMIN_URL}
      - FRONTEND_CHECKOUT_URL=${FRONTEND_CHECKOUT_URL}
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
EOF

print_success "docker-compose.yml template created"
echo ""

# ============================================================
# Create AWS Configuration Template
# ============================================================
cat > ~/.aws/config << 'EOF'
[default]
region = us-east-1
output = json

[profile github-actions]
region = us-east-1
output = json
EOF

cat > ~/.aws/credentials.template << 'EOF'
# IMPORTANT: Keep this file SECURE! Never commit to git!
#
# Template for ~/.aws/credentials
# Copy this to ~/.aws/credentials and fill in your actual values
# Run: chmod 600 ~/.aws/credentials
#
# Don't edit this template - it's marked as .template to prevent accidents

[default]
aws_access_key_id = YOUR_AWS_ACCESS_KEY_ID
aws_secret_access_key = YOUR_AWS_SECRET_ACCESS_KEY

[github-actions]
aws_access_key_id = YOUR_GITHUB_ACTIONS_AWS_KEY_ID
aws_secret_access_key = YOUR_GITHUB_ACTIONS_AWS_SECRET_ACCESS_KEY
EOF

chmod 600 ~/.aws/config
print_success "AWS configuration templates created"
echo ""

# ============================================================
# Verify Installations
# ============================================================
print_info "Verifying installations..."
echo ""

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "$DOCKER_VERSION"
else
    print_error "Docker installation failed"
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(docker-compose --version)
    print_success "$DOCKER_COMPOSE_VERSION"
else
    print_error "Docker Compose installation failed"
fi

# Check AWS CLI
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version)
    print_success "$AWS_VERSION"
else
    print_error "AWS CLI installation failed"
fi

echo ""
echo "🎉 EC2 Server Setup Complete!"
echo ""
echo "═════════════════════════════════════════════════════════"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. 🔐 Configure AWS Credentials:"
echo "   nano ~/.aws/credentials"
echo "   Then add your AWS credentials from IAM user"
echo "   AND run: chmod 600 ~/.aws/credentials"
echo ""
echo "2. ⚙️  Configure Environment Variables:"
echo "   nano ~/.env"
echo "   Update all YOUR_XXX values with actual credentials"
echo ""
echo "3. 🐳 Test Docker Setup:"
echo "   docker ps"
echo "   docker-compose --version"
echo ""
echo "4. 🔗 Configure ECR Login:"
echo "   aws ecr get-login-password --region us-east-1 | \\"
echo "   docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com"
echo "   (Replace 123456789 with your AWS Account ID)"
echo ""
echo "5. 📦 Load Environment Variables:"
echo "   export \$(cat ~/.env | xargs)"
echo ""
echo "6. ⬇️  Pull Latest Backend Image:"
echo "   cd ~/jnv-backend"
echo "   docker-compose pull"
echo ""
echo "7. 🚀 Start Backend Service:"
echo "   docker-compose up -d"
echo ""
echo "8. ✅ Verify Service:"
echo "   curl http://localhost:3000/api/v1/health"
echo ""
echo "═════════════════════════════════════════════════════════"
echo ""
echo "📚 Reference Documentation:"
echo "   - AWS Infrastructure: See AWS_INFRASTRUCTURE_SETUP.md"
echo "   - Deployment Guide: See DEPLOYMENT_GUIDE.md"
echo "   - GitHub Secrets: See GITHUB_SECRETS_GUIDE.md"
echo ""
echo "✅ Server is ready for production deployment!"
echo ""

