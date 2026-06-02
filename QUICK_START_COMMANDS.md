# JNV Spectra - Quick Command Reference

## Install Dependencies (Run Once)

```bash
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_backend_final && npm install
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_admin && npm install
cd /c/Users/jnvsp/JNV_SPECTRA/jnv_spectra_website && npm install
cd /c/Users/jnvsp/JNV_SPECTRA/jnv-checkout-app && npm install
```

## Run Commands (Open 4 Separate Git Bash Windows)

### Terminal 1 - Backend (Port 3000)
```bash
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_backend_final && npm run dev
```

### Terminal 2 - Admin Portal (Port 8080)
```bash
cd /c/Users/jnvsp/JNV_SPECTRA/event_management_admin && npm run dev
```

### Terminal 3 - Website (Port 8081)
```bash
cd /c/Users/jnvsp/JNV_SPECTRA/jnv_spectra_website && npx vite --host 0.0.0.0 --port 8081
```

### Terminal 4 - Checkout App (Port 5173)
```bash
cd /c/Users/jnvsp/JNV_SPECTRA/jnv-checkout-app && npx vite --host 0.0.0.0 --port 5173
```

## Access URLs

- Backend: http://localhost:3000
- Admin: http://localhost:8080
- Website: http://localhost:8081
- Checkout: http://localhost:5173

## Helpful Tips

**Stop application:** Press `Ctrl + C` in the terminal

**Kill port process (PowerShell/CMD):**
```bash
netstat -ano | findstr ":8080"
taskkill /PID <PID> /F
```

**Check if Node.js is installed:**
```bash
node --version
npm --version
```

