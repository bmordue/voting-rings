# Dependency Reduction Plan

## Current State

| Category | Count |
|---|---|
| Total `dependencies` | 47 |
| Total `devDependencies` | 14 |
| **Total packages** | **61** |
| Packages actually imported | ~28 |
| Packages never imported | **~33** |

---

## Phase 1: Remove Unused Dependencies (Zero Risk)

These packages are declared in `package.json` but never imported anywhere in the codebase. Safe to remove immediately.

### Production dependencies (14 packages)

| Package | Why it's here | Action |
|---|---|---|
| `@heroicons/react` | Template scaffold — superseded by lucide | **Remove** |
| `@hookform/resolvers` | Template scaffold — no forms using it | **Remove** |
| `@octokit/core` | Template scaffold — GitHub API not used | **Remove** |
| `@radix-ui/colors` | Template scaffold — colors handled by tailwind/theme | **Remove** |
| `@tailwindcss/container-queries` | Template scaffold — not used in any component | **Remove** |
| `@tanstack/react-query` | Template scaffold — no data-fetching hooks | **Remove** |
| `date-fns` | Template scaffold — only used by unused calendar component | **Remove** |
| `embla-carousel-react` | Template scaffold — carousel component unused | **Remove** |
| `framer-motion` | Template scaffold — no animations using it | **Remove** |
| `marked` | Template scaffold — no markdown rendering | **Remove** |
| `octokit` | Template scaffold — GitHub API not used | **Remove** |
| `react-hook-form` | Template scaffold — no forms using it | **Remove** |
| `three` | Template scaffold — no 3D rendering | **Remove** |
| `tw-animate-css` | Template scaffold — animations not wired up | **Remove** |
| `uuid` | Template scaffold — no UUID generation in use | **Remove** |
| `zod` | Template scaffold — no schema validation | **Remove** |

### Dev dependencies (6 packages)

| Package | Why it's here | Action |
|---|---|---|
| `@tailwindcss/postcss` | Template scaffold — Tailwind v4 uses Vite plugin | **Remove** |
| `@vitest/coverage-v8` | Only needed if running coverage CI | **Remove** (or keep if coverage is planned) |
| `@vitest/ui` | Only needed for `test:ui` — low value | **Remove** |
| `eslint` + plugins | Currently configured but lint not enforced in CI | **Remove** (or keep if linting will be enforced) |
| `globals` | ESLint transitive — unused without ESLint | **Remove** |
| `jsdom` | Only needed if vitest uses `jsdom` env | **Keep** if vitest.config.ts uses `environment: 'jsdom'`, otherwise remove |

**Estimated reduction: ~20 packages removed**

---

## Phase 2: Remove Unused shadcn/ui Components (Low Risk)

The project was scaffolded from a shadcn/ui template that generates a wrapper for every available Radix UI primitive. 27 of these are never used in application code.

### Unused UI components to delete

Delete these files from `src/components/ui/` and their corresponding entries from any barrel exports:

```
accordion.tsx
alert-dialog.tsx
aspect-ratio.tsx
avatar.tsx
breadcrumb.tsx
calendar.tsx
carousel.tsx
chart.tsx
checkbox.tsx
collapsible.tsx
command.tsx
context-menu.tsx
drawer.tsx
dropdown-menu.tsx
form.tsx
hover-card.tsx
input-otp.tsx
menubar.tsx
navigation-menu.tsx
pagination.tsx
popover.tsx
radio-group.tsx
resizable.tsx
sonner.tsx
switch.tsx
toggle-group.tsx
toggle.tsx
```

### Radix UI packages that can then be removed

After deleting the above component files, remove these from `dependencies`:

| Package | Replaced by |
|---|---|
| `@radix-ui/react-accordion` | — (unused) |
| `@radix-ui/react-alert-dialog` | — (unused) |
| `@radix-ui/react-aspect-ratio` | — (unused) |
| `@radix-ui/react-avatar` | — (unused) |
| `@radix-ui/react-checkbox` | — (unused) |
| `@radix-ui/react-collapsible` | — (unused) |
| `@radix-ui/react-context-menu` | — (unused) |
| `@radix-ui/react-dropdown-menu` | — (unused) |
| `@radix-ui/react-hover-card` | — (unused) |
| `@radix-ui/react-menubar` | — (unused) |
| `@radix-ui/react-navigation-menu` | — (unused) |
| `@radix-ui/react-popover` | — (unused) |
| `@radix-ui/react-radio-group` | — (unused) |
| `@radix-ui/react-select` | **Keep** — used in App.tsx and GameList.tsx |
| `@radix-ui/react-scroll-area` | **Keep** — used in GameList.tsx |
| `@radix-ui/react-separator` | **Keep** — used in GameDetails.tsx |
| `@radix-ui/react-slider` | **Keep** — used in App.tsx |
| `@radix-ui/react-tabs` | **Keep** — used in App.tsx |
| `@radix-ui/react-toggle` | — (unused, only internal to toggle-group) |
| `@radix-ui/react-toggle-group` | — (unused) |
| `@radix-ui/react-tooltip` | — (unused, only internal to sidebar which is unused) |

