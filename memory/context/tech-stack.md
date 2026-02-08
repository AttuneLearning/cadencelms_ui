---
title: Tech Stack
created: 2026-02-08
tags: [context, tech]
---

# Tech Stack

## Frontend
- **React 18** with TypeScript
- **Vite** build tool
- **React Router DOM** for routing
- **TanStack React Query** for server state
- **Zustand** for client state
- **React Hook Form** + Zod for forms/validation
- **Axios** for HTTP

## UI
- **Tailwind CSS** with tailwindcss-animate
- **Radix UI** primitives (shadcn/ui pattern)
- **Lucide React** icons
- **Recharts** for data visualization
- **DnD Kit** for drag and drop
- **class-variance-authority** + clsx + tailwind-merge

## Testing
- **Vitest** + jsdom for unit tests
- **Testing Library** (React + user-event)
- **MSW** for API mocking
- **Playwright** for E2E tests
- **@vitest/coverage-v8** for coverage

## Offline/PWA
- **Workbox** (core, precaching, routing, strategies)
- **Dexie** (IndexedDB wrapper) + idb-keyval

## Architecture
- **Feature-Sliced Design (FSD)**: entities → features → widgets → pages
- **eslint-plugin-boundaries** enforces import rules
