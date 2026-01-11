# Agentic Team Development Plan - LMS UI V2

> **Strategy:** Parallel AI agent development with clear boundaries and coordination
> **Phase:** Phase 1 (Foundation - Weeks 1-4)
> **Created:** 2026-01-07

## Table of Contents

1. [Team Structure](#team-structure)
2. [Agent Roles & Responsibilities](#agent-roles--responsibilities)
3. [Coordination Strategy](#coordination-strategy)
4. [File Ownership Matrix](#file-ownership-matrix)
5. [Agent Task Specifications](#agent-task-specifications)
6. [Communication Protocol](#communication-protocol)
7. [Integration Plan](#integration-plan)
8. [Quality Checklist](#quality-checklist)

---

## Team Structure

### Phase 1 Team (6 Agents + 1 Coordinator)

```
┌─────────────────────────────────────────────────────────────┐
│                    COORDINATOR AGENT                         │
│  - Reviews all PRs                                          │
│  - Resolves conflicts                                       │
│  - Ensures architectural compliance                         │
│  - Runs integration tests                                   │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────▼────────┐ ┌──────▼──────┐ ┌───────▼────────┐
│  AGENT 1         │ │  AGENT 2    │ │  AGENT 3       │
│  Scaffolder      │ │  Design Sys │ │  Auth System   │
└──────────────────┘ └─────────────┘ └────────────────┘
          │                 │                 │
┌─────────▼────────┐ ┌──────▼──────┐ ┌───────▼────────┐
│  AGENT 4         │ │  AGENT 5    │ │  AGENT 6       │
│  API Client      │ │  Testing    │ │  Offline Core  │
└──────────────────┘ └─────────────┘ └────────────────┘
```

### Work Distribution

**Week 1 (Parallel):**
- Agent 1: Project scaffolding
- Agent 2: Design system setup
- Agent 4: API client infrastructure
- Agent 5: Testing infrastructure

**Week 2 (Parallel):**
- Agent 3: Authentication system
- Agent 6: Offline core infrastructure

**Week 3-4 (Sequential):**
- Coordinator: Integration, testing, fixes

---

## Agent Roles & Responsibilities

### Agent 1: Scaffolder (Project Foundation)

**Primary Goal:** Set up project structure, dependencies, and configuration

**Responsibilities:**
- Initialize Vite + TypeScript project
- Install all dependencies from tech stack
- Create FSD folder structure
- Configure build tools (Vite, TypeScript)
- Configure linters (ESLint, Prettier)
- Set up environment variables
- Create base app shell (empty)

**Deliverables:**
- `package.json` with all dependencies
- `vite.config.ts` configured
- `tsconfig.json` configured
- `.eslintrc.cjs` with FSD plugin
- `.prettierrc` configured
- `src/` folder structure (empty folders for all FSD layers)
- `README.md` with setup instructions

**Branch:** `feat/project-scaffold`

**Estimated Time:** 1 week

---

### Agent 2: Design System Engineer (UI Foundation)

**Model:** Claude Opus 4.5 (for superior design system reasoning)

**Primary Goal:** Set up Tailwind CSS, shadcn/ui, and base UI components

**Responsibilities:**
- Configure Tailwind CSS with custom theme
- Install shadcn/ui CLI and components
- Create design tokens (colors, spacing, typography)
- Set up dark mode (class-based strategy)
- Create shared UI components in `shared/ui/`
- Create app layout components (`widgets/header/`, `widgets/layout/`)
- Document component usage

**Deliverables:**
- `tailwind.config.ts` with custom theme
- `src/app/styles/globals.css` with design tokens
- `src/shared/ui/` with shadcn components:
  - button, card, dialog, form, input, label
  - select, table, toast, tooltip, tabs, badge
- `src/widgets/header/` with Header component
- `src/widgets/layout/` with AppLayout component
- Dark mode toggle component
- Storybook (optional) or showcase page

**Dependencies:** Agent 1 (scaffolder) must complete first

**Branch:** `feat/design-system`

**Estimated Time:** 1 week

---

### Agent 3: Auth Engineer (Authentication System)

**Primary Goal:** Implement complete authentication system

**Responsibilities:**
- Create auth feature slice (`features/auth/`)
- Implement auth API client
- Create auth store (Zustand with persistence)
- Build login page and form
- Implement token refresh logic
- Build ProtectedRoute wrapper
- Create role-based routing
- Write auth tests

**Deliverables:**
- `src/features/auth/` complete
  - `api/authApi.ts` - login, logout, refresh, me
  - `model/authStore.ts` - Zustand store with persistence
  - `model/useAuth.ts` - Auth hook
  - `ui/LoginForm.tsx` - Login form component
  - `ui/LogoutButton.tsx` - Logout button
- `src/pages/auth/LoginPage.tsx` - Login page
- `src/app/router/guards.tsx` - ProtectedRoute
- Auth tests (unit + integration)

**Dependencies:** Agent 1 (scaffolder), Agent 2 (design system), Agent 4 (API client)

**Branch:** `feat/authentication`

**Estimated Time:** 1.5 weeks

---

### Agent 4: API Engineer (API Client Infrastructure)

**Primary Goal:** Set up API client with interceptors and type safety

**Responsibilities:**
- Create Axios client with interceptors
- Implement token refresh interceptor
- Create API endpoint constants
- Define common API types
- Set up TanStack Query provider
- Configure query defaults
- Create query persistence
- Write API client tests

**Deliverables:**
- `src/shared/api/client.ts` - Axios instance with interceptors
- `src/shared/api/endpoints.ts` - API endpoint constants
- `src/shared/api/types.ts` - Common API types (ApiResponse, ApiError, etc.)
- `src/app/providers/QueryProvider.tsx` - TanStack Query setup
- API client tests

**Dependencies:** Agent 1 (scaffolder)

**Branch:** `feat/api-client`

**Estimated Time:** 1 week

---

### Agent 5: Testing Engineer (Testing Infrastructure)

**Primary Goal:** Set up testing framework and utilities

**Responsibilities:**
- Configure Vitest
- Set up Testing Library
- Configure MSW (Mock Service Worker)
- Create test utilities (wrappers, factories)
- Set up Playwright for E2E
- Create test examples
- Configure CI for tests
- Document testing practices

**Deliverables:**
- `vitest.config.ts` configured
- `playwright.config.ts` configured
- `src/test/setup.ts` - Vitest setup
- `src/test/utils.tsx` - Test utilities (createWrapper, etc.)
- `src/test/mocks/` - MSW handlers
- `src/test/factories/` - Test data factories
- `.github/workflows/ci.yml` - CI pipeline
- `docs/TESTING_GUIDE.md` - Testing documentation

**Dependencies:** Agent 1 (scaffolder), Agent 4 (API client)

**Branch:** `feat/testing-infrastructure`

**Estimated Time:** 1 week

---

### Agent 6: Offline Engineer (Offline Core Infrastructure)

**Primary Goal:** Set up IndexedDB, Service Worker, and offline sync

**Responsibilities:**
- Create Dexie database schema
- Set up Service Worker with Workbox
- Implement offline sync engine
- Create online/offline detection hook
- Implement File System API wrapper for SCORM
- Create sync queue for offline mutations
- Write offline infrastructure tests

**Deliverables:**
- `src/shared/lib/storage/db.ts` - Dexie schema
- `src/shared/lib/storage/queries.ts` - IndexedDB helpers
- `src/shared/lib/storage/sync.ts` - Sync engine
- `src/shared/lib/storage/fileSystem.ts` - File System API wrapper
- `src/shared/hooks/useOnlineStatus.ts` - Online/offline hook
- `public/service-worker.js` - Service Worker
- `src/processes/offline-sync/` - Sync process
- Offline infrastructure tests

**Dependencies:** Agent 1 (scaffolder), Agent 4 (API client)

**Branch:** `feat/offline-infrastructure`

**Estimated Time:** 1.5 weeks

---

### Coordinator Agent (Integration & Quality)

**Primary Goal:** Integrate all agent work and ensure quality

**Responsibilities:**
- Review all PRs from agents
- Resolve merge conflicts
- Ensure architectural compliance (FSD rules)
- Run full test suite
- Run Lighthouse audits
- Fix integration issues
- Create integration branch
- Prepare for Phase 2

**Deliverables:**
- `develop` branch with all features integrated
- All tests passing
- ESLint passing (no errors)
- TypeScript compiling (no errors)
- Lighthouse score 90+
- Integration test suite
- Phase 1 completion report

**Dependencies:** All other agents

**Branch:** `develop` (integration branch)

**Estimated Time:** 1 week (after agents complete)

---

## Coordination Strategy

### 1. Branching Strategy

```
main (production)
  └── develop (integration branch)
        ├── feat/project-scaffold (Agent 1)
        ├── feat/design-system (Agent 2)
        ├── feat/authentication (Agent 3)
        ├── feat/api-client (Agent 4)
        ├── feat/testing-infrastructure (Agent 5)
        └── feat/offline-infrastructure (Agent 6)
```

### 2. Dependency Graph

```
Agent 1 (Scaffolder)
  ↓
├─→ Agent 2 (Design System)
├─→ Agent 4 (API Client)
│     ↓
│   ├─→ Agent 3 (Auth) ← also needs Agent 2
│   ├─→ Agent 5 (Testing)
│   └─→ Agent 6 (Offline)
│
└─→ Coordinator (after all complete)
```

**Execution Plan:**
1. **Week 1 Start:** Launch Agent 1 (Scaffolder)
2. **Week 1 Day 3:** Once scaffolding done, launch Agents 2, 4, 5 in parallel
3. **Week 2 Start:** Launch Agent 3 (Auth) after Agents 2 & 4 complete
4. **Week 2 Start:** Launch Agent 6 (Offline) after Agent 4 completes
5. **Week 3 Start:** Launch Coordinator after all agents complete
6. **Week 4 End:** Phase 1 complete

### 3. Communication Protocol

Each agent must:
1. **Start:** Create feature branch from `develop`
2. **Work:** Commit frequently with clear messages
3. **Update:** Pull from `develop` daily to stay in sync
4. **Document:** Update relevant docs (README, spec files)
5. **Test:** Ensure all tests pass before PR
6. **Complete:** Create PR with checklist completed
7. **Review:** Wait for Coordinator review

### 4. Conflict Prevention

**File Ownership:**
- Each agent owns specific directories (see matrix below)
- No agent should modify another agent's files
- Shared files (e.g., `package.json`) require coordination

**Coordination Points:**
- Agent 2 creates design tokens → Agent 3 uses them (no modification)
- Agent 4 creates API client → Agents 3, 6 use it (no modification)
- Agent 5 creates test utils → All agents use them (no modification)

---

## File Ownership Matrix

| Path | Owner | Other Agents Can |
|------|-------|------------------|
| `package.json` | Agent 1 | Read only (Coordinator merges) |
| `vite.config.ts` | Agent 1 | Read only |
| `tsconfig.json` | Agent 1 | Read only |
| `.eslintrc.cjs` | Agent 1 | Read only |
| `tailwind.config.ts` | Agent 2 | Read only |
| `src/app/styles/` | Agent 2 | Read only |
| `src/shared/ui/` | Agent 2 | Read only |
| `src/widgets/header/` | Agent 2 | Read only |
| `src/widgets/layout/` | Agent 2 | Read only |
| `src/features/auth/` | Agent 3 | Read only |
| `src/pages/auth/` | Agent 3 | Read only |
| `src/app/router/guards.tsx` | Agent 3 | Read only |
| `src/shared/api/` | Agent 4 | Read only |
| `src/app/providers/QueryProvider.tsx` | Agent 4 | Read only |
| `src/test/` | Agent 5 | Read only |
| `vitest.config.ts` | Agent 5 | Read only |
| `playwright.config.ts` | Agent 5 | Read only |
| `.github/workflows/` | Agent 5 | Read only |
| `src/shared/lib/storage/` | Agent 6 | Read only |
| `src/processes/offline-sync/` | Agent 6 | Read only |
| `public/service-worker.js` | Agent 6 | Read only |

---

## Agent Task Specifications

### Agent 1: Scaffolder - Detailed Spec

**Task:** Create project foundation

**Steps:**

1. **Initialize Project**
   ```bash
   cd /home/adam/github/lms_ui/1_lms_ui_v2
   pnpm create vite@latest . --template react-ts
   ```

2. **Install Dependencies**
   ```bash
   pnpm add react@^18.3.1 react-dom@^18.3.1
   pnpm add react-router-dom@^6.22.0
   pnpm add @tanstack/react-query@^5.17.0
   pnpm add @tanstack/react-query-devtools@^5.17.0
   pnpm add @tanstack/react-query-persist-client@^5.17.0
   pnpm add zustand@^4.5.0
   pnpm add axios@^1.7.0
   pnpm add react-hook-form@^7.51.0
   pnpm add zod@^3.23.0
   pnpm add @hookform/resolvers@^3.3.4
   pnpm add dexie@^4.0.0
   pnpm add idb-keyval@^6.2.1
   pnpm add workbox-core@^7.0.0
   pnpm add workbox-precaching@^7.0.0
   pnpm add workbox-routing@^7.0.0
   pnpm add workbox-strategies@^7.0.0
   pnpm add clsx@^2.1.0
   pnpm add tailwind-merge@^2.2.0
   pnpm add class-variance-authority@^0.7.0

   pnpm add -D typescript@^5.4.0
   pnpm add -D @types/node@^20.11.0
   pnpm add -D @types/react@^18.2.0
   pnpm add -D @types/react-dom@^18.2.0
   pnpm add -D vitest@^1.3.0
   pnpm add -D @testing-library/react@^14.2.0
   pnpm add -D @testing-library/user-event@^14.5.0
   pnpm add -D @testing-library/jest-dom@^6.4.0
   pnpm add -D @vitest/ui@^1.3.0
   pnpm add -D msw@^2.0.0
   pnpm add -D @playwright/test@^1.41.0
   pnpm add -D eslint@^8.57.0
   pnpm add -D @typescript-eslint/parser@^6.21.0
   pnpm add -D @typescript-eslint/eslint-plugin@^6.21.0
   pnpm add -D eslint-plugin-react-hooks@^4.6.0
   pnpm add -D eslint-plugin-boundaries@^4.2.0
   pnpm add -D prettier@^3.2.0
   pnpm add -D prettier-plugin-tailwindcss@^0.5.11
   ```

3. **Create FSD Folder Structure**
   ```bash
   mkdir -p src/{app,processes,pages,widgets,features,entities,shared}
   mkdir -p src/app/{providers,router,styles}
   mkdir -p src/shared/{api,ui,lib,hooks,config,types}
   mkdir -p src/shared/lib/{storage,scorm,permissions,utils}
   mkdir -p src/test/{mocks,utils,factories}
   mkdir -p docs/{adr,features}
   ```

4. **Configure TypeScript**
   Update `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "useDefineForClassFields": true,
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "skipLibCheck": true,
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx",
       "strict": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noFallthroughCasesInSwitch": true,
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"],
         "@/app/*": ["./src/app/*"],
         "@/processes/*": ["./src/processes/*"],
         "@/pages/*": ["./src/pages/*"],
         "@/widgets/*": ["./src/widgets/*"],
         "@/features/*": ["./src/features/*"],
         "@/entities/*": ["./src/entities/*"],
         "@/shared/*": ["./src/shared/*"],
         "@/test/*": ["./src/test/*"]
       }
     },
     "include": ["src"],
     "references": [{ "path": "./tsconfig.node.json" }]
   }
   ```

5. **Configure Vite**
   Update `vite.config.ts`:
   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import path from 'path';

   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
         '@/app': path.resolve(__dirname, './src/app'),
         '@/processes': path.resolve(__dirname, './src/processes'),
         '@/pages': path.resolve(__dirname, './src/pages'),
         '@/widgets': path.resolve(__dirname, './src/widgets'),
         '@/features': path.resolve(__dirname, './src/features'),
         '@/entities': path.resolve(__dirname, './src/entities'),
         '@/shared': path.resolve(__dirname, './src/shared'),
         '@/test': path.resolve(__dirname, './src/test'),
       },
     },
     server: {
       port: 5173,
     },
   });
   ```

6. **Configure ESLint**
   Create `.eslintrc.cjs`:
   ```javascript
   module.exports = {
     root: true,
     env: { browser: true, es2020: true },
     extends: [
       'eslint:recommended',
       'plugin:@typescript-eslint/recommended',
       'plugin:react-hooks/recommended',
     ],
     ignorePatterns: ['dist', '.eslintrc.cjs'],
     parser: '@typescript-eslint/parser',
     plugins: ['react-refresh', 'boundaries'],
     rules: {
       'react-refresh/only-export-components': [
         'warn',
         { allowConstantExport: true },
       ],
       '@typescript-eslint/no-explicit-any': 'error',
       '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

       // FSD layer boundaries
       'boundaries/element-types': ['error', {
         default: 'disallow',
         rules: [
           { from: 'app', allow: ['processes', 'pages', 'widgets', 'features', 'entities', 'shared'] },
           { from: 'processes', allow: ['pages', 'widgets', 'features', 'entities', 'shared'] },
           { from: 'pages', allow: ['widgets', 'features', 'entities', 'shared'] },
           { from: 'widgets', allow: ['features', 'entities', 'shared'] },
           { from: 'features', allow: ['entities', 'shared'] },
           { from: 'entities', allow: ['shared'] },
           { from: 'shared', allow: [] },
         ],
       }],
     },
     settings: {
       'boundaries/elements': [
         { type: 'app', pattern: 'src/app/*' },
         { type: 'processes', pattern: 'src/processes/*' },
         { type: 'pages', pattern: 'src/pages/*' },
         { type: 'widgets', pattern: 'src/widgets/*' },
         { type: 'features', pattern: 'src/features/*' },
         { type: 'entities', pattern: 'src/entities/*' },
         { type: 'shared', pattern: 'src/shared/*' },
       ],
     },
   };
   ```

7. **Configure Prettier**
   Create `.prettierrc`:
   ```json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 100,
     "tabWidth": 2,
     "useTabs": false,
     "plugins": ["prettier-plugin-tailwindcss"]
   }
   ```

8. **Update package.json Scripts**
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build",
       "preview": "vite preview",
       "test": "vitest run",
       "test:watch": "vitest watch",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest run --coverage",
       "e2e": "playwright test",
       "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
       "lint:fix": "eslint . --ext ts,tsx --fix",
       "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
       "typecheck": "tsc --noEmit"
     }
   }
   ```

9. **Create Environment Files**
   Create `.env.local`:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api/v2
   VITE_SENTRY_DSN=
   VITE_ENV=development
   ```

10. **Create Base App Shell**
    Create `src/app/index.tsx`:
    ```typescript
    import React from 'react';

    export const App: React.FC = () => {
      return (
        <div className="min-h-screen bg-background">
          <h1 className="text-4xl font-bold">LMS UI V2</h1>
          <p className="text-muted-foreground">Foundation ready for development</p>
        </div>
      );
    };
    ```

    Create `src/main.tsx`:
    ```typescript
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import { App } from './app';
    import './app/styles/globals.css';

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    ```

11. **Create README**
    Update `README.md` with setup instructions

12. **Commit and Push**
    ```bash
    git checkout -b feat/project-scaffold
    git add .
    git commit -m "feat(scaffold): initialize project with FSD structure"
    git push origin feat/project-scaffold
    ```

**Acceptance Criteria:**
- [ ] Project builds successfully (`pnpm build`)
- [ ] Dev server runs (`pnpm dev`)
- [ ] All dependencies installed
- [ ] FSD folder structure created
- [ ] ESLint configured and passes
- [ ] TypeScript compiles with no errors
- [ ] README with setup instructions

---

### Agent 2: Design System - Detailed Spec

**Model:** Claude Opus 4.5

**Task:** Set up Tailwind CSS, shadcn/ui, and base components

**Dependencies:** Agent 1 must complete first

**Steps:**

1. **Install Tailwind CSS**
   ```bash
   pnpm add -D tailwindcss@^3.4.0 postcss autoprefixer
   pnpm add -D @tailwindcss/forms @tailwindcss/typography
   npx tailwindcss init -p
   ```

2. **Configure Tailwind**
   Update `tailwind.config.ts`:
   ```typescript
   import type { Config } from 'tailwindcss';

   export default {
     darkMode: ['class'],
     content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
     theme: {
       extend: {
         colors: {
           border: 'hsl(var(--border))',
           input: 'hsl(var(--input))',
           ring: 'hsl(var(--ring))',
           background: 'hsl(var(--background))',
           foreground: 'hsl(var(--foreground))',
           primary: {
             DEFAULT: 'hsl(var(--primary))',
             foreground: 'hsl(var(--primary-foreground))',
           },
           secondary: {
             DEFAULT: 'hsl(var(--secondary))',
             foreground: 'hsl(var(--secondary-foreground))',
           },
           destructive: {
             DEFAULT: 'hsl(var(--destructive))',
             foreground: 'hsl(var(--destructive-foreground))',
           },
           muted: {
             DEFAULT: 'hsl(var(--muted))',
             foreground: 'hsl(var(--muted-foreground))',
           },
           accent: {
             DEFAULT: 'hsl(var(--accent))',
             foreground: 'hsl(var(--accent-foreground))',
           },
           popover: {
             DEFAULT: 'hsl(var(--popover))',
             foreground: 'hsl(var(--popover-foreground))',
           },
           card: {
             DEFAULT: 'hsl(var(--card))',
             foreground: 'hsl(var(--card-foreground))',
           },
         },
         borderRadius: {
           lg: 'var(--radius)',
           md: 'calc(var(--radius) - 2px)',
           sm: 'calc(var(--radius) - 4px)',
         },
       },
     },
     plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
   } satisfies Config;
   ```

3. **Create globals.css**
   Create `src/app/styles/globals.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   @layer base {
     :root {
       --background: 0 0% 100%;
       --foreground: 222.2 84% 4.9%;
       --card: 0 0% 100%;
       --card-foreground: 222.2 84% 4.9%;
       --popover: 0 0% 100%;
       --popover-foreground: 222.2 84% 4.9%;
       --primary: 221.2 83.2% 53.3%;
       --primary-foreground: 210 40% 98%;
       --secondary: 210 40% 96.1%;
       --secondary-foreground: 222.2 47.4% 11.2%;
       --muted: 210 40% 96.1%;
       --muted-foreground: 215.4 16.3% 46.9%;
       --accent: 210 40% 96.1%;
       --accent-foreground: 222.2 47.4% 11.2%;
       --destructive: 0 84.2% 60.2%;
       --destructive-foreground: 210 40% 98%;
       --border: 214.3 31.8% 91.4%;
       --input: 214.3 31.8% 91.4%;
       --ring: 221.2 83.2% 53.3%;
       --radius: 0.5rem;
     }

     .dark {
       --background: 222.2 84% 4.9%;
       --foreground: 210 40% 98%;
       --card: 222.2 84% 4.9%;
       --card-foreground: 210 40% 98%;
       --popover: 222.2 84% 4.9%;
       --popover-foreground: 210 40% 98%;
       --primary: 217.2 91.2% 59.8%;
       --primary-foreground: 222.2 47.4% 11.2%;
       --secondary: 217.2 32.6% 17.5%;
       --secondary-foreground: 210 40% 98%;
       --muted: 217.2 32.6% 17.5%;
       --muted-foreground: 215 20.2% 65.1%;
       --accent: 217.2 32.6% 17.5%;
       --accent-foreground: 210 40% 98%;
       --destructive: 0 62.8% 30.6%;
       --destructive-foreground: 210 40% 98%;
       --border: 217.2 32.6% 17.5%;
       --input: 217.2 32.6% 17.5%;
       --ring: 224.3 76.3% 48%;
     }
   }

   @layer base {
     * {
       @apply border-border;
     }
     body {
       @apply bg-background text-foreground;
     }
   }
   ```

4. **Install shadcn/ui**
   ```bash
   npx shadcn-ui@latest init
   ```

   Select:
   - TypeScript: Yes
   - Style: Default
   - Base color: Slate
   - Global CSS: src/app/styles/globals.css
   - CSS variables: Yes
   - Tailwind config: tailwind.config.ts
   - Components: src/shared/ui
   - Utils: src/shared/lib/utils
   - React Server Components: No

5. **Add shadcn/ui Components**
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add dropdown-menu
   npx shadcn-ui@latest add form
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add label
   npx shadcn-ui@latest add select
   npx shadcn-ui@latest add table
   npx shadcn-ui@latest add toast
   npx shadcn-ui@latest add tooltip
   npx shadcn-ui@latest add tabs
   npx shadcn-ui@latest add badge
   npx shadcn-ui@latest add avatar
   npx shadcn-ui@latest add separator
   npx shadcn-ui@latest add skeleton
   ```

6. **Create cn Utility** (if not created by shadcn)
   Create `src/shared/lib/utils/cn.ts`:
   ```typescript
   import { type ClassValue, clsx } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

7. **Create Dark Mode Toggle**
   Create `src/features/theme/model/themeStore.ts`:
   ```typescript
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';

   type Theme = 'light' | 'dark';

   interface ThemeState {
     theme: Theme;
     setTheme: (theme: Theme) => void;
     toggleTheme: () => void;
   }

   export const useThemeStore = create<ThemeState>()(
     persist(
       (set) => ({
         theme: 'light',
         setTheme: (theme) => {
           set({ theme });
           document.documentElement.classList.toggle('dark', theme === 'dark');
         },
         toggleTheme: () =>
           set((state) => {
             const newTheme = state.theme === 'light' ? 'dark' : 'light';
             document.documentElement.classList.toggle('dark', newTheme === 'dark');
             return { theme: newTheme };
           }),
       }),
       {
         name: 'theme-storage',
       }
     )
   );
   ```

   Create `src/features/theme/ui/ThemeToggle.tsx`:
   ```typescript
   import React from 'react';
   import { Moon, Sun } from 'lucide-react';
   import { Button } from '@/shared/ui/button';
   import { useThemeStore } from '../model/themeStore';

   export const ThemeToggle: React.FC = () => {
     const { theme, toggleTheme } = useThemeStore();

     return (
       <Button
         variant="ghost"
         size="icon"
         onClick={toggleTheme}
         aria-label="Toggle theme"
       >
         {theme === 'light' ? (
           <Moon className="h-5 w-5" />
         ) : (
           <Sun className="h-5 w-5" />
         )}
       </Button>
     );
   };
   ```

8. **Create Header Widget**
   Create `src/widgets/header/Header.tsx`:
   ```typescript
   import React from 'react';
   import { ThemeToggle } from '@/features/theme/ui/ThemeToggle';

   export const Header: React.FC = () => {
     return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-14 items-center">
           <div className="mr-4 flex">
             <a href="/" className="mr-6 flex items-center space-x-2">
               <span className="font-bold">LMS UI V2</span>
             </a>
           </div>
           <div className="flex flex-1 items-center justify-end space-x-2">
             <nav className="flex items-center space-x-2">
               <ThemeToggle />
             </nav>
           </div>
         </div>
       </header>
     );
   };
   ```

9. **Create App Layout Widget**
   Create `src/widgets/layout/AppLayout.tsx`:
   ```typescript
   import React from 'react';
   import { Header } from '@/widgets/header/Header';

   interface AppLayoutProps {
     children: React.ReactNode;
   }

   export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
     return (
       <div className="relative min-h-screen flex flex-col">
         <Header />
         <main className="flex-1 container py-6">{children}</main>
       </div>
     );
   };
   ```

10. **Update App Component**
    Update `src/app/index.tsx`:
    ```typescript
    import React from 'react';
    import { AppLayout } from '@/widgets/layout/AppLayout';

    export const App: React.FC = () => {
      return (
        <AppLayout>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">LMS UI V2</h1>
            <p className="text-muted-foreground">
              Design system ready for development
            </p>
          </div>
        </AppLayout>
      );
    };
    ```

11. **Create Component Showcase Page** (optional)
    Create `src/pages/design/DesignShowcasePage.tsx` demonstrating all components

12. **Commit and Push**
    ```bash
    git checkout -b feat/design-system
    git add .
    git commit -m "feat(design): setup Tailwind CSS and shadcn/ui"
    git push origin feat/design-system
    ```

**Acceptance Criteria:**
- [ ] Tailwind CSS configured and working
- [ ] All shadcn/ui components installed
- [ ] Dark mode toggle functional
- [ ] Header and layout components created
- [ ] Design tokens defined in globals.css
- [ ] Components are accessible (keyboard nav, ARIA)
- [ ] App renders with new design system

---

### Agent 3: Auth Engineer - Detailed Spec

**Task:** Implement authentication system

**Dependencies:** Agent 1 (scaffolder), Agent 2 (design system), Agent 4 (API client)

**Steps:**

1. **Create Auth Feature Slice Structure**
   ```bash
   mkdir -p src/features/auth/{api,model,ui}
   mkdir -p src/pages/auth
   ```

2. **Define Auth Types**
   Create `src/features/auth/model/types.ts`:
   ```typescript
   export type Role = 'learner' | 'staff' | 'global-admin';

   export interface LoginCredentials {
     email: string;
     password: string;
   }

   export interface AuthResponse {
     accessToken: string;
     role: Role;
     roles: Role[];
   }

   export interface User {
     _id: string;
     email: string;
     roles: Role[];
   }
   ```

3. **Implement Auth API**
   Create `src/features/auth/api/authApi.ts`:
   ```typescript
   import { client } from '@/shared/api/client';
   import { endpoints } from '@/shared/api/endpoints';
   import type { LoginCredentials, AuthResponse, User } from '../model/types';

   export const authApi = {
     login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
       const response = await client.post(endpoints.auth.login, credentials);
       return response.data;
     },

     refresh: async (): Promise<{ accessToken: string }> => {
       const response = await client.post(endpoints.auth.refresh);
       return response.data;
     },

     logout: async (): Promise<void> => {
       await client.post(endpoints.auth.logout);
     },

     me: async (): Promise<User> => {
       const response = await client.get(endpoints.auth.me);
       return response.data;
     },
   };
   ```

4. **Create Auth Store**
   Create `src/features/auth/model/authStore.ts`:
   ```typescript
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';
   import { authApi } from '../api/authApi';
   import type { Role, LoginCredentials } from './types';

   interface AuthState {
     accessToken: string | null;
     role: Role | null;
     roles: Role[];
     isAuthenticated: boolean;

     login: (credentials: LoginCredentials) => Promise<void>;
     logout: () => Promise<void>;
     refreshToken: () => Promise<void>;
     hasPermission: (permission: string) => boolean;
     setToken: (token: string) => void;
   }

   export const useAuthStore = create<AuthState>()(
     persist(
       (set, get) => ({
         accessToken: null,
         role: null,
         roles: [],
         isAuthenticated: false,

         login: async (credentials) => {
           const response = await authApi.login(credentials);
           set({
             accessToken: response.accessToken,
             role: response.role,
             roles: response.roles,
             isAuthenticated: true,
           });
         },

         logout: async () => {
           try {
             await authApi.logout();
           } finally {
             set({
               accessToken: null,
               role: null,
               roles: [],
               isAuthenticated: false,
             });
           }
         },

         refreshToken: async () => {
           const response = await authApi.refresh();
           set({ accessToken: response.accessToken });
         },

         hasPermission: (permission) => {
           // TODO: Implement permission checking logic
           return true;
         },

         setToken: (token) => set({ accessToken: token }),
       }),
       {
         name: 'auth-storage',
         partialize: (state) => ({
           accessToken: state.accessToken,
           role: state.role,
           roles: state.roles,
         }),
       }
     )
   );
   ```

5. **Create Auth Hook**
   Create `src/features/auth/model/useAuth.ts`:
   ```typescript
   import { useAuthStore } from './authStore';

   export const useAuth = () => {
     return useAuthStore();
   };
   ```

6. **Create Login Form**
   Create `src/features/auth/ui/LoginForm.tsx`:
   ```typescript
   import React from 'react';
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { z } from 'zod';
   import { Button } from '@/shared/ui/button';
   import { Input } from '@/shared/ui/input';
   import { Label } from '@/shared/ui/label';
   import { useAuth } from '../model/useAuth';
   import { useNavigate } from 'react-router-dom';

   const loginSchema = z.object({
     email: z.string().email('Invalid email address'),
     password: z.string().min(6, 'Password must be at least 6 characters'),
   });

   type LoginFormData = z.infer<typeof loginSchema>;

   export const LoginForm: React.FC = () => {
     const { login } = useAuth();
     const navigate = useNavigate();
     const [error, setError] = React.useState<string | null>(null);

     const {
       register,
       handleSubmit,
       formState: { errors, isSubmitting },
     } = useForm<LoginFormData>({
       resolver: zodResolver(loginSchema),
     });

     const onSubmit = async (data: LoginFormData) => {
       try {
         setError(null);
         await login(data);
         navigate('/dashboard');
       } catch (err) {
         setError('Invalid email or password');
       }
     };

     return (
       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
         <div className="space-y-2">
           <Label htmlFor="email">Email</Label>
           <Input
             id="email"
             type="email"
             placeholder="you@example.com"
             {...register('email')}
           />
           {errors.email && (
             <p className="text-sm text-destructive">{errors.email.message}</p>
           )}
         </div>

         <div className="space-y-2">
           <Label htmlFor="password">Password</Label>
           <Input
             id="password"
             type="password"
             placeholder="••••••••"
             {...register('password')}
           />
           {errors.password && (
             <p className="text-sm text-destructive">{errors.password.message}</p>
           )}
         </div>

         {error && <p className="text-sm text-destructive">{error}</p>}

         <Button type="submit" className="w-full" disabled={isSubmitting}>
           {isSubmitting ? 'Logging in...' : 'Log in'}
         </Button>
       </form>
     );
   };
   ```

7. **Create Login Page**
   Create `src/pages/auth/LoginPage.tsx`:
   ```typescript
   import React from 'react';
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
   import { LoginForm } from '@/features/auth/ui/LoginForm';

   export const LoginPage: React.FC = () => {
     return (
       <div className="flex min-h-screen items-center justify-center">
         <Card className="w-full max-w-md">
           <CardHeader>
             <CardTitle>Welcome back</CardTitle>
             <CardDescription>Log in to your LMS account</CardDescription>
           </CardHeader>
           <CardContent>
             <LoginForm />
           </CardContent>
         </Card>
       </div>
     );
   };
   ```

8. **Create Protected Route**
   Create `src/app/router/guards.tsx`:
   ```typescript
   import React from 'react';
   import { Navigate } from 'react-router-dom';
   import { useAuth } from '@/features/auth/model/useAuth';
   import type { Role } from '@/features/auth/model/types';

   interface ProtectedRouteProps {
     children: React.ReactNode;
     roles?: Role[];
   }

   export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
     const { isAuthenticated, role } = useAuth();

     if (!isAuthenticated) {
       return <Navigate to="/login" replace />;
     }

     if (roles && role && !roles.includes(role)) {
       return <Navigate to="/unauthorized" replace />;
     }

     return <>{children}</>;
   };
   ```

9. **Create Logout Button**
   Create `src/features/auth/ui/LogoutButton.tsx`:
   ```typescript
   import React from 'react';
   import { useNavigate } from 'react-router-dom';
   import { Button } from '@/shared/ui/button';
   import { useAuth } from '../model/useAuth';

   export const LogoutButton: React.FC = () => {
     const { logout } = useAuth();
     const navigate = useNavigate();

     const handleLogout = async () => {
       await logout();
       navigate('/login');
     };

     return (
       <Button variant="ghost" onClick={handleLogout}>
         Log out
       </Button>
     );
   };
   ```

10. **Set Up Router**
    Create `src/app/router/index.tsx`:
    ```typescript
    import React from 'react';
    import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
    import { LoginPage } from '@/pages/auth/LoginPage';
    import { ProtectedRoute } from './guards';

    // Placeholder pages
    const DashboardPage = () => <div>Dashboard (TODO)</div>;

    export const AppRouter: React.FC = () => {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      );
    };
    ```

11. **Update App Component**
    Update `src/app/index.tsx`:
    ```typescript
    import React from 'react';
    import { AppRouter } from './router';

    export const App: React.FC = () => {
      return <AppRouter />;
    };
    ```

12. **Write Tests**
    Create `src/features/auth/model/authStore.test.ts`:
    ```typescript
    import { describe, it, expect, beforeEach, vi } from 'vitest';
    import { useAuthStore } from './authStore';
    import { authApi } from '../api/authApi';

    vi.mock('../api/authApi');

    describe('authStore', () => {
      beforeEach(() => {
        useAuthStore.setState({
          accessToken: null,
          role: null,
          roles: [],
          isAuthenticated: false,
        });
        vi.clearAllMocks();
      });

      it('should login successfully', async () => {
        vi.mocked(authApi.login).mockResolvedValue({
          accessToken: 'token123',
          role: 'learner',
          roles: ['learner'],
        });

        await useAuthStore.getState().login({
          email: 'test@example.com',
          password: 'password',
        });

        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().accessToken).toBe('token123');
        expect(useAuthStore.getState().role).toBe('learner');
      });

      it('should logout successfully', async () => {
        useAuthStore.setState({
          accessToken: 'token123',
          role: 'learner',
          roles: ['learner'],
          isAuthenticated: true,
        });

        await useAuthStore.getState().logout();

        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().accessToken).toBe(null);
      });
    });
    ```

13. **Commit and Push**
    ```bash
    git checkout -b feat/authentication
    git add .
    git commit -m "feat(auth): implement authentication system"
    git push origin feat/authentication
    ```

**Acceptance Criteria:**
- [ ] Login form works with validation
- [ ] Login API integration functional
- [ ] Auth store persists to localStorage
- [ ] Protected routes redirect unauthenticated users
- [ ] Logout clears auth state
- [ ] Router configured with auth guards
- [ ] Auth tests pass

---

## Communication Protocol

### Daily Standups (Async)

Each agent should post a daily update:

```markdown
**Agent:** [Agent Name]
**Date:** YYYY-MM-DD
**Progress:**
- ✅ Completed: [tasks]
- 🚧 In Progress: [tasks]
- 🚫 Blocked: [blockers]

