# Testing Guide

## Overview

This project uses [Vitest](https://vitest.dev/) for unit testing with comprehensive test coverage for the core business logic.

## Test Coverage

Current test coverage for core logic (`src/lib`):
- **voting-game.ts**: 99%+ coverage
- **utils.ts**: 100% coverage

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test
```

### Run tests once (CI mode)
```bash
npm run test:run
```

### Run tests with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run coverage
```

Coverage reports are generated in the `coverage/` directory with multiple formats:
- HTML report: `coverage/index.html`
- LCOV report: `coverage/lcov.info`
- JSON report: `coverage/coverage-final.json`

## Test Structure

### Unit Tests

#### `src/lib/voting-game.test.ts` (28 tests)
Tests for the core voting game simulation logic:
- **Constructor tests**: Verify game initialization with various player configurations
- **Game outcome tests**: Validate traitor_removed and no_loyalists end states
- **Round progression tests**: Ensure proper round history tracking and actor removal
- **Voting mechanics tests**: Validate voting behavior in both phases
- **Simulation tests**: Test the Monte Carlo simulation runner
- **Statistics tests**: Verify statistical calculations (mean, median, mode, std dev)

#### `src/lib/utils.test.ts` (10 tests)
Tests for the utility functions:
- Class name merging with `cn()` function
- Tailwind CSS class conflict resolution
- Conditional class handling
- Edge cases (undefined, null, empty inputs)

## Continuous Integration

GitHub Actions automatically runs tests on:
- Push to `main` branch
- Pull requests to `main` branch

The CI workflow:
1. Runs linting (non-blocking)
2. Executes all unit tests
3. Generates coverage reports
4. Uploads coverage to Codecov (if configured)
5. Archives coverage reports as artifacts

### Workflow File
`.github/workflows/test.yml`

## Writing Tests

### Example Test

```typescript
import { describe, it, expect } from 'vitest'
import { VotingGame } from '../lib/voting-game'

describe('VotingGame', () => {
  it('should initialize with correct number of actors', () => {
    const game = new VotingGame(5, 2)
    const result = game.run()
    
    expect(result.rounds.length).toBeGreaterThan(0)
    expect(result.totalRounds).toBeGreaterThan(0)
  })
})
```

### Best Practices

1. **Test behavior, not implementation**: Focus on what the code does, not how it does it
2. **Use descriptive test names**: Test names should clearly state what is being tested
3. **Keep tests isolated**: Each test should be independent and not rely on others
4. **Test edge cases**: Include tests for boundary conditions and error cases
5. **Mock randomness carefully**: The voting game uses randomness; run multiple iterations when testing stochastic behavior

## Configuration

### Vitest Config (`vitest.config.ts`)
- **Environment**: jsdom (for React component testing support)
- **Coverage Provider**: v8 (fast and accurate)
- **Coverage Exclusions**: UI components, type definitions, test files
- **Setup Files**: `src/test/setup.ts` for global test configuration

### Coverage Thresholds

Currently, no hard coverage thresholds are enforced, but the core business logic maintains 99%+ coverage.

## Debugging Tests

### Run a specific test file
```bash
npx vitest src/lib/voting-game.test.ts
```

### Run tests matching a pattern
```bash
npx vitest -t "should calculate"
```

### Debug in VS Code
Add this configuration to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal"
}
```

## Future Testing Improvements

Potential areas for expansion:
- Component tests for React components using React Testing Library
- Integration tests for full simulation workflows
- E2E tests for user interactions
- Performance benchmarks for large simulations
- Visual regression tests for charts and visualizations
