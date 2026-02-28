# Deployment Guide for iTalkLink

This guide explains how to move your project from Replit to a personal VPS or local machine.

## Prerequisites
- Node.js (v20+)
- PostgreSQL (v15+)
- Git

## Step 1: Export Data
1. Use the `/api/database/export/[table]` endpoints created earlier to download your current data as JSON files.
2. Alternatively, use `pg_dump` if you have direct access (not available on Replit's managed DB).

## Step 2: Code Transfer
1. Download the project as a ZIP from Replit or push it to a GitHub repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. Clone it on your VPS:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```

## Step 3: Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/italklink
SESSION_SECRET=your_random_secret_here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
# Add other secrets from Replit Secrets tab
```

## Step 4: Installation & Build
```bash
npm install
npm run build
```

## Step 5: Database Setup
1. Create a new PostgreSQL database on your VPS.
2. Push the schema:
   ```bash
   npm run db:push
   ```

## Step 6: Running the App
For production, use a process manager like PM2:
```bash
npm install -g pm2
pm2 start dist/index.js --name italklink
```

## Step 7: Nginx Setup (VPS Only)
Configure Nginx as a reverse proxy to port 5000:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