**Questions:** [any questions for coordinator or other agents]
```

### PR Template

```markdown
## Description
[Brief description of changes]

## Agent
[Agent number and name]

## Related Specifications
- [ ] FSD_IMPLEMENTATION_SPEC.md § [section]
- [ ] AGENTIC_TEAM_PLAN.md § [section]

## Changes
- [List of key changes]

## Dependencies
- [ ] Depends on PR #[number] (Agent X)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows FSD architecture
- [ ] ESLint passes (no errors)
- [ ] TypeScript compiles (no errors)
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No merge conflicts with develop
- [ ] Reviewed own code

## Screenshots (if UI changes)
[Add screenshots]
```

---

## Integration Plan

### Week 3: Integration Phase

**Coordinator Tasks:**

1. **Day 1-2: Review & Merge**
   - Review all agent PRs
   - Check for architectural compliance
   - Check for conflicts
   - Merge in order: 1 → 4 → 2 → 5 → 3 → 6

2. **Day 3-4: Integration Testing**
   - Run full test suite
   - Fix integration issues
   - Test complete auth flow (login → dashboard → logout)
   - Test dark mode toggle
   - Test offline detection

3. **Day 5: Quality Assurance**
   - Run Lighthouse audits
   - Fix accessibility issues
   - Optimize bundle size
   - Check ESLint (should be 0 errors)
   - Check TypeScript (should compile)

4. **Week 4: Documentation & Handoff**
   - Update README with current state
   - Document any deviations from spec
   - Create Phase 1 completion report
   - Prepare for Phase 2 (Learner Dashboard)

---

## Quality Checklist

Each agent must ensure their work meets these criteria before submitting PR:

### Code Quality
- [ ] No TypeScript `any` types (use `unknown` if needed)
- [ ] No ESLint errors (warnings OK if justified)
- [ ] No unused imports or variables
- [ ] Consistent naming conventions
- [ ] JSDoc comments on public APIs

### Architecture
- [ ] Follows FSD layer structure
- [ ] No cross-layer violations (enforced by ESLint)
- [ ] Files in correct directories
- [ ] Public API exported via index.ts

### Testing
- [ ] Unit tests for business logic (70%+ coverage)
- [ ] Component tests for UI
- [ ] Tests pass locally
- [ ] Tests pass in CI

### Accessibility
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA

### Performance
- [ ] No unnecessary re-renders
- [ ] Heavy components lazy loaded
- [ ] Images optimized (if applicable)
- [ ] Bundle size impact < 100KB

### Documentation
- [ ] README updated (if needed)
- [ ] Specification updated (if behavior changed)
- [ ] JSDoc on public functions
- [ ] Complex logic commented

---

## Next Steps

Once Phase 1 is complete, the team will move to Phase 2: Learner Dashboard

**Phase 2 Agents:**
1. Course Entity Engineer
2. Content Entity Engineer
3. Enrollment Feature Engineer
4. Learner Dashboard Page Engineer

**Timeline:** Weeks 5-8

---

**End of Agentic Team Plan**