Also remove the wrappers for these unused Radix components:
- `sheet.tsx` (only used by unused `sidebar.tsx`)
- `sidebar.tsx` (never imported from app code)
- `dialog.tsx` — **Keep** (used in App.tsx)

**Estimated reduction: ~16 Radix packages + ~27 component files**

---

## Phase 3: Consolidate Icon Libraries (Low Risk)

Two icon libraries are installed. Lucide is deeply embedded in 16 shadcn/ui wrapper components and is the configured icon library in `components.json`. Phosphor is used in only 2 files with 11 icons total.

### Migration

Replace `@phosphor-icons/react` with `lucide-react` equivalents:

| Phosphor Icon | Lucide Equivalent | Files |
|---|---|---|
| `Play` | `Play` | `App.tsx` |
| `ChartBar` | `BarChart3` | `App.tsx` |
| `Eye` | `Eye` | `App.tsx` |
| `ArrowClockwise` | `RotateCw` | `App.tsx` |
| `Info` | `Info` | `App.tsx` |
| `CaretLeft` | `ChevronLeft` | `GameList.tsx` |
| `CaretRight` | `ChevronRight` | `GameList.tsx` |
| `CaretDoubleLeft` | `ChevronsLeft` | `GameList.tsx` |
| `CaretDoubleRight` | `ChevronsRight` | `GameList.tsx` |
| `ArrowUp` | `ArrowUp` | `GameList.tsx` |
| `ArrowDown` | `ArrowDown` | `GameList.tsx` |

### After migration

- Remove `@phosphor-icons/react` from `dependencies`
- Update imports in `App.tsx` and `GameList.tsx`

**Estimated reduction: 1 package**

---

## Phase 4: Evaluate Remaining Dependencies (Medium Risk)

Review these packages to confirm they are still needed:

| Package | Current Use | Question |
|---|---|---|
| `d3` | Histogram.tsx | Is the histogram feature actively used? If not, remove d3 (~180KB minified) |
| `recharts` | chart.tsx (unused component) | If chart component is deleted in Phase 2, remove recharts |
| `react-day-picker` | calendar.tsx (unused component) | Delete with calendar component |
| `vaul` | drawer.tsx (unused component) | Delete with drawer component |
| `cmdk` | command.tsx (unused component) | Delete with command component |
| `input-otp` | input-otp.tsx (unused component) | Delete with input-otp component |
| `react-resizable-panels` | resizable.tsx (unused component) | Delete with resizable component |
| `next-themes` | sonner.tsx (unused component) | Delete with sonner component |
| `react-error-boundary` | main.tsx | Keep — provides error boundary in app entry |
| `sonner` | sonner.tsx (unused) + App.tsx toast imports | Check if toasts are actually triggered in App.tsx |

---

## Phase 5: Dev Dependency Cleanup (Low Risk)

| Package | Decision |
|---|---|
| `@vitest/ui` | Remove unless team actively uses `npm run test:ui` |
| `@vitest/coverage-v8` | Remove unless coverage is reported in CI |
| `@testing-library/jest-dom` + `@testing-library/react` | Keep if tests are being maintained |
| `typescript-eslint` | Keep if type-aware linting is desired, otherwise simplify ESLint config |

---

## Summary of Expected Reduction

| Phase | Packages Removed | Files Removed |
|---|---|---|
| Phase 1: Unused dependencies | ~20 | 0 |
| Phase 2: Unused UI components | ~16 Radix packages | ~27 component files |
| Phase 3: Icon consolidation | 1 | 0 |
| Phase 4: Remaining evaluation | ~6-8 | ~6 component files |
| **Total** | **~43-45 packages** | **~33 files** |

**Before:** 61 packages (47 prod + 14 dev)
**After:** ~16-18 packages (estimated)

---

## Execution Steps

1. **Run tests first** — `npm run test:run` to establish baseline
2. **Phase 1** — Remove unused packages from `package.json`, run `npm prune`, verify build passes
3. **Phase 2** — Delete unused component files, remove their Radix dependencies, verify build
4. **Phase 3** — Migrate Phosphor → Lucide icons, remove `@phosphor-icons/react`, verify build
5. **Phase 4** — Audit remaining packages one by one
6. **Phase 5** — Clean up dev dependencies
7. **Final verification** — Run `npm run build` and `npm run test:run`
8. **Run `npm dedupe`** — Optimize the lockfile
