# Digital Mother's Book - Web Style Guide

A comprehensive design reference for building a website with the same look and feel as the mobile app.

---

## Brand Identity

**App Name:** Digital Mother's Book

**Target Audience:** Filipino mothers and healthcare providers

**Design Tone:**
- Professional healthcare aesthetic
- Warm and approachable
- Accessible to non-technical users
- Clean, uncluttered layouts

---

## Color System

### Primary Colors

**Mother/Brand Pink** (used for mother-facing features, primary accent)
```
pink-50:  #fdf2f8
pink-100: #fce7f3
pink-200: #fbcfe8
pink-300: #f9a8d4
pink-400: #f472b6
pink-500: #ec4899  ← Primary
pink-600: #db2777
pink-700: #be185d
pink-800: #9d174d
pink-900: #831843
```

**Doctor Blue** (used for doctor-facing features, interactive elements)
```
blue-50:  #eff6ff
blue-100: #dbeafe
blue-200: #bfdbfe
blue-300: #93c5fd
blue-400: #60a5fa
blue-500: #3b82f6  ← Primary
blue-600: #2563eb
blue-700: #1d4ed8
blue-800: #1e40af
blue-900: #1e3a8a
```

### Semantic Colors

**Success/Active (Green)**
```
green-50:  #f0fdf4
green-100: #dcfce7
green-500: #22c55e  ← Primary
green-600: #16a34a
green-700: #15803d
```

**Warning/Pending (Amber)**
```
amber-50:  #fffbeb
amber-100: #fef3c7
amber-500: #f59e0b  ← Primary
amber-600: #d97706
amber-700: #b45309
```

**Error/Danger (Red)**
```
red-50:  #fef2f2
red-100: #fee2e2
red-500: #ef4444  ← Primary
red-600: #dc2626
red-700: #b91c1c
```

**Neutral (Gray)**
```
gray-50:  #f9fafb
gray-100: #f3f4f6
gray-200: #e5e7eb
gray-300: #d1d5db
gray-400: #9ca3af
gray-500: #6b7280  ← Primary
gray-600: #4b5563
gray-700: #374151
gray-800: #1f2937
gray-900: #111827
```

### Background Colors

**Light Mode:**
- Page background: `white` or `gray-50`
- Card background: `white`
- Input background: `white`
- Subtle sections: `gray-50`

**Dark Mode:**
- Page background: `gray-900`
- Card background: `gray-800`
- Deeper cards/overlays: `slate-800`
- Input background: `gray-700`

---

## Typography

### Font Stack

Use system fonts (no custom fonts required):
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

### Type Scale (Tailwind classes)

| Class | Size | Use Case |
|-------|------|----------|
| `text-xs` | 12px | Badges, timestamps, helper text |
| `text-sm` | 14px | Secondary text, form labels |
| `text-base` | 16px | Body text, inputs |
| `text-lg` | 18px | Subheadings, card titles |
| `text-xl` | 20px | Section headings |
| `text-2xl` | 24px | Page titles |
| `text-3xl` | 30px | Hero text, large stats |

### Font Weights

| Weight | Class | Use Case |
|--------|-------|----------|
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Labels, subtle emphasis |
| 600 | `font-semibold` | Buttons, headings |
| 700 | `font-bold` | Strong emphasis, stats |

### Special Text Treatments

**Small Uppercase Labels:**
```html
<span class="text-xs font-medium uppercase tracking-wide text-gray-500">
  Label Text
</span>
```

**Muted Helper Text:**
```html
<p class="text-sm text-gray-500 dark:text-gray-400">
  Helper text here
</p>
```

---

## Components

### Buttons

**Variants:**

