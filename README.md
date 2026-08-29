# Samarth Mess — Mess Management Platform MVP

Mobile-first Mess Management Platform for students/professionals and mess owners, with an administrative management panel.

## Monorepo Architecture

This monorepo is managed using **Turborepo** and **pnpm** workspaces:

```text
samarth-mess/
├── apps/
│   ├── web/         # Next.js frontend application (Student, Owner, Admin UI)
│   └── api/         # Express & Node.js backend API
├── packages/
│   ├── db/          # Database connection, Drizzle schema, and migrations
│   ├── types/       # Shared TypeScript types and contracts
│   ├── validation/  # Shared runtime validation (Zod schemas)
│   ├── config/      # Shared configs and environment parsers
│   └── shared/      # Shared utility functions and constants
├── docs/            # Product requirements and progress tracking
├── .github/         # CI/CD workflows
├── package.json     # Workspace root configuration
└── turbo.json       # Turborepo pipeline configuration
```

## Getting Started

### Prerequisites

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Docker**: For local PostgreSQL setup

### Local Setup

1. **Clone repository and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Start local services and run development server:**
   ```bash
   pnpm dev
   ```

4. **Build and test:**
   ```bash
   pnpm build
   pnpm check-types
   pnpm lint
   ```
