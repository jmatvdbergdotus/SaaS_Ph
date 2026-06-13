# ADR 004 — Client-Side OCR with Tesseract.js

**Status:** Accepted  
**Date:** 2026-05

## Context
Merchants upload GCash/Maya payment screenshots to verify transactions. Sending screenshots to a server creates privacy risk (customer payment data), latency, and cost.

## Decision
Run **Tesseract.js** (WASM build) entirely on-device in the browser/React Native context.

## Consequences
- Zero payment screenshot data transmitted to servers
- Target parse time: ≤ 150ms on 3GB Android
- No server compute cost for OCR
- Requires Tesseract.js lite build (~1.4MB) — acceptable one-time load, cached after first use
- Fallback: manual reference number entry if OCR confidence < 0.6
