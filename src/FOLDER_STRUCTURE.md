# Source Folder Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ClientRoot.tsx
│   │   ├── QalamLogo.tsx
│   │   └── ThemeToggleButton.tsx
│   ├── contexts/
│   │   └── auth.tsx
│   ├── db/
│   │   └── localStorageCollection.ts
│   ├── hooks/
│   │   └── useTheme.ts
│   └── types/
│       └── auth.ts
├── routes/
│   ├── __root.tsx
│   ├── index/
│   │   ├── -components/
│   │   │   ├── AppPromotion.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── TeacherBenefits.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── WhyQalam.tsx
│   │   └── route.tsx
│   └── teacher/
│       ├── _authenticated/
│       │   └── route.tsx
│       ├── login/
│       │   ├── -components/
│       │   │   └── LoginForm.tsx
│       │   └── route.tsx
│       ├── otp/
│       │   ├── -components/
│       │   │   └── OTPForm.tsx
│       │   └── route.tsx
│       └── register/
│           ├── -components/
│           │   └── RegisterForm.tsx
│           └── route.tsx
├── logo.svg
├── router.tsx
├── routeTree.gen.ts
└── styles.css
