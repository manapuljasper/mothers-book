# Web App (apps/web)

Next.js web app for the Digital Mother's Book.

## Tech Stack
- **Next.js** with App Router
- **TypeScript** strict mode
- **Tailwind CSS v4**
- **Convex** - backend (shared with mobile)
- **Zustand** - auth state

## Commands

```bash
yarn dev    # Start dev server
yarn build  # Build for production
```

## Structure

```
src/
├── app/           # App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   └── doctor/
├── components/
│   ├── providers/ # ConvexClientProvider
│   └── ui/
├── hooks/
├── stores/
└── lib/
```

## Key Files
- `src/hooks/useAuth.ts` - Authentication hook
- `src/stores/auth.store.ts` - Auth state
- `src/components/providers/ConvexClientProvider.tsx` - Convex setup

## Convex Usage

Same patterns as mobile:
```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

const data = useQuery(api.booklets.list, { motherId });
const create = useMutation(api.booklets.create);
```
