# MaternaMD Web - Development Guidelines

## Design System

### Responsive Design Requirements
- **All designs must be mobile/tablet responsive** (minimum: iPad 768px)
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Typography
- **Font Family**: Inter (weights: 300, 400, 500, 600, 700)
- Import via Google Fonts

### Color Palette (Light Theme)
```css
--primary: #0f172a;        /* Dark slate - main text, headers */
--primary-light: #334155;  /* Lighter slate */
--accent: #0ea5e9;         /* Sky blue - interactive elements */
--background: #f8fafc;     /* Light gray background */
--white: #ffffff;          /* White surfaces */
--border: #e2e8f0;         /* Light gray borders */
--text-main: #1e293b;      /* Primary text */
--text-secondary: #64748b; /* Secondary text */
--text-muted: #94a3b8;     /* Muted/placeholder text */
```

### Component Guidelines
- **Componentize** all reusable UI elements
- Use Tailwind CSS for styling
- Components should be self-contained and reusable
- Use CSS variables for theme colors

### Spacing & Layout
- Sidebar: 240px fixed width on desktop
- Main content: Fluid width with max-width constraints
- Card border-radius: 12px (rounded-xl)
- Standard padding: 16px, 24px, 32px

### Shadows
- Cards: `shadow-sm` to `shadow-md`
- Hover states: Increase shadow depth

## Tech Stack
- Next.js (App Router)
- Convex (Backend/Database/Auth)
- Tailwind CSS v4
- TypeScript

## File Structure
```
src/
├── app/
│   ├── (auth)/           # Auth pages (login)
│   ├── doctor/           # Doctor dashboard
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── stores/               # State management
└── lib/                  # Utilities
```

## Development Notes
- Keep the backend (convex/) intact
- Use existing hooks for authentication
- Real Convex data should be used where available
