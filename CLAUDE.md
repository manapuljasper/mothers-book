# CLAUDE.md

Digital Mother's Book - healthcare app for maternal health records in the Philippines.

## Monorepo Structure

Yarn workspaces monorepo:
- `apps/mobile` - React Native/Expo app
- `apps/web` - Next.js web app
- `convex/` - Shared backend (root level)

Both apps share the same Convex deployment.

## Commands

```bash
yarn mobile          # Expo dev server
yarn mobile:ios      # iOS simulator
yarn web             # Next.js dev
yarn convex:dev      # Convex dev server
```

## Convex Backend

Import using `@convex` alias:
```tsx
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
```

### Data Model
- **User** - Auth account (doctor/mother role)
- **DoctorProfile** / **MotherProfile** - Role-specific profiles
- **MotherBooklet** - Pregnancy/child record
- **BookletAccess** - Doctor access via QR scan
- **MedicalEntry** - Medical records
- **Medication** - Prescriptions with intake tracking
- **LabRequest** - Lab tests and results

### Key Files
- `convex/schema.ts` - Database schema
- `convex/lib/validators.ts` - Shared validators

### Patterns
```tsx
// Queries return undefined while loading
const data = useQuery(api.booklets.list, { motherId });
const isLoading = data === undefined;

// Skip queries conditionally
const booklet = useQuery(api.booklets.get, id ? { id } : "skip");

// Mutations
const create = useMutation(api.booklets.create);
await create({ label: "Baby #1", motherId });
```

### Types
```tsx
import { Doc, Id } from "@convex/_generated/dataModel";

function Component({ booklet }: { booklet: Doc<"booklets"> }) {}
function useBooklet(id: Id<"booklets">) {}
```

## Development Notes

- **Dates**: Convex uses Unix timestamps (ms). Use `Date.now()`, display with `new Date(ts)`
- **Date library**: Use `dayjs` (configured in `src/utils/date.utils.ts`)
- **Filipino context**: PRC numbers, Philippine addresses, local terminology

## App-Specific Docs

For detailed conventions (components, styling, hooks), see:
- `apps/mobile/CLAUDE.md` - NativeWind, UI components, animations
- `apps/web/CLAUDE.md` - Next.js patterns
