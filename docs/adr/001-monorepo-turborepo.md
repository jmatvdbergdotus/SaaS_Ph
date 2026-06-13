# ADR 001 — Monorepo with Turborepo

**Status:** Accepted  
**Date:** 2026-05

## Context
The project ships three surfaces (mobile, web, API) that share types and business logic. Managing these as separate repos creates drift between type definitions and duplicates utility code.

## Decision
Use a **pnpm workspace monorepo** orchestrated by **Turborepo** for build caching and task pipelines.

## Consequences
- Single `pnpm install` across all apps
- `packages/core` is the single source of truth for all types and business logic
- Build cache speeds up CI significantly
- All apps stay in sync on type definitions automatically
