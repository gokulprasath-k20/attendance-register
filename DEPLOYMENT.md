# Deployment Guide

Complete guide for deploying the Attendance Management System to production.

## Table of Contents

1. [Vercel Deployment (Recommended)](#vercel-deployment)
2. [Other Platforms](#other-platforms)
3. [Environment Setup](#environment-setup)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

## Vercel Deployment (Recommended)

Vercel is the recommended platform as it's built by the Next.js team and offers seamless integration.

### Prerequisites

- GitHub account
- Vercel account (free tier available)
- Supabase project set up
- Code pushed to GitHub repository

### Step-by-Step Deployment

#### 1. Prepare Your Repository

```bash
# Commit all changes
git add .
git commit -m "Ready for deployment"

# Push to GitHub
git push origin main
```

#### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the repository

#### 3. Configure Project

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `./` (leave as is)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

#### 4. Add Environment Variables

Click "Environment Variables" and add:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://yourdomain.vercel.app

# Optional Configuration
NEXT_PUBLIC_MAX_ATTENDANCE_DISTANCE=10
NEXT_PUBLIC_OTP_EXPIRY_MINUTES=5
```

**Important**: 
- Generate a NEW `NEXTAUTH_SECRET` for production
- Update `NEXTAUTH_URL` to your Vercel domain

#### 5. Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Visit your deployed site

#### 6. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Update `NEXTAUTH_URL` environment variable

## Other Platforms

### Railway

1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select repository
4. Add environment variables
5. Deploy

### Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. New site from Git
3. Connect GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables
6. Deploy

### Digital Ocean App Platform

1. Create account at [digitalocean.com](https://digitalocean.com)
2. Apps → Create App
3. Connect GitHub
4. Configure build settings
5. Add environment variables
6. Deploy

### Self-Hosted (VPS/Server)

```bash
# On your server

# 1. Clone repository
git clone <your-repo-url>
cd avsecitar

# 2. Install dependencies
npm install

# 3. Create .env.local with production values
nano .env.local

# 4. Build application
npm run build

# 5. Start with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "attendance-app" -- start
pm2 save
pm2 startup

# 6. Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/attendance
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Setup

### Production Environment Variables

**Required**:
```env
NEXT_PUBLIC_SUPABASE_URL=<production-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-key>
NEXTAUTH_SECRET=<strong-random-secret>
NEXTAUTH_URL=<your-production-url>
```

**Optional**:
```env
NEXT_PUBLIC_MAX_ATTENDANCE_DISTANCE=10
NEXT_PUBLIC_OTP_EXPIRY_MINUTES=5
```

### Security Best Practices

1. **Generate New Secrets**:
   ```bash
   openssl rand -base64 32
   ```

2. **Use Different Supabase Projects**:
   - Development: Separate Supabase project
   - Production: Separate Supabase project

3. **Enable RLS**: Ensure Row Level Security is enabled on all tables

4. **Review Policies**: Double-check RLS policies before going live

5. **HTTPS Only**: Always use HTTPS in production (required for geolocation)

## Pre-Deployment Checklist

### Code Review

- [ ] All environment variables are configured
- [ ] No hardcoded secrets or API keys
- [ ] Console.logs removed or replaced with proper logging
- [ ] Error handling implemented on all API routes
- [ ] TypeScript errors resolved (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)

### Database

- [ ] Schema deployed to production Supabase
- [ ] RLS policies enabled on all tables
- [ ] Indexes created for performance
- [ ] Test data removed from production database
- [ ] Backup strategy in place

### Testing

- [ ] Test all user flows (signup, login, OTP, attendance)
- [ ] Test on different devices (desktop, mobile, tablet)
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test geolocation features
- [ ] Test export functionality (Excel, PDF)
- [ ] Test role-based access control
- [ ] Test error scenarios

### Performance

- [ ] Images optimized
- [ ] Unnecessary dependencies removed
- [ ] API responses cached appropriately
- [ ] Database queries optimized
- [ ] Large files not committed to Git

### Security

- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] Rate limiting considered (if needed)
- [ ] Input validation on all forms
- [ ] SQL injection prevention verified
- [ ] XSS protection verified

### Documentation

- [ ] README.md updated
- [ ] API documentation current
- [ ] Configuration guide complete
- [ ] Deployment instructions documented

## Post-Deployment

### 1. Verify Deployment

Test critical paths:

```bash
# Test signup
curl -X POST https://yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test","role":"student","regNo":"TEST001","year":2,"semester":1}'

# Check homepage loads
curl https://yourdomain.com
```

### 2. Create First Admin User

1. Sign up through the application
2. Go to Supabase Dashboard → Authentication → Users
3. Copy user ID
4. Run in SQL Editor:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE user_id = 'user-id-here';
   ```

### 3. Configure Monitoring

**Vercel Analytics** (if using Vercel):
1. Project Settings → Analytics
2. Enable Web Analytics

**Error Tracking** (optional):
- Set up Sentry
- Configure error logging
- Set up alerts

### 4. Set Up Backups

**Supabase Backups**:
1. Go to Database → Backups
2. Configure automatic backups
3. Test backup restoration

### 5. Update DNS (if using custom domain)

1. Add A record pointing to deployment
2. Add CNAME for www subdomain
3. Wait for DNS propagation (up to 48 hours)
4. Verify SSL certificate is active

### 6. Test Production Thoroughly

- [ ] Sign up new users
- [ ] Test all user roles
- [ ] Generate OTPs
- [ ] Mark attendance
- [ ] Export reports
- [ ] Test on mobile devices
- [ ] Check geolocation accuracy

### 7. Monitor Performance

Watch for:
- Response times
- Error rates
- User activity
- Database performance
- API usage

## Troubleshooting

### Build Failures

**Error**: "Module not found"
```bash
# Solution: Ensure all dependencies are installed
npm install
npm run build
```

**Error**: "Type errors"
```bash
# Solution: Run type checking
npm run type-check
# Fix reported errors
```

### Runtime Errors

**Error**: "NEXTAUTH_URL is not set"
- Add `NEXTAUTH_URL` to environment variables
- Must be your full production URL

**Error**: "Failed to fetch from Supabase"
- Verify Supabase URL and keys
- Check RLS policies
- Ensure service role key is correct

**Error**: "Geolocation not working"
- Ensure using HTTPS (required for geolocation)
- Check browser permissions
- Verify location services enabled on device

### Performance Issues

**Slow page loads**:
1. Enable Vercel Analytics to identify bottlenecks
2. Check database query performance
3. Optimize images
4. Review API response times

**High API latency**:
1. Check Supabase region (should be close to users)
2. Review database indexes
3. Optimize queries
4. Consider caching

### Database Issues

**Connection errors**:
- Verify Supabase credentials
- Check Supabase service status
- Review connection limits

**Query timeouts**:
- Add indexes to frequently queried columns
- Optimize complex queries
- Consider pagination for large datasets

## Scaling Considerations

### Traffic Growth

**Medium Traffic** (100-1000 users):
- Vercel Hobby/Pro plan sufficient
- Supabase Free/Pro tier

**High Traffic** (1000+ users):
- Vercel Pro/Enterprise
- Supabase Pro/Team tier
- Consider CDN for static assets
- Implement caching strategy
- Add rate limiting

### Database Scaling

**Vertical Scaling**:
- Upgrade Supabase instance size
- Increase connection limits

**Horizontal Scaling**:
- Read replicas for reporting
- Separate analytics database
- Archive old attendance records

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check user reports
- Review attendance patterns

**Weekly**:
- Review performance metrics
- Check database size
- Update dependencies if needed

**Monthly**:
- Database cleanup (old OTP sessions)
- Review and update documentation
- Security audit
- Backup verification

### Cleanup Script

Add to cron job or scheduled task:

```sql
-- Clean up expired OTP sessions (run daily)
DELETE FROM otp_sessions 
WHERE expires_at < NOW() - INTERVAL '1 day';

-- Archive old attendance records (run monthly)
-- Move records older than 1 year to archive table
```

## Rollback Strategy

If deployment has critical issues:

### Vercel

1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Other Platforms

1. Revert Git commit:
   ```bash
   git revert HEAD
   git push origin main
   ```
2. Platform auto-deploys reverted code

### Database Rollback

1. Go to Supabase → Database → Backups
2. Restore from backup before problematic changes
3. Note: This loses data created after backup

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/support](https://supabase.com/support)
- Project Issues: GitHub Issues

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

**Your app is now live!** 🎉 Monitor closely for the first few days and gather user feedback.