```html
<!-- Primary (Blue) - main actions -->
<button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors">
  Save Changes
</button>

<!-- Secondary (Gray) - secondary actions -->
<button class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 transition-colors">
  Cancel
</button>

<!-- Outline - tertiary actions -->
<button class="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-100 transition-colors">
  View Details
</button>

<!-- Ghost - minimal actions -->
<button class="hover:bg-gray-100 text-gray-700 font-semibold rounded-lg dark:hover:bg-gray-700 dark:text-gray-100 transition-colors">
  Skip
</button>

<!-- Danger - destructive actions -->
<button class="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
  Delete
</button>
```

**Sizes:**

| Size | Padding | Use Case |
|------|---------|----------|
| Small | `py-2 px-3 text-sm` | Inline actions, table rows |
| Medium | `py-3 px-4 text-base` | Standard buttons |
| Large | `py-4 px-6 text-lg` | Primary CTAs, full-width |

**Disabled State:**
```html
<button class="bg-gray-300 text-gray-500 cursor-not-allowed" disabled>
  Loading...
</button>
```

### Text Fields

```html
<!-- Normal state -->
<div>
  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Email Address
  </label>
  <input
    type="email"
    class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
           dark:bg-gray-700 dark:border-gray-600 dark:text-white
           transition-colors"
    placeholder="Enter your email"
  />
</div>

<!-- Error state -->
<div>
  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Email Address
  </label>
  <input
    type="email"
    class="w-full px-4 py-3 border-2 border-red-500 rounded-lg bg-white
           focus:ring-2 focus:ring-red-500
           dark:bg-gray-700 dark:text-white"
  />
  <p class="mt-1 text-sm text-red-500">Please enter a valid email address</p>
</div>
```

### Cards

```html
<!-- Standard card -->
<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Card Title</h3>
  <p class="text-gray-600 dark:text-gray-400 mt-2">Card content goes here.</p>
</div>

<!-- Pressable/Clickable card -->
<button class="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4
               hover:bg-gray-50 dark:hover:bg-gray-750 active:scale-[0.98] transition-all text-left">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Clickable Card</h3>
</button>

<!-- Highlighted card (with accent) -->
<div class="bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-pink-500 border border-gray-100 dark:border-gray-700 shadow-sm p-4">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Important Card</h3>
</div>
```

### Status Badges

```html
<!-- Active/Success -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
             border border-green-500 text-green-700 dark:text-green-400">
  Active
</span>

<!-- Pending/Warning -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
             border border-amber-500 text-amber-700 dark:text-amber-400">
  Pending
</span>

<!-- Completed -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
             border border-blue-500 text-blue-700 dark:text-blue-400">
  Completed
</span>

<!-- Ended/Inactive -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
             border border-gray-400 text-gray-600 dark:text-gray-400">
  Ended
</span>

<!-- High Risk (filled) -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
             bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
  High Risk
</span>
```

### Option Button Group

```html
<div class="flex gap-2">
  <!-- Selected -->
  <button class="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium">
    mg
  </button>
  <!-- Unselected -->
  <button class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200
                 dark:bg-gray-700 dark:text-gray-300 font-medium">
    mL
  </button>
</div>
```

### Modal/Dialog

```html
<!-- Backdrop -->
<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
  <!-- Modal -->
  <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-xl">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Modal Title</h2>
      <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
        <XIcon class="w-5 h-5 text-gray-500" />
      </button>
    </div>
    <!-- Content -->
    <div class="p-4">
      <p class="text-gray-600 dark:text-gray-400">Modal content here.</p>
    </div>
    <!-- Footer -->
    <div class="flex gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
      <button class="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold">Cancel</button>
      <button class="flex-1 py-3 bg-blue-500 text-white rounded-lg font-semibold">Confirm</button>
    </div>
  </div>
</div>
```

---

## Dark Mode

### Implementation Pattern

Every element with a background or text color should have a dark mode variant:

```html
<!-- Pattern: property-lightValue dark:property-darkValue -->
<div class="bg-white dark:bg-gray-800">
  <h1 class="text-gray-900 dark:text-white">Title</h1>
  <p class="text-gray-600 dark:text-gray-400">Body text</p>
</div>
```

