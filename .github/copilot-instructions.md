# Copilot Instructions for Voting Rings

## Project Overview

This is a Monte Carlo simulation platform for exploring statistical outcomes of an iterated voting game where traitors and loyalists compete through voting rounds until a terminal condition is met. The application is built as a light React application focused on running simulations, displaying results, and allowing parameter adjustments.

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with custom design tokens
- **UI Components**: Radix UI primitives with custom styling
- **Data Visualization**: D3.js for histogram charts
- **Testing**: Vitest with jsdom environment
- **Test Coverage**: 99%+ on core business logic (`src/lib`)

## Project Structure

- `src/lib/` - Core business logic (voting game simulation, utilities)
- `src/components/` - React components (UI components in `ui/` subdirectory)
- `src/hooks/` - Custom React hooks
- `src/test/` - Test setup and utilities
- `PRD.md` - Product requirements and design specifications
- `TESTING.md` - Comprehensive testing guide

## Build, Test, and Lint Commands

Always run these commands after making changes:

```bash
npm run build      # TypeScript compilation and Vite build
npm run lint       # ESLint for code quality
npm test           # Run tests in watch mode
npm run test:run   # Run tests once (CI mode)
npm run coverage   # Generate coverage report
```

## Coding Standards and Conventions

### TypeScript

- **Strict null checks enabled** - Always handle null/undefined cases
- Use **explicit types** for function parameters and return values
- Prefer **interfaces** over type aliases for object shapes
- Use **path aliases**: `@/*` maps to `./src/*`
- Do NOT use `any` type - use `unknown` if type is truly unknown

### React

- Use **functional components** with hooks
- Follow React 19 best practices
- Use **TypeScript** for all component props
- Prefer **composition** over prop drilling

### Naming Conventions

- **Files**: kebab-case for all files (e.g., `voting-game.ts`, `game-details.tsx`)
- **Components**: PascalCase (e.g., `VotingGame`, `GameDetails`)
- **Interfaces/Types**: PascalCase (e.g., `Actor`, `GameResult`)
- **Functions/Variables**: camelCase (e.g., `runSimulation`, `currentRound`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MAX_ROUNDS`)

### Code Style

- Use **descriptive variable names** that convey meaning
- Keep functions **focused and single-purpose**
- Extract complex logic into **well-named helper functions**
- Add **JSDoc comments** for public APIs and complex logic
- Prefer **early returns** to reduce nesting

### Testing Requirements

- **REQUIRED**: All changes to `src/lib/` must include unit tests
- Maintain **99%+ coverage** on core business logic
- Test files use `.test.ts` or `.test.tsx` suffix
- Use **descriptive test names** following pattern: "should [expected behavior] when [condition]"
- **Test behavior, not implementation** - focus on what the code does
- Keep tests **isolated and independent**
- Test **edge cases and boundary conditions**
- Use Vitest's `describe`, `it`, and `expect` for test structure

### Design System

Follow the design specifications in `PRD.md`:

- **Color Palette**:
  - Primary: Deep Navy `oklch(0.35 0.06 250)`
  - Loyalist Blue: `oklch(0.65 0.15 240)`
  - Traitor Red: `oklch(0.60 0.20 25)`
  - Neutral Gray: `oklch(0.88 0.01 250)`
  - Accent Cyan: `oklch(0.70 0.14 200)`

- **Typography**:
  - Headings: Space Grotesk (Bold, SemiBold, Medium)
  - Body: Space Grotesk Regular
  - Data/Numbers: JetBrains Mono (for precision and tabular alignment)

- **Components**: Use Radix UI components from `src/components/ui/`
- **Animations**: Precise and purposeful, reinforcing analytical nature
- **Spacing**: Follow Tailwind spacing scale (p-6, gap-4, gap-2, etc.)

### UI Component Guidelines

- **Import existing components** from `src/components/ui/` before creating new ones
- Components in `ui/` directory are based on Radix UI primitives
- Use the `cn()` utility from `src/lib/utils.ts` for conditional class names
- Ensure **accessibility** (ARIA labels, keyboard navigation, focus states)
- Components should be **responsive** and work on mobile devices

## Architecture and Logic

### Voting Game Simulation

The core logic in `src/lib/voting-game.ts` implements:
- **Two-phase voting system**: Phase 1 (actor selection), Phase 2 (final vote)
- **Game termination conditions**: All traitors removed OR no loyalists remain
- **Monte Carlo simulation**: Run multiple game iterations to generate statistics
- **Randomized voting**: Uses Math.random() for stochastic behavior

### Key Patterns

- **Immutability**: Prefer creating new objects/arrays over mutation
- **Pure functions**: Core logic functions should be pure when possible
- **Type safety**: Leverage TypeScript's type system for correctness
- **Error handling**: Validate inputs and handle edge cases gracefully

## Validation and Safety

- **Prevent invalid configurations**: Validate that loyalistCount and traitorCount are > 0
- **Handle edge cases**: Zero iterations, all loyalists eliminated, tie scenarios
- **Check array bounds**: Ensure indices are valid before accessing
- **Null safety**: Always check for undefined/null before using values

## File Modifications

- **DO NOT modify** files in `node_modules/` or generated directories
- **DO modify** source files in `src/` as needed
- **DO update** tests when changing logic in `src/lib/`
- **DO update** documentation if changing public APIs or behavior
- **Use `.gitignore`** to exclude build artifacts (`dist/`, `coverage/`, `node_modules/`)

## Documentation Updates

When making changes that affect:
- **Public APIs**: Update JSDoc comments and README if necessary
- **Testing approach**: Update TESTING.md
- **Build/deployment**: Update README with new commands
- **Design decisions**: Update PRD.md if design direction changes

## Performance Considerations

- **Large simulations** (>10,000 iterations): Consider batching and progress indicators
- **Chart rendering**: Use D3.js efficiently, update data without full re-render
- **React optimization**: Use `useMemo` and `useCallback` appropriately for expensive operations

## Security

- **No user data storage**: This is a client-side simulation tool
- **Input validation**: Validate all user inputs (simulation parameters)
- **No external API calls**: All computation happens client-side
- **Dependencies**: Keep dependencies updated, use npm audit regularly
