# ADR 003 — Offline-First with IndexedDB

**Status:** Accepted  
**Date:** 2026-05

## Context
Target users operate on prepaid mobile data with frequent disconnections. Data loss during disconnection is unacceptable for commerce transactions.

## Decision
All writes go to **IndexedDB first** (via Dexie.js on web; expo-sqlite on mobile). A sync queue batches changes and uploads delta mutations when connectivity is stable.

## Consequences
- Max local write latency: 15ms (no network round-trip)
- App is fully operational offline
- Sync conflicts resolved with last-write-wins + timestamp
- Server is always the eventual source of truth, never the required real-time source
