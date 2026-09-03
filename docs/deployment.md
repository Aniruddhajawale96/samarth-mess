# Deployment

## Environments

Use separate GitHub Environments for `development`, `staging`, and `production`. Store `DATABASE_URL`, `JWT_SECRET`, and `COOKIE_SECRET` as environment secrets. Store `API_URL` and `FRONTEND_URL` as non-secret environment variables.

## Release flow

The `CD` workflow builds all containers, starts PostgreSQL and Redis, runs Drizzle migrations, starts the API, worker, and web services, and fails when `/health` does not respond successfully.

## Rollback

Keep the previously deployed image or source revision available. To roll back, deploy that revision with the same environment secrets, run the normal migration step, and restart the services. Database migrations must remain backward-compatible with the previous application revision before a release is promoted.

## Local container runtime

```bash
cp .env.example .env
docker compose up --build
```

The API is available at `http://localhost:4000`, the web app at `http://localhost:3000`, and the worker consumes the Redis-backed operations queue.
