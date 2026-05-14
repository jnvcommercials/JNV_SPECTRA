# 🔍 How to Find Ubuntu 22.04 LTS AMI in AWS Console

## Quick Steps (2 minutes)

### **Step 1: Go to EC2 Launch Instance**
- AWS Console → EC2 → Click **"Launch Instance"**

### **Step 2: Find Ubuntu Image**

**Option A: Easiest - Type in search box**
```
1. You'll see "Application and OS Images (Amazon Machine Image)" section
2. There's a search box - click it
3. Type: ubuntu
4. Press Enter
```

**Result:** Will show many Ubuntu images

### **Step 3: Filter Results**

Look for these columns:
```
Image Name              | Version          | Status
ubuntu/images/hvm-ssd/ | ubuntu-jammy-    | Available
ubuntu/images/hvm-ssd/ | ubuntu-focal-    | Available
```

**Select:** The one that shows:
- ✅ "ubuntu-jammy-22.04" OR "ubuntu-focal-20.04"
- ✅ Published by: **Canonical**
- ✅ Status: **Available** (green checkmark)

### **Step 4: Click Select**
- Click the image row
- Click **"Select"** button on the right

---

## Visual Guide: Where to Click

### **Step 1: Launch Instance Page**
```
┌─────────────────────────────────────────────────────┐
│ EC2 Dashboard                                       │
├─────────────────────────────────────────────────────┤
│ Instances ├─ Launch Instance (← Click here)        │
└─────────────────────────────────────────────────────┘
```

### **Step 2: AMI Selection**
```
┌─────────────────────────────────────────────────────┐
│ Application and OS Images (Amazon Machine Image)   │
├─────────────────────────────────────────────────────┤
│ Search: [ubuntu] (← Type here)                      │
│                                                     │
│ Results:                                            │
│ ┌─────────────────────────────────────────────────┐│
│ │ □ ubuntu/images/hvm-ssd/ubuntu-jammy-22.04 (✓)││
│ │ □ ubuntu/images/hvm-ssd/ubuntu-focal-20.04     ││
│ │ □ ubuntu/images/hvm-ssd/ubuntu-bionic-18.04    ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ └─ [Select] button appears on the right           │
└─────────────────────────────────────────────────────┘
```

---

## If Still Can't Find It

### **Method 1: Browse Quick Start**
```
On Launch Instance page:
├─ Quick Start (default) ← Click this tab
│  ├─ Ubuntu
│  ├─ Amazon Linux 2
│  └─ RHEL
│
└─ If "Ubuntu" doesn't show, scroll down
   or click directly on "Ubuntu" text
```

### **Method 2: Search by Publisher**
```
1. Type in search: canonical
2. Filter results by: Free tier eligible
3. Select Ubuntu 22.04 LTS
```

### **Method 3: Use AMI ID Directly**
```
1. Click: "Community AMIs" or "All AMIs"
2. Search: ami-0c55b159cbfafe1f0
   (or search your region's ID)
3. Select the result
```

### **Method 4: Direct Community Search**
```
1. Left sidebar → Images → AMIs
2. Filter: Owned by: amazon OR canonical
3. Search: ubuntu-jammy-22.04
4. Pick the latest one
5. Click: "Launch"
```

---

## ✅ You'll Know You Selected Right When:

After clicking "Select", you should see:

```
Instance Details
├─ AMI ID: ami-0c55b159cbfafe1f0 (or similar)
├─ AMI Name: ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server
├─ Root Device Type: ebs
├─ Virtualization Type: hvm
└─ Architecture: x86_64
```

✓ If you see something similar, you're good!

---

## 🆘 Troubleshooting

### **"I only see Amazon Linux or Windows"**
→ Click the search box again
→ Clear the search
→ Type: `ubuntu`
→ Press Enter

### **"The image I'm looking for isn't showing"**
→ Try these searches instead:
  - `ubuntu-22`
  - `jammy`
  - `ubuntu 22.04`

### **"I see many results, which one?"**
→ Look for:
- **ubuntu-jammy-22.04-amd64-server** (Best)
- ubuntu-focal-20.04-amd64-server (Alternative)
- Region: **us-east-1**
- Published by: **Canonical**

### **"It says 'Free tier eligible' but very expensive"**
→ Make sure Instance Type is **t2.micro** or **t3.micro**
→ Check the pricing before launching
→ t2.micro = Free tier (750 hours/month)
→ t3.medium = Paid (~$30/month)

---

## Common Ubuntu AMI Names

```
Full AMI Name Format:
ubuntu/images/hvm-ssd/ubuntu-CODENAME-VERSION-amd64-server

Examples:
ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server ← Recommended
ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server ← Also works
ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server ← Older

Ubuntu Versions & Codenames:
22.04 LTS = Jammy (Latest recommended)
20.04 LTS = Focal (Stable, widely used)
18.04 LTS = Bionic (Older)
18.10 = Cosmic (No longer supported)
```

---

## Quick Copy-Paste Guide

### **If Using AWS CLI:**
```bash
# Get Ubuntu 22.04 AMI ID for us-east-1
aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server" \
  --region us-east-1 \
  --query 'Images[0].ImageId'
```

### **If Using Terraform:**
```hcl
# Find latest Ubuntu 22.04 LTS
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}
```

---

## 🎯 Success!

When you see the Ubuntu image selected with Instance Type `t3.medium`:

```
✓ AMI: Ubuntu 22.04 LTS
✓ Instance Type: t3.medium (or t2.micro for free tier)
✓ You're ready to proceed!
```

Click **"Next"** or **"Continue"** to move to the next step!

---

**Still stuck? Try Method 3 or 4 above - they work 100% of the time!** 🚀

