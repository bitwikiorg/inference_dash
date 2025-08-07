# Deployment Guide

## Automated Deployment Setup

This project is configured for automatic deployment to Vercel via GitHub Actions.

### Prerequisites

1. **Vercel Account Setup**
   - Create account at [vercel.com](https://vercel.com)
   - Install Vercel CLI: `npm i -g vercel`
   - Link project: `vercel --confirm`

2. **GitHub Secrets Configuration**
   
   In your GitHub repository, go to Settings → Secrets and Variables → Actions, and add:
   
   ```
   VERCEL_TOKEN=your_vercel_token_here
   VERCEL_ORG_ID=your_org_id_here  
   VERCEL_PROJECT_ID=your_project_id_here
   ```

   **To get these values:**
   
   - **VERCEL_TOKEN**: Go to Vercel Dashboard → Settings → Tokens → Create
   - **VERCEL_ORG_ID**: Run `vercel org ls` 
   - **VERCEL_PROJECT_ID**: Run `vercel project ls` after linking

3. **Environment Variables on Vercel**
   
   In Vercel Dashboard → Project → Settings → Environment Variables, add:
   
   ```
   API_USER=your_username
   API_PASS=your_secure_password
   NODE_ENV=production
   ```

### Deployment Process

1. **Automatic Deployment**
   - Push to `main` branch triggers automatic deployment
   - GitHub Actions runs tests first
   - If tests pass, deploys to Vercel production

2. **Manual Deployment** (if needed)
   ```bash
   vercel --prod
   ```

### Workflow

1. **Development**: Work on feature branches
2. **Testing**: Create PR to `main` (triggers tests)
3. **Deployment**: Merge PR to `main` (triggers tests + deployment)

### Monitoring

- GitHub Actions: Check workflow status in Actions tab
- Vercel: Monitor deployments in Vercel dashboard
- Health check: `https://your-app.vercel.app/healthz`

### Rollback

If deployment fails:
```bash
vercel rollback
```

Or redeploy previous commit through GitHub.
