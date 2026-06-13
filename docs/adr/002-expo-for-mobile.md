# ADR 002 — Expo for Mobile

**Status:** Accepted  
**Date:** 2026-05

## Context
Need Android + iOS from a single codebase. Target device is 3GB RAM Android (Realme C-series).

## Decision
Use **Expo (managed workflow)** with **Expo Router v3** for file-based navigation.

## Consequences
- EAS Build handles APK/AAB generation without local Android Studio setup
- Expo Camera and ImagePicker give OCR screenshot access with minimal config
- Expo SQLite available if IndexedDB-equivalent needed natively
- Can eject to bare workflow if deep native module access becomes necessary
