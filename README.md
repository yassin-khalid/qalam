# قلم (Qalam) - Teacher Platform

A modern teacher registration and authentication platform built with TanStack technologies. This application provides a multi-step registration process with phone verification (OTP) and supports Arabic language with RTL layout.

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
- **Vite** - Build tool and dev server
- **TanStack Start** - Full-stack React framework

### TanStack Ecosystem
- **TanStack Router** - File-based routing with type safety
- **TanStack DB** - Local database with collections
- **TanStack Query** - Server state management
- **TanStack Form** - Form state management
- **TanStack Devtools** - Development tools

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **react-hot-toast** - Toast notifications

### Additional Libraries
- **Zod** - Schema validation
- **nuqs** - URL state management for search params
- **Arabic Fonts** - Noto Kufi Arabic & IBM Plex Sans Arabic

## 📁 Project Structure

```
src/
├── lib/                    # Shared utilities and components
│   ├── components/        # Reusable components (ThemeToggle, Logo, etc.)
│   ├── contexts/          # React contexts (auth, etc.)
│   ├── db/                # Database collections and utilities
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── routes/                 # File-based routes (TanStack Router)
│   ├── __root.tsx         # Root layout
│   ├── _landing/          # Landing page routes
│   │   ├── index/         # Home page
│   │   └── contact/       # Contact page
│   └── teacher/           # Teacher-specific routes
│       ├── login/         # Login page
│       ├── register/      # Multi-step registration
│       │   ├── -api/      # API functions
│       │   ├── -components/ # Registration components
│       │   ├── -db/       # Database collections
│       │   └── -types/    # Type definitions
│       └── _authenticated/ # Protected routes
└── styles.css             # Global styles
```

## 🎯 Key Features

### Authentication Flow
- **Phone Registration**: Enter phone number with country code selection
- **OTP Verification**: 4-digit code verification with timer
- **Multi-step Registration**: 
  - Step 1: Personal information (name, email, etc.)
  - Step 2: Additional details (certificates, identity documents, etc.)

### User Experience
- **RTL Support**: Full Arabic language support with right-to-left layout
- **Dark Mode**: Theme toggle with persistent preference
- **Responsive Design**: Mobile-first responsive layout
- **Form Validation**: Client-side validation with Zod schemas
- **Toast Notifications**: User feedback for actions

### Developer Experience
- **Type Safety**: Full TypeScript coverage
- **File-based Routing**: Automatic route generation
- **Devtools**: TanStack Devtools for debugging
- **Hot Module Replacement**: Fast development experience

## 🗺️ Routes

### Public Routes
- `/` - Landing page (home)
- `/contact` - Contact page
- `/teacher/login` - Teacher login
- `/teacher/register` - Teacher registration (multi-step)

### Protected Routes
- `/teacher/*` - Authenticated teacher routes (under `_authenticated`)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url_here
```

### TypeScript Path Aliases

The project uses path aliases configured in `tsconfig.json`:
- `@/` - Points to `src/`

## 📝 Development Guidelines

### Adding Routes

Routes are file-based. Create a new file in `src/routes/` directory:
- `route.tsx` - Route component and configuration
- `-components/` - Route-specific components (prefixed with `-`)
- `-api/` - Route-specific API functions
- `-types/` - Route-specific types

### Styling

- Use Tailwind CSS utility classes
- Follow the existing color scheme:
  - Primary: `#003049` (dark blue)
  - Accent: `#00B5B5` (cyan)
  - Dark mode: Slate color palette

### Form Handling

- Use TanStack Form for complex forms
- Validate with Zod schemas
- Use `react-hot-toast` for user feedback

### Database Collections

Collections are defined using TanStack DB:
- Located in route-specific `-db/collections/` folders
- Use `queryCollectionOptions` for query integration
- Handle mutations with `onInsert`, `onUpdate`, `onDelete` callbacks

## 🎨 Design System

### Colors
- **Primary Dark**: `#003049`
- **Primary Light**: `#00B5B5`
- **Background**: White (light) / Slate 950 (dark)
- **Text**: Slate 900 (light) / Slate 100 (dark)

### Typography
- **Arabic Fonts**: Noto Kufi Arabic (variable), IBM Plex Sans Arabic
- **Direction**: RTL for Arabic content

## 📚 Learn More

- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack Query Documentation](https://tanstack.com/query)
- [TanStack DB Documentation](https://tanstack.com/db)
- [TanStack Form Documentation](https://tanstack.com/form)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

## 📄 License

[Add your license here]

---

**Last Updated**: This README is maintained and updated periodically to reflect the current project state.
