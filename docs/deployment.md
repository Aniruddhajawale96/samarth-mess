# Deployment

## Production topology

- Render hosts the Express API from `render.yaml`.
- Vercel hosts the Next.js web app.
- Supabase (or another hosted PostgreSQL provider) supplies `DATABASE_URL`.
- A managed Redis provider supplies `REDIS_URL`.
- GitHub Actions runs validation only through `.github/workflows/ci.yml`.

The old Docker-based CD workflow was removed because it only ran containers on a temporary GitHub runner; it did not deploy those containers to Render.

## Render API environment

Set these values in the Render service's Environment page. Render generates `JWT_SECRET` and `COOKIE_SECRET` from the blueprint.

```text
NODE_ENV=production
API_URL=https://<your-render-api>.onrender.com
DATABASE_URL=<rotated-hosted-postgresql-url>
REDIS_URL=<managed-redis-url>
JWT_SECRET=<render-generated-value>
COOKIE_SECRET=<render-generated-value>
FRONTEND_URL=https://<your-vercel-app>.vercel.app
```

`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are optional, but must be supplied together. WhatsApp is optional; leave both WhatsApp credential variables unset until they are available.

Render uses the API health check at `/health` and automatically redeploys when changes are pushed to the configured branch.

## Vercel web environment

Set this build-time variable in Vercel:

```text
NEXT_PUBLIC_API_URL=https://<your-render-api>.onrender.com
```

Enable automatic deployments from the same branch used by Render.

## Rollback

Use Render's deploy history to redeploy a previous API revision and Vercel's deployment history to promote a previous frontend deployment. Database migrations must remain backward-compatible with the previous application revision before a release is promoted.

## Local container runtime

```bash
cp .env.example .env
docker compose up --build
```

The API is available at `http://localhost:4000`, the web app at `http://localhost:3000`, and the worker consumes the Redis-backed operations queue.