### Common Mappings

| Light Mode | Dark Mode |
|------------|-----------|
| `bg-white` | `dark:bg-gray-800` |
| `bg-gray-50` | `dark:bg-gray-900` |
| `bg-gray-100` | `dark:bg-gray-700` |
| `text-gray-900` | `dark:text-white` |
| `text-gray-700` | `dark:text-gray-200` |
| `text-gray-600` | `dark:text-gray-400` |
| `text-gray-500` | `dark:text-gray-400` |
| `border-gray-100` | `dark:border-gray-700` |
| `border-gray-200` | `dark:border-gray-600` |
| `border-gray-300` | `dark:border-gray-600` |

### Toggle Implementation

```javascript
// Store preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const stored = localStorage.getItem('theme');
const theme = stored || (prefersDark ? 'dark' : 'light');

// Apply theme
document.documentElement.classList.toggle('dark', theme === 'dark');
```

---

## Motion & Animation

### Principles

- **Subtle and professional** — No bouncy or playful animations
- **Functional** — Animation should communicate state changes
- **Fast** — Keep transitions snappy

### Timing

| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Press feedback | 100ms | ease-out |
| Hover states | 150ms | ease |
| Layout changes | 200-300ms | ease-in-out |
| Modal appear | 200ms | ease-out |
| Modal dismiss | 150ms | ease-in |

### Press Animation (for clickable cards)

```css
.pressable {
  transition: transform 100ms ease-out;
}
.pressable:active {
  transform: scale(0.98);
}
```

### Transition Classes

```html
<!-- Standard transition -->
<button class="transition-colors duration-150">Button</button>

<!-- Transform transition -->
<div class="transition-transform duration-100">Card</div>

<!-- All properties -->
<div class="transition-all duration-200">Element</div>
```

### No Spring/Bounce

Do NOT use:
- `cubic-bezier` curves that overshoot
- CSS `spring()` animations
- Bouncy JavaScript animation libraries

---

## Icons

### Library

Use **Lucide Icons** (`lucide-react` for React, `lucide` for vanilla JS)

```bash
npm install lucide-react
```

### Usage

```jsx
import { Home, User, Calendar, Plus, ChevronRight, X } from 'lucide-react';

<Home size={20} strokeWidth={1.5} className="text-gray-500" />
```

### Sizing

| Context | Size | Class |
|---------|------|-------|
| Inline with text | 14-16px | `w-4 h-4` |
| Buttons | 18-20px | `w-5 h-5` |
| Empty states | 48-64px | `w-12 h-12` |

### Stroke Width

Default stroke width: **1.5**

```jsx
<Icon strokeWidth={1.5} />
```

### Common Icons Used

| Purpose | Icon |
|---------|------|
| Home | `Home` |
| Profile | `User` |
| Calendar/Schedule | `Calendar` |
| Add/Create | `Plus` |
| Navigate forward | `ChevronRight` |
| Close | `X` |
| Back | `ArrowLeft` |
| Settings | `Settings` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Search | `Search` |
| Medication | `Pill` |
| Lab/Test | `FlaskConical` |
| Clinic | `Building2` |
| QR Code | `QrCode` |

---

## Spacing & Layout

### Spacing Scale (Tailwind)

Use consistent spacing from Tailwind's scale:

| Class | Value | Use Case |
|-------|-------|----------|
| `gap-1` / `p-1` | 4px | Tight icon spacing |
| `gap-2` / `p-2` | 8px | Related elements |
| `gap-3` / `p-3` | 12px | List items |
| `gap-4` / `p-4` | 16px | Card padding, section spacing |
| `gap-5` / `p-5` | 20px | Comfortable card padding |
| `gap-6` / `p-6` | 24px | Section separation |
| `gap-8` / `p-8` | 32px | Major sections |

### Border Radius

