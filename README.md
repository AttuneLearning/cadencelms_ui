# LMS UI V2

Modern Learning Management System UI built with React, TypeScript, and Feature-Sliced Design (FSD).

## Architecture

This project follows the Feature-Sliced Design (FSD) methodology, organizing code into layers:

- `app/` - Application initialization, providers, routing
- `processes/` - Complex business workflows spanning multiple pages
- `pages/` - Application pages/routes
- `widgets/` - Large standalone features
- `features/` - User interactions and business features
- `entities/` - Business entities (models, api, stores)
- `shared/` - Reusable utilities, UI components, and libs

## Tech Stack

### Core
- **React 18.3** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 5.4** - Build tool and dev server
- **React Router 6.30** - Routing

### State Management
- **Zustand 4.5** - Global state management
- **TanStack Query 5.90** - Server state management
- **React Hook Form 7.70** - Form state management
- **Zod 3.25** - Schema validation

### Data & Offline
- **Dexie 4.2** - IndexedDB wrapper
- **Workbox 7.4** - Service Worker utilities
- **idb-keyval 6.2** - Simple key-value storage

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS
- **class-variance-authority 0.7** - Variant-based styling
- **clsx 2.1** & **tailwind-merge 2.6** - Conditional classes
- **Lucide React 0.356** - Icon library

### Development & Testing
- **ESLint 8.57** - Linting
- **Prettier 3.7** - Code formatting
- **Vitest 1.6** - Unit testing
- **Testing Library 14.3** - React testing
- **Playwright 1.57** - E2E testing
- **MSW 2.12** - API mocking

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/petcom/lms_ui_v2.git
cd lms_ui_v2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v2
VITE_SENTRY_DSN=
VITE_ENV=development
```

### 4. Start development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Type check with TypeScript

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report
- `npm run e2e` - Run E2E tests with Playwright

## Project Structure

```
src/
├── app/                    # Application layer
│   ├── providers/         # Context providers
│   ├── router/            # Routing configuration
│   └── styles/            # Global styles
├── processes/             # Complex workflows
├── pages/                 # Application pages
├── widgets/               # Large features
├── features/              # Business features
├── entities/              # Business entities
├── shared/                # Shared resources
│   ├── api/              # API clients
│   ├── ui/               # UI components
│   ├── lib/              # Utilities
│   │   ├── storage/     # Storage utilities
│   │   ├── scorm/       # SCORM utilities
│   │   ├── permissions/ # Permission utilities
│   │   └── utils/       # General utilities
│   ├── hooks/            # Shared hooks
│   ├── config/           # Configuration
│   └── types/            # Shared types
└── test/                  # Test utilities
    ├── mocks/            # Test mocks
    ├── utils/            # Test utilities
    └── factories/        # Test factories
```

## FSD Layer Rules

The project enforces strict layer dependencies using ESLint:

- `app` → can import from: processes, pages, widgets, features, entities, shared
- `processes` → can import from: pages, widgets, features, entities, shared
- `pages` → can import from: widgets, features, entities, shared
- `widgets` → can import from: features, entities, shared
- `features` → can import from: entities, shared
- `entities` → can import from: shared
- `shared` → cannot import from other layers

## Code Style

The project uses:
- **ESLint** for code quality and FSD boundaries
- **Prettier** with Tailwind plugin for formatting
- **TypeScript** strict mode
- No explicit `any` types allowed

Run checks before committing:

```bash
npm run typecheck
npm run lint
npm run format
```

## Testing Strategy

### Unit Tests (Vitest)
- Test individual components and functions
- Mock external dependencies
- Fast feedback during development

### E2E Tests (Playwright)
- Test complete user workflows
- Run against production build
- Verify critical paths

## Contributing

1. Create a feature branch from `master`
2. Make your changes following the FSD architecture
3. Ensure all tests pass and code is formatted
4. Submit a pull request

## License

ISC

## Related Repositories

- Backend API: [cadencelms_api](https://github.com/petcom/cadencelms_api)
- Legacy UI: [lms_ui](https://github.com/petcom/lms_ui)
