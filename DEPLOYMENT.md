# Deployment Guide

This guide covers deploying the Grammar Checker application to production using Render (backend) and Vercel (frontend).

## 🚀 Backend Deployment (Render)

### Prerequisites

- Render account (https://render.com)
- GitHub repository with your code

### Step 1: Database Setup

1. Go to Render Dashboard → New → PostgreSQL
2. Configure:
   - **Name**: `grammar-checker-db`
   - **Database**: `grammar_checker`
   - **User**: `grammar_user`
   - **Plan**: Starter ($7/month)
3. Save the connection string for later

### Step 2: Backend Service

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `grammar-checker-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `yarn install && yarn prisma generate && yarn build`
   - **Start Command**: `yarn prisma db push && yarn start`
   - **Plan**: Starter ($7/month)

### Step 3: Environment Variables

Add these in Render service settings:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=<your-postgres-connection-string>
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-vercel-app.vercel.app
LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check
```

### Step 4: Health Check

- **Health Check Path**: `/health`

## 🌐 Frontend Deployment (Vercel)

### Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository with your code

### Step 1: Import Project

1. Go to Vercel Dashboard → New Project
2. Import from GitHub
3. Select your repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Output Directory**: `dist`
   - **Install Command**: `yarn install`

### Step 2: Environment Variables

Add in Vercel project settings:

```bash
VITE_API_URL=https://your-render-backend.onrender.com
```

### Step 3: Domain Configuration

1. After deployment, note your Vercel domain (e.g., `grammar-checker.vercel.app`)
2. Update the backend CORS_ORIGIN environment variable on Render to include your Vercel domain

## 🔄 Post-Deployment Setup

### 1. Update CORS Origins

Update your Render backend environment variables:

```bash
CORS_ORIGIN=https://your-vercel-app.vercel.app,https://grammar-checker.vercel.app
```

### 2. Seed Production Database

After first deployment, seed the database:

1. Go to Render service → Shell
2. Run: `yarn prisma db seed`

### 3. Test the Application

- Visit your Vercel frontend URL
- Test login with: `demo@demo.com` / `demo123456`
- Test grammar analysis and history

## 📝 Configuration Files

### Backend (render.yaml)

```yaml
services:
  - type: web
    name: grammar-checker-backend
    env: node
    plan: starter
    buildCommand: yarn install && yarn prisma generate && yarn build
    startCommand: yarn prisma db push && yarn start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      # ... other env vars
```

### Frontend (vercel.json)

```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "yarn build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🔧 Environment Variables Summary

### Required for Render (Backend)

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secure string (auto-generate in Render)
- `CORS_ORIGIN` - Your Vercel frontend URLs
- `NODE_ENV=production`
- `PORT=3001`

### Required for Vercel (Frontend)

- `VITE_API_URL` - Your Render backend URL

## 🚨 Security Notes

1. **Never commit secrets** - Use environment variables for all sensitive data
2. **Generate secure JWT secrets** - Use Render's auto-generation feature
3. **Update CORS origins** - Only allow your actual domains
4. **Enable HTTPS** - Both Render and Vercel provide SSL by default

## 📊 Monitoring

### Render

- View logs in service dashboard
- Monitor health checks
- Set up alerts for downtime

### Vercel

- View deployment logs
- Monitor function invocations
- Analytics for frontend performance

## 🔄 Continuous Deployment

Both platforms support automatic deployments:

- **Render**: Deploys on git push to main branch
- **Vercel**: Deploys on git push, with preview deployments for PRs

## 💰 Estimated Costs

### Render (Backend + Database)

- Web Service: $7/month (Starter)
- PostgreSQL: $7/month (Starter)
- **Total**: ~$14/month

### Vercel (Frontend)

- Hobby Plan: Free (up to 100GB bandwidth)
- Pro Plan: $20/month (if you need more resources)

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**

   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Database Connection**

   - Verify DATABASE_URL format
   - Check database credentials
   - Ensure database is running

3. **CORS Errors**

   - Update CORS_ORIGIN with exact domain
   - Include both www and non-www versions if needed
   - Check for typos in domain names

4. **Environment Variables**
   - Verify all required vars are set
   - Check for typos in variable names
   - Ensure secrets are properly generated
