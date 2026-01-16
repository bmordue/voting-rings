# Voting Rings

A Monte Carlo simulation platform for exploring statistical outcomes of an iterated voting game where traitors and loyalists compete through voting rounds until a terminal condition is met.

## Overview

This application simulates voting games between two groups of actors: loyalists and traitors. Through Monte Carlo simulation, it generates statistical distributions of game outcomes, allowing you to explore how different initial configurations and voting strategies affect the probability of each side winning.

### Game Mechanics

The game supports two distinct simulation types:

**Random Voting:**
- **Phase 1 (Voting):** Each actor votes to remove one other actor
  - Loyalists vote randomly (or use fixation strategy on a suspect)
  - Traitors vote randomly for any loyalist
  - Actor with most votes is removed (with tie-breaking)
- **Phase 2 (Random Removal):** A random loyalist is removed
- **End Conditions:** 
  - First traitor removed (loyalists win) OR no loyalists remain (traitors win)
  - OR continue until all remaining actors are one type

**Influence-Based Voting:**
- Each actor has influence scores (1-100) over other actors
- **Phase 1:** Actors vote for targets they have lowest influence over
- **Phase 2:** Loyalist with highest total influence is removed
- **End Condition:** First traitor removed (loyalists win) OR no loyalists remain (traitors win)

## Features

- 🎲 **Monte Carlo Simulation** - Run thousands of game iterations to generate statistical distributions
- 📊 **Interactive Visualizations** - D3.js-powered histogram showing outcome frequency distributions
- ⚙️ **Configurable Parameters** - Adjust loyalist count, traitor count, voting strategies, and end conditions
- 🔍 **Game Details** - Drill down into individual games to see round-by-round progression
- 📈 **Statistical Analysis** - View mean, median, mode, standard deviation, min/max for simulation results
- 🎨 **Modern UI** - Built with React 19, Tailwind CSS 4, and Radix UI components

## Tech Stack

- **Frontend:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 with custom design tokens
- **UI Components:** Radix UI primitives
- **Data Visualization:** D3.js
- **Testing:** Vitest with jsdom environment (99%+ coverage on core logic)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/bmordue/voting-rings.git
cd voting-rings

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Nix Setup (Optional)

For a reproducible development environment, you can use Nix:

```bash
# Enter the Nix development environment
nix develop        # If using flakes
# or
nix-shell          # If using traditional nix-shell

# Then run the standard commands
npm run dev        # Start development server
npm test           # Run tests
```

For more information about the Nix development environment, see [NIX.md](NIX.md).

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm test           # Run tests in watch mode
npm run test:run   # Run tests once (CI mode)
npm run test:ui    # Run tests with UI
npm run coverage   # Generate coverage report
```

## Testing

This project includes comprehensive unit tests for the core business logic. See [TESTING.md](TESTING.md) for full documentation.

**Coverage:**
- 99%+ coverage on core business logic (`src/lib`)
- 38+ unit tests across voting game simulation and utilities
- Automated CI/CD with GitHub Actions

**Quick Start:**
```bash
npm test           # Run tests in watch mode
npm run coverage   # Generate coverage report
```

## Project Structure

```
voting-rings/
├── src/
│   ├── lib/              # Core business logic
│   │   ├── interfaces.ts # Type definitions
│   │   ├── voting-game.ts # Game classes and simulation
│   │   └── utils.ts      # Utility functions
│   ├── components/       # React components
│   │   ├── ui/          # Radix UI components
│   │   ├── Histogram.tsx
│   │   ├── GameDetails.tsx
│   │   └── GameList.tsx
│   ├── hooks/           # Custom React hooks
│   └── App.tsx          # Main application
├── docs/                # Additional documentation
├── PRD.md              # Product requirements & design specs
├── TESTING.md          # Testing guide
└── NIX.md              # Nix environment documentation
```

## Documentation

- [**PRD.md**](PRD.md) - Product requirements and design specifications
- [**TESTING.md**](TESTING.md) - Comprehensive testing guide
- [**NIX.md**](NIX.md) - Nix development environment setup
- [**SECURITY.md**](SECURITY.md) - Security policy and vulnerability reporting

## Design Philosophy

The application follows a scientific, analytical design approach:

- **Color Palette:** Deep Navy primary, Loyalist Blue, Traitor Red, and Vibrant Cyan accent
- **Typography:** Space Grotesk for UI, JetBrains Mono for numerical data
- **Interactions:** Precise, purposeful animations that reinforce analytical nature
- **Accessibility:** WCAG-compliant color contrasts, keyboard navigation, ARIA labels

See [PRD.md](PRD.md) for complete design specifications.

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
