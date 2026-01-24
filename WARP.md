# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
```bash
npm run dev    # Start dev server on port 3000
npm run build  # Production build
npm run preview # Preview production build
npm run test   # Run tests with Vitest
```

### PowerShell-specific
On Windows with PowerShell, use `Get-ChildItem` instead of `ls -la`.

## Architecture Overview

### TanStack-Centric Stack
This is a full-stack React application built entirely on the TanStack ecosystem:
- **TanStack Start**: Full-stack framework (replaces Next.js/Remix)
- **TanStack Router**: File-based routing with type-safe navigation
- **TanStack DB**: Client-side database with localStorage persistence
- **TanStack Query**: Server state management
- **TanStack Form**: Form state and validation

### File-Based Routing Pattern
Routes live in `src/routes/` with specific conventions:
- `route.tsx` - Main route component and configuration
- `-components/` - Route-scoped components (private to route)
- `-api/` - Route-scoped API/server functions
- `-types/` - Route-scoped TypeScript types
- `-db/` - Route-scoped database collections

The `-` prefix indicates route-private folders that won't create nested routes.

### State Management Architecture
1. **URL State**: Uses `nuqs` library for search params
   - Registration flow tracks: `step`, `authSubStep`, `phoneNumber`, `stepOneData` in URL
   - Provides browser history and shareable links
   - Type-safe with Zod validation schemas

2. **Local State**: TanStack DB with localStorage adapter
   - `localStorageCollection` manages auth session with schema: `{id, teacher, token, theme}`
   - Reactive updates via `useLiveQuery` hook
   - Automatic theme persistence and DOM class manipulation via `onUpdate` callback

3. **Server State**: TanStack Query for API data fetching

### Authentication Flow
Multi-step registration process:
1. **Step 0**: Phone number entry + OTP verification (sub-steps: 'phone' → 'otp')
2. **Step 1**: Personal information (name, email, etc.)
3. **Step 2**: Additional details (certificates, identity documents)

All state managed in URL search params, allowing navigation back/forward and reload persistence.

### RTL and i18n
- Application is RTL-first for Arabic language
- `dir="rtl"` set at root HTML level
- Uses Arabic fonts: Noto Kufi Arabic (variable), IBM Plex Sans Arabic
- All UI text in Arabic

### Theme System
- Dark mode toggle via `ThemeToggleButton` component
- Theme state persisted in `localStorageCollection`
- Theme changes trigger DOM class updates (`document.documentElement.classList`)
- Tailwind dark mode classes (e.g., `dark:bg-slate-950`)

## Key Patterns

### Route Component Structure
```tsx
export const Route = createFileRoute('/path')(({
  component: RouteComponent,
  validateSearch: createStandardSchemaV1(searchParams),
}))
```

### Search Params with nuqs
```tsx
const searchParams = {
  step: parseAsNumberLiteral([0, 1, 2] as const).withDefault(0),
  data: parseAsJson(schema).withDefault({}),
}
const [params, setParams] = useQueryStates(searchParams)
```

### TanStack DB Collection
```tsx
createCollection(localStorageCollectionOptions({
  id: 'collection-id',
  storageKey: 'storage_key',
  schema: zodSchema,
  getKey: (item) => item.id,
  onUpdate: async ({transaction}) => { /* side effects */ },
}))
```

## Path Aliases
`@/` maps to `src/` directory (configured in tsconfig.json)

## Color Scheme
- Primary Dark: `#003049` / `#003555`
- Primary Light/Accent: `#00B5B5` / `#64ffda` (cyan/teal)
- Dark mode: Slate color palette (bg-slate-950, text-slate-100)

## Testing
Vitest configured but no test files exist yet. When adding tests:
- Use Vitest for unit tests
- Testing Library for React components (already in devDependencies)
- jsdom for DOM simulation

## Important Notes
- Phone numbers are hardcoded with Saudi Arabia country code (+966)
- OTP verification uses 4-digit codes
- Auth context exists but registration flow uses API functions directly
- Protected routes under `teacher/_authenticated/` route group
- TanStack Devtools enabled in development (bottom-right position)
