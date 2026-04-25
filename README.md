# قلم (Qalam) - Teacher Platform

A modern teacher platform built with TanStack technologies. The application covers the full teacher journey — registration with phone-based OTP verification, onboarding surveys, and an authenticated dashboard for course management. Arabic-first with full RTL support and dark mode.

> **Note:** This README is updated periodically to reflect the current state of the project.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🧪 Testing

This project uses [Vitest](https://vitest.dev/) for testing. Run tests with:

```bash
npm run test
```

## 🛠️ Tech Stack

### Core Technologies
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **TanStack Start** - Full-stack React framework (with Nitro)

### TanStack Ecosystem
- **TanStack Router** - File-based routing with type safety
- **TanStack DB** - Local database with collections (localStorage adapter)
- **TanStack Query** - Server state management
- **TanStack Form** - Form state management
- **TanStack Devtools** - Development tools

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS (via `@tailwindcss/vite` plugin)
- **Framer Motion** - Animations and transitions
- **Lucide React** - Icon library
- **react-hot-toast** - Toast notifications (with custom `ElegantToast` component)

### Additional Libraries
- **Zod 4** - Schema validation
- **nuqs** - URL state management for search params
- **Arabic Fonts** - Noto Kufi Arabic (variable) & IBM Plex Sans Arabic

## 📁 Project Structure

```
src/
├── lib/                        # Shared utilities and components
│   ├── components/             # Reusable components
│   │   ├── ClientRoot.tsx      # Client-side root wrapper (applies theme)
│   │   ├── ElegantToast.tsx    # Custom toast notification component
│   │   ├── QalamLogo.tsx       # Theme-aware logo
│   │   ├── ThemeToggleButton.tsx
│   │   └── calendar/           # Hijri/Gregorian date picker
│   │       ├── CalendarGrid.tsx
│   │       ├── CalendarHijri.tsx
│   │       └── DatePicker.tsx
│   ├── contexts/               # React contexts
│   │   └── auth.tsx            # Auth provider (teacher state, login/logout)
│   ├── db/                     # TanStack DB collections
│   │   └── localStorageCollection.ts  # Auth session & theme persistence
│   ├── hooks/
│   │   └── useTheme.ts         # Theme hook (reads from DB collection)
│   ├── types/                  # Shared TypeScript types
│   │   ├── auth.ts             # Teacher & session Zod schemas
│   │   ├── calendar.ts         # Calendar types (Gregorian/Hijri)
│   │   ├── dateState.ts        # Date state interface
│   │   └── toast.ts            # Toast notification types
│   └── utils/
│       ├── dateUtils.ts        # Hijri/Gregorian date formatting & conversion
│       ├── objectToFormData.ts # Object → FormData with PascalCase keys
│       ├── sessionHelpers.ts   # Theme & session upsert helpers
│       └── toast.tsx           # showToast() utility
├── routes/                     # File-based routes (TanStack Router)
│   ├── __root.tsx              # Root layout (RTL, providers, devtools)
│   ├── _landing/               # Public landing pages
│   │   ├── route.tsx           # Layout with Navbar & Footer
│   │   ├── index/              # Home page (Hero, FAQ, Testimonials, etc.)
│   │   └── contact/            # Contact page
│   └── teacher/                # Teacher-specific routes
│       ├── login/              # Phone login
│       ├── otp/                # OTP verification
│       ├── register/           # Multi-step registration
│       │   ├── -api/           # API functions (sendOtp, verifyOtp, etc.)
│       │   ├── -components/    # Registration steps + password strength
│       │   ├── -db/            # Auth & identity type collections
│       │   └── -types/         # Registration type definitions
│       ├── survey/             # Onboarding survey (domain, subject, availability)
│       │   ├── -components/    # Survey step components
│       │   └── -types/         # Survey types
│       └── _authenticated/     # Protected routes (token-gated)
│           ├── route.tsx       # Auth guard + sidebar/navbar layout
│           ├── -components/    # Header, Navbar, Sidebar, StatsCards
│           └── courses/        # Course management
│               ├── route.tsx   # Course list, filters, stats
│               ├── -components/# CourseCard, CourseList, EnrollmentRequestsModal, Filters, Header, StatsGrid
│               ├── -queries/   # courseDetailQueryOptions, enrollmentRequestsQueries
│               ├── -types/     # Course types
│               └── new/        # Create/edit course
│                   ├── -components/  # SubjectSelector
│                   ├── -queries/     # Teaching mode, session type, subject queries
│                   └── -types/       # Course form types
├── routes/test/                # Sandbox route for ad-hoc API probing
├── router.tsx                  # Router configuration
├── routeTree.gen.ts            # Auto-generated route tree
└── styles.css                  # Global styles

queryClient.ts                  # Root-level shared TanStack Query client
```

## 🎯 Key Features

### Authentication Flow
- **Phone Login**: Enter phone number → receive OTP (`/teacher/login` → `/teacher/otp`)
- **OTP Verification**: 4-digit code verification with resend timer
- **Multi-step Registration** (`/teacher/register`):
  - Phone + OTP verification
  - Personal information (name, email, password with strength meter)
  - Document upload (certificates, identity documents)
- **Token-based Auth**: JWT stored in TanStack DB localStorage collection; protected routes redirect to registration if no token

### Teacher Onboarding
- **Survey** (`/teacher/survey`): Multi-step onboarding after registration
  - Domain selection (teaching domains)
  - Subject selection
  - Availability preferences
  - Exception scheduling

### Course Management (Authenticated)
- **Course Dashboard** (`/teacher/courses`): List, filter, search, and paginate courses
  - Stats grid (total, published, drafts, archived, student count)
  - Status filters (all, published, drafts, archived)
- **Course Creation** (`/teacher/courses/new`): Full course editor
  - Basic information (title, description)
  - Subject selection (domain/subject hierarchy)
  - Session settings (teaching mode, session type, flexible scheduling)
  - Pricing configuration
  - Live preview, save as draft or publish
- **Enrollment Requests**: Per-course modal for reviewing student enrollment requests
  - Paginated list with status filtering (Pending / Approved / Rejected / Cancelled)
  - Detail view with proposed sessions and group members
  - Approve / reject actions wired through TanStack Query mutations

### Landing Pages
- **Home** (`/`): Hero, Why Qalam, Teacher Benefits, How It Works, App Promotion, FAQ, Testimonials
- **Contact** (`/contact`): Contact form with info section

### User Experience
- **RTL Support**: Full Arabic language support (`lang="ar"` / `dir="rtl"`)
- **Dark Mode**: Theme toggle with persistent preference (stored in TanStack DB)
- **Responsive Design**: Mobile-first responsive layout
- **Form Validation**: Client-side validation with Zod schemas
- **Custom Toasts**: Elegant toast notifications with type variants (success, warning, validation, server)
- **Hijri/Gregorian Calendar**: Date picker supporting both calendar systems
- **Animations**: Smooth transitions via Framer Motion

### Developer Experience
- **Type Safety**: Full TypeScript coverage with Zod schema inference
- **File-based Routing**: Automatic route generation with TanStack Router
- **URL State**: Complex form state persisted in URL via `nuqs`
- **Devtools**: TanStack Devtools (Router panel) for debugging
- **Hot Module Replacement**: Fast development experience

## 🗺️ Routes

### Public Routes
| Path | Description |
|------|-------------|
| `/` | Landing page (home) |
| `/contact` | Contact page |
| `/teacher/login` | Phone login |
| `/teacher/otp` | OTP verification |
| `/teacher/register` | Multi-step registration |
| `/teacher/survey` | Onboarding survey |

### Protected Routes (require authentication)
| Path | Description |
|------|-------------|
| `/teacher/courses` | Course management dashboard |
| `/teacher/courses/new` | Create / edit a course |

### Development / Sandbox
| Path | Description |
|------|-------------|
| `/test` | Ad-hoc fetch sandbox (calls `dev.abwaab.sa/api/settings`) — for debugging only |

### Planned Routes (referenced in sidebar, not yet implemented)
`/teacher/dashboard`, `/teacher/calendar`, `/teacher/suppliers`, `/teacher/reports`, `/teacher/notifications`, `/teacher/settings`, `/teacher/support`

## 🔌 External API

All API calls are client-side fetches to an external backend configured via `VITE_API_URL`.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/Api/V1/Authentication/Teacher/LoginOrRegister` | POST | Send OTP |
| `/Api/V1/Authentication/Teacher/VerifyOtp` | POST | Verify OTP |
| `/Api/V1/Authentication/Teacher/CompletePersonalInfo` | POST | Submit personal info |
| `/Api/V1/Authentication/Teacher/UploadDocuments` | POST | Upload identity docs & certificates |
| `/Api/V1/Authentication/IdentityTypes` | GET | Fetch identity type options |
| `/Api/V1/Teacher/TeacherCourse` | GET/POST | List / create courses |
| `/Api/V1/Teacher/TeacherCourse/{id}` | GET/PUT | Fetch / update a course |
| `/Api/V1/Teacher/EnrollmentRequests` | GET | List enrollment requests (paginated, status filter) |
| `/Api/V1/Teacher/EnrollmentRequests/{id}` | GET | Enrollment request details |
| `/Api/V1/Teacher/EnrollmentRequests/{id}/Approve` | POST | Approve an enrollment request |
| `/Api/V1/Teacher/EnrollmentRequests/{id}/Reject` | POST | Reject an enrollment request |
| `/Api/V1/Teacher/TeacherAvailability` | POST | Save teacher availability |
| `/Api/V1/Teaching/Modes` | GET | Fetch teaching modes |
| `/Api/V1/Teaching/SessionTypes` | GET | Fetch session types |
| `/Api/V1/Teaching/DaysOfWeek` | GET | Fetch days of the week |
| `/Api/V1/Teaching/TimeSlots` | GET | Fetch time slots |
| `/Api/V1/Teacher/TeacherSubject` | GET | Fetch teacher's subjects |
| `/Api/V1/Education/Domains` | GET | Fetch teaching domains |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url_here
```

### TypeScript Path Aliases

The project uses path aliases configured in `tsconfig.json`:
- `@/` → `src/`

## 📝 Development Guidelines

### Adding Routes

Routes are file-based. Create a new directory in `src/routes/` with:
- `route.tsx` - Route component and configuration
- `-components/` - Route-specific components (prefixed with `-` to exclude from routing)
- `-api/` - Route-specific API functions
- `-queries/` - Route-specific TanStack Query options
- `-types/` - Route-specific types
- `-db/` - Route-specific TanStack DB collections

### Styling

- Use Tailwind CSS utility classes
- Tailwind is configured via the `@tailwindcss/vite` plugin (no separate config file)
- Follow the existing color scheme:
  - Primary: `#003049` (dark blue)
  - Accent: `#00B5B5` (cyan)
  - Dark mode: Slate color palette

### Form Handling

- Use TanStack Form for complex forms
- Validate with Zod schemas
- Use `showToast()` from `lib/utils/toast.tsx` for user feedback

### Database Collections

Collections are defined using TanStack DB:
- Shared collection in `lib/db/localStorageCollection.ts` (auth session & theme)
- Route-specific collections in `-db/collections/` folders
- Use `useLiveQuery` for reactive reads

### Server State

- A single shared `QueryClient` lives at the project root in `queryClient.ts` and is passed into the router so `queryClient.fetchQuery(...)` works inside loaders and action handlers (e.g. `CourseCard` prefetches course details before navigating to the editor).
- Route-specific server-state lives in `-queries/` folders next to the route (e.g. `courseDetailQueryOptions`, `enrollmentRequestsQueries`).

## 🎨 Design System

### Colors
- **Primary Dark**: `#003049`
- **Primary Light / Accent**: `#00B5B5`
- **Background**: White (light) / Slate 950 (dark)
- **Text**: Slate 900 (light) / Slate 100 (dark)

### Typography
- **Arabic Fonts**: Noto Kufi Arabic (variable), IBM Plex Sans Arabic
- **Direction**: RTL for all content

## 📚 Learn More

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack Query Documentation](https://tanstack.com/query)
- [TanStack DB Documentation](https://tanstack.com/db)
- [TanStack Form Documentation](https://tanstack.com/form)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

## 📄 License

[Add your license here]

---

**Last Updated**: April 26, 2026