| Class | Value | Use Case |
|-------|-------|----------|
| `rounded` | 4px | Small elements |
| `rounded-md` | 6px | Buttons (small) |
| `rounded-lg` | 8px | Inputs, standard buttons |
| `rounded-xl` | 12px | Cards |
| `rounded-2xl` | 16px | Large cards, modals |
| `rounded-full` | 9999px | Badges, avatars |

### Common Layout Patterns

**Page Container:**
```html
<main class="max-w-4xl mx-auto px-4 py-6">
  <!-- Page content -->
</main>
```

**Card Grid:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>
```

**Stacked List:**
```html
<div class="flex flex-col gap-3">
  <!-- List items -->
</div>
```

**Header with Actions:**
```html
<div class="flex items-center justify-between">
  <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Title</h1>
  <button>Action</button>
</div>
```

---

## Forms

### Form Layout

```html
<form class="flex flex-col gap-4">
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Field Label
    </label>
    <input class="w-full px-4 py-3 border border-gray-300 rounded-lg..." />
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Another Field
    </label>
    <textarea class="w-full px-4 py-3 border border-gray-300 rounded-lg..." rows="3"></textarea>
  </div>

  <button type="submit" class="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg">
    Submit
  </button>
</form>
```

### Form Sections

```html
<div class="space-y-6">
  <div>
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Section Title</h2>
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
      <!-- Form fields -->
    </div>
  </div>
</div>
```

---

## Loading States

### Skeleton Loading

```html
<div class="animate-pulse">
  <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
</div>
```

### Spinner

```html
<svg class="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
</svg>
```

### Full-Screen Loading

```html
<div class="flex-1 flex items-center justify-center">
  <div class="flex flex-col items-center gap-3">
    <!-- Spinner -->
    <p class="text-gray-500 dark:text-gray-400">Loading...</p>
  </div>
</div>
```

---

## Empty States

```html
<div class="flex flex-col items-center justify-center py-12 px-4">
  <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
    <FileIcon class="w-8 h-8 text-gray-400" />
  </div>
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">No items yet</h3>
  <p class="text-gray-500 dark:text-gray-400 text-center mb-4">
    Get started by adding your first item.
  </p>
  <button class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg">
    Add Item
  </button>
</div>
```

---

## Special Patterns

### Risk Level Indicators

```html
<!-- Low Risk -->
<span class="w-2 h-2 rounded-full bg-green-500"></span>

<!-- Moderate Risk -->
<span class="w-2 h-2 rounded-full bg-amber-500"></span>

<!-- High Risk -->
<span class="w-2 h-2 rounded-full bg-red-500"></span>
```

### Progress Indicators

```html
<!-- Progress bar -->
<div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
  <div class="h-full bg-green-500 rounded-full" style="width: 75%"></div>
</div>

<!-- Medication dose tracker (circular) -->
<div class="flex gap-1">
  <span class="w-3 h-3 rounded-full bg-green-500"></span> <!-- Taken -->
  <span class="w-3 h-3 rounded-full bg-green-500"></span> <!-- Taken -->
  <span class="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></span> <!-- Not taken -->
</div>
```

### Avatar/Initials

```html
<div class="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
  <span class="text-pink-600 dark:text-pink-400 font-semibold">JD</span>
</div>
```

---

## Tailwind Config Reference

For consistency, use these as your Tailwind configuration base:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Default Tailwind colors work well
        // No custom colors needed
      },
    },
  },
  plugins: [],
}
```

---

## Quick Reference Checklist

When building components, ensure:

- [ ] Light mode colors defined
- [ ] Dark mode variants (`dark:`) for all colors
- [ ] Proper rounded corners (lg for inputs, xl for cards)
- [ ] Consistent spacing from the scale
- [ ] Font weights appropriate (semibold for buttons/headings)
- [ ] Transitions on interactive elements
- [ ] Proper focus states for accessibility
- [ ] Loading states handled
- [ ] Empty states designed
