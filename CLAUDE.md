# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size (sets ANALYZE=true && npm run build)

### Testing
No test framework is currently configured in this project.

## Architecture Overview

This is a Next.js 14 App Router application called "StayFocus" (previously "painel-neurodivergentes") - a productivity and organization tool designed for neurodivergent individuals. The app is structured around different life management categories.

### Core Structure

**State Management**: Uses Zustand with persistence for all application state. Each feature area has its own store in `/app/stores/`:
- `alimentacaoStore.ts` - Food/nutrition tracking
- `estudosStore.ts` - Study sessions and materials  
- `saudeStore.ts` - Health and mood monitoring
- `receitasStore.ts` - Recipe management
- `concursosStore.ts` - Exam/competition preparation
- `financasStore.ts` - Financial tracking
- `hiperfocosStore.ts` - Hyperfocus management
- Plus others for specific features

**Page Structure**: Main feature areas organized as top-level routes:
- `/` - Dashboard/home with daily overview
- `/alimentacao` - Food tracking and hydration
- `/receitas` - Recipe management (separate from alimentacao)
- `/estudos` - Study tracking, materials, Pomodoro timer
- `/saude` - Health monitoring, mood tracking, medications
- `/lazer` - Leisure activities and rest suggestions
- `/financas` - Expense tracking and budget management
- `/hiperfocos` - Project management for hyperfocus cycles
- `/concursos` - Exam preparation with questions and simulations
- `/perfil` - User preferences and settings

**Component Organization**: Components are organized by feature area under `/app/components/`:
- `/layout/` - Header, Footer, Sidebar
- `/ui/` - Reusable UI components (Button, Card, Input, etc.)
- `/[feature]/` - Feature-specific components matching page structure

### Key Features

**Google Drive Integration**: API routes in `/pages/api/drive/` handle Google Drive authentication and file operations for material storage and backup.

**LLM Integration**: Uses external LLM APIs for generating study questions (`/pages/api/gerar-questao.ts`) and context generation for exam preparation.

**Theme Support**: Dark/light mode via next-themes with custom color schemes for each feature area.

**Accessibility**: Components follow accessibility best practices with proper ARIA labels, keyboard navigation, and semantic HTML.

### Technical Details

**Database**: Supabase PostgreSQL with Row Level Security (RLS) for data isolation between users.

**Authentication**: Supabase Auth with email/password and Google OAuth support. Protected routes via `AuthGuard` component.

**State Management**: Zustand stores migrated from localStorage to Supabase with async operations. All stores follow the pattern: `loading`, `error`, and async CRUD operations.

**Styling**: TailwindCSS with custom color schemes for each feature area (e.g., `text-estudos-primary`, `bg-alimentacao-light`).

**TypeScript**: Comprehensive type definitions in `/app/types/index.ts` and `/app/lib/database.types.ts` covering all data structures.

**Icons**: Uses Lucide React for consistent iconography throughout the app.

**Routing**: Next.js App Router with dynamic routes for detailed views (e.g., `/receitas/[id]`, `/concursos/[id]`).

## Development Guidelines

**Code Style**: Follow the patterns defined in `.cursorrules`:
- Use early returns for readability
- Descriptive variable/function names with "handle" prefix for event handlers
- Implement accessibility features on all interactive elements
- Use const instead of function declarations
- TailwindCSS for all styling (avoid inline CSS)

**State Management**: All Zustand stores use Supabase for persistence. Always handle `loading` and `error` states in components. Call `loadData()` methods in `useEffect`.

**Authentication**: All data operations require authenticated users. Use `useAuth` hook to check authentication state.

**Component Structure**: Follow existing patterns - look at similar components in the same feature area for consistency. Handle async data loading with proper loading states.

**Database Operations**: Use the existing store methods for CRUD operations. All operations include proper error handling and user isolation via RLS.

**Environment Setup**: Requires `.env.local` with Supabase credentials. Run `supabase-schema.sql` to setup database.

**Navigation**: Update `/app/components/layout/Sidebar.tsx` when adding new main routes.