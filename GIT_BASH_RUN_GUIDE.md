# JNV Spectra - Git Bash Run Guide

This guide provides all the commands needed to run the entire JNV Spectra application stack using Git Bash.

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Git Bash** (Windows)

## Quick Start - Run All Applications

### Step 1: Open Multiple Git Bash Windows

You'll need 4 separate Git Bash terminal windows (one for each application). Open Git Bash 4 times.

### Step 2: Install Dependencies (Run Once)

**In ANY Git Bash window**, navigate to the project root and install all dependencies:

```bash
cd /c/Users/jnvsp/JNV_SPECTRA
npm install --workspaces
```

**OR install each application individually:**

```bash
# Backend
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_backend_final
npm install

# Admin Portal
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_admin
npm install

# Website
cd /c/Users/jnvsp/JNV_SPECTRA/jnv_spectra_website
npm install

# Checkout App
cd /c/Users/jnvsp/JNV_SPECTRA/jnv-checkout-app
npm install
```

## Running the Applications

### Terminal 1: Backend API (Port 3000)

```bash
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_backend_final
npm run dev
```

**Expected Output:**
```
[nodemon] 3.1.9
[nodemon] starting `node src/index.js`
Server running on port 3000
```

**Access:** http://localhost:3000

---

### Terminal 2: Admin Portal (Port 8080)

```bash
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_admin
npm run dev
```

**Expected Output:**
```
VITE v5.4.10  ready in XXX ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.1.185:8080/
```

**Access:** http://localhost:8080

---

### Terminal 3: Website (Port 8081)

```bash
cd /c/Users/jnvsp/JNV_SPECTRA/jnv_spectra_website
npx vite --host 0.0.0.0 --port 8081
```

**Expected Output:**
```
VITE v5.4.10  ready in XXX ms

  ➜  Local:   http://localhost:8081/
  ➜  Network: http://192.168.1.185:8081/
```

**Access:** http://localhost:8081

---

### Terminal 4: Checkout App (Port 5173)

```bash
cd /c/Users/jnvsp/JNV_SPECTRA/jnv-checkout-app
npx vite --host 0.0.0.0 --port 5173
```

**Expected Output:**
```
VITE v6.3.5  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.185:5173/
```

**Access:** http://localhost:5173

---

## Complete Command Reference

### All-in-One Installation Commands

```bash
# Navigate to project root
cd /c/Users/jnvsp/JNV_SPECTRA

# Install dependencies
npm install --workspaces

# OR manually install each:
cd event_management_backend_final && npm install
cd ../event_management_admin && npm install
cd ../jnv_spectra_website && npm install
cd ../jnv-checkout-app && npm install
```

### All-in-One Run Commands (Copy & Paste)

**Terminal 1 - Backend:**
```bash
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_backend_final && npm run dev
```

**Terminal 2 - Admin:**
```bash
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_admin && npm run dev
```

**Terminal 3 - Website:**
```bash
cd /c/Users/jnvsp/JNV_SPECTRA/jnv_spectra_website && npx vite --host 0.0.0.0 --port 8081
```

**Terminal 4 - Checkout:**
```bash
cd /c/Users/jnvsp/JNV_SPECTRA/jnv-checkout-app && npx vite --host 0.0.0.0 --port 5173
```

---

## Access URLs

After all applications are running, access them at:

| Application | URL | Port |
|---|---|---|
| Backend API | http://localhost:3000 | 3000 |
| Admin Portal | http://localhost:8080 | 8080 |
| Website | http://localhost:8081 | 8081 |
| Checkout App | http://localhost:5173 | 5173 |

---

## Troubleshooting

### Port Already in Use

If a port is already in use, you'll see an error like:
```
Error: listen EADDRINUSE: address already in use :::8080
```

**Solution 1: Find and kill the process**
```bash
# On Windows (in PowerShell or CMD, not Git Bash)
netstat -ano | findstr ":8080"
taskkill /PID <PID> /F
```

**Solution 2: Use a different port**
```bash
# For Vite apps (Admin, Website, Checkout), add --port flag:
npx vite --host 0.0.0.0 --port 8082  # or any available port

# For backend, modify your environment file or use:
PORT=3001 npm run dev
```

### Dependencies Not Installed

If you see module not found errors:
```bash
cd /c/Users/jnvsp/JNV_SPECTRA/<app-directory>
npm install
npx vite cache clean  # for Vite apps
```

### Node/npm Command Not Found

Make sure Node.js is properly installed:
```bash
node --version
npm --version
```

If not found, download and install from: https://nodejs.org

---

## Development Tips

### Stopping Applications

- Press `Ctrl + C` in any terminal to stop the dev server

### Hot Module Replacement (HMR)

- The React apps (Admin, Website, Checkout) support HMR
- Changes to files will auto-reload in the browser
- The backend (nodemon) will also auto-restart on file changes

### Viewing Logs

Each application logs to the terminal. Keep the terminals visible to see:
- API requests/responses (backend)
- Build information (Vite apps)
- Error messages
- Development tips

### Accessing from Other Devices on Network

If you need to access from another computer on your network:
- Backend: http://192.168.1.185:3000
- Admin: http://192.168.1.185:8080
- Website: http://192.168.1.185:8081
- Checkout: http://192.168.1.185:5173

(Replace 192.168.1.185 with your machine's IP address)

---

## Production Build Commands

To create production builds:

```bash
# Backend (if needed)
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_backend_final
npm run build

# Admin Portal
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_admin
npm run build

# Website
cd /c/Users/jnvsp/JNV_SPECTRA/jnv_spectra_website
npm run build

# Checkout App
cd /c/Users/jnvsp/JNV_SPECTRA/jnv-checkout-app
npm run build
```

The built files will be in respective `dist/` directories.

---

## Database Configuration

**Note:** The backend requires a PostgreSQL database connection.

Ensure your `.env` file in `event_management_backend_final/` contains:

```
DB_HOST=jnvspectra.cqzcueeo8qb6.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=jnvspectra
DB_USER=postgres
DB_PASSWORD=your_password
AWS_REGION=us-east-1
AWS_S3_BUCKET=jnv-images
```

The backend will automatically connect to the AWS RDS database when you run `npm run dev`.

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Start all 4 applications in separate terminals
3. ✅ Open http://localhost:8080 to access the Admin Portal
4. ✅ Open http://localhost:8081 to access the Website
5. ✅ Open http://localhost:5173 to access the Checkout App
6. ✅ Backend API is available at http://localhost:3000

Happy coding! 🚀

