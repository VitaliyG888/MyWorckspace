# ADR 0001 — Modular monolith

Status: accepted  
Date: 2026-11-02

Use a single Next.js app with isolated modules instead of microservices.

Reason: one working end-to-end path is more valuable than distributed infrastructure. File-backed storage is an explicit MVP constraint, not a fake database.
