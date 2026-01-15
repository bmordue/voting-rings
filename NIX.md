# Voting Rings - Development Environment

This project includes a Nix-based development environment to ensure reproducible builds and consistent development experience across different machines.

## Prerequisites

Make sure you have [Nix](https://nixos.org/download.html) installed on your system. If you don't have it yet:

```bash
curl -L https://nixos.org/nix/install | sh
```

## Using the Development Shell

### With Nix Flakes (recommended):

```bash
# Enter the development environment
nix develop

# Or if you want to use the flake directly
nix develop github:your-username/voting-rings
```

### Without Flakes:

```bash
# Enter the development environment
nix-shell

# Or specifically reference the shell.nix file
nix-shell shell.nix
```

## Available Commands

Once inside the development shell, you can use the following commands:

```bash
npm run dev          # Start development server
npm run build        # Build the project
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run lint         # Lint the code
npm run preview      # Preview production build
npm run coverage     # Generate coverage report
npm run optimize     # Pre-bundle dependencies
```

## Project Information

This project is based on the Spark Template, which provides a clean, minimal environment for building modern web applications with React, TypeScript, and Vite.

## Dependencies

The development environment includes:

- Node.js 18.x
- npm, yarn, pnpm package managers
- Git for version control
- Common command-line utilities (curl, jq, bash, etc.)
- Build tools for native dependencies (gcc, pkg-config)