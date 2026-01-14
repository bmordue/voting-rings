# Implementation Plan: Make All Simulated Games Visible

## Feature Overview

This feature will expose a list of all the games in a simulation run so users can drill down into any specific game and see all the rounds. Currently, users can only view a single randomly selected sample game after running a simulation. This enhancement will provide complete visibility into all simulation results.

## Current State Analysis

### Existing Implementation

The current application (`src/App.tsx`) includes:
- Monte Carlo simulation that runs multiple iterations of the voting game
- A histogram visualization showing the distribution of rounds-to-completion
- A single "sample game" that users can view in a dialog
- The `runSimulation()` function returns only an array of round counts (numbers)
- Individual game details (round-by-round progression) are not stored from the simulation

### Existing Components
- `GameDetails.tsx` - Already displays round-by-round breakdown for a single game
- `Histogram.tsx` - D3-based visualization of results distribution
- `VotingGame` class - Runs individual games and returns detailed `GameResult` objects

### Data Flow Gap

The key issue is that `runSimulation()` in `src/lib/voting-game.ts` currently only returns the round counts:

```typescript
export function runSimulation(iterations: number, loyalistCount: number, traitorCount: number): number[] {
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const game = new VotingGame(loyalistCount, traitorCount);
    const result = game.run();
    results.push(result.totalRounds); // Only storing round count!
  }
  
  return results;
}
```

The full `GameResult` objects (containing all round details) are discarded.

## Technical Requirements

### 1. Data Structure Changes

**Modify `runSimulation()` function:**
```typescript
// Return full game results instead of just round counts
export function runSimulation(
  iterations: number, 
  loyalistCount: number, 
  traitorCount: number
): GameResult[] {
  const results: GameResult[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const game = new VotingGame(loyalistCount, traitorCount);
    const result = game.run();
    results.push(result);
  }
  
  return results;
}
```

**Add game identifier:**
Consider adding a unique ID to each game for easier tracking:
```typescript
export interface GameResult {
  id?: string; // Optional UUID or simple counter
  rounds: RoundResult[];
  totalRounds: number;
  outcome: 'traitor_removed' | 'no_loyalists';
}
```

### 2. State Management Updates

**In `App.tsx`, update state:**
```typescript
// Change from:
const [results, setResults] = useState<number[]>([]);

// To:
const [results, setResults] = useState<GameResult[]>([]);
```

**Update statistics calculation:**
The `calculateStatistics()` function currently accepts `number[]`. To maintain backward compatibility and keep the function focused on its single responsibility:
- Call it with `results.map(r => r.totalRounds)` when needed
- This approach avoids breaking changes and keeps statistics calculation separate from data structure concerns
- **Future enhancement**: Consider overloading the function to accept both `number[]` and `GameResult[]` with appropriate type guards to eliminate the mapping operation

### 3. UI Components

#### A. Game List Component

Create a new component `GameList.tsx`:
```typescript
interface GameListProps {
  games: GameResult[];
  loyalistCount: number;
  traitorCount: number;
  onSelectGame: (game: GameResult) => void;
}
```

**Features:**
- Display all games in a scrollable list or table
- Show key information per game:
  - Game number/ID
  - Total rounds
  - Outcome (traitor removed vs no loyalists)
  - Quick stats (e.g., which traitor was removed)
- Support sorting by:
  - Game number (default)
  - Total rounds (ascending/descending)
  - Outcome type
- Support filtering by:
  - Outcome type
  - Round count range
- Search/jump to specific game number
- Click on any game to view full details

**Design considerations:**
- Use a `Table` component from shadcn/ui for structured data display
- Use `Badge` components to show outcomes (matching existing style)
- Use `ScrollArea` for handling large numbers of games
- **Implement pagination from the start** to handle large datasets (10,000+ games) without performance issues
- Consider 100-200 games per page as a starting point, with user-configurable options
- Modern browsers can efficiently render larger tables with proper virtualization

#### B. Enhanced GameDetails Component - Vote Visibility

**Current State:**
The existing `GameDetails.tsx` component shows which actors were removed in each round but does NOT display the actual vote counts from `phaseOneVotes: Map<number, number>`.

**Enhancement Required:**
Modify `GameDetails.tsx` to show detailed voting information for Phase 1:

```typescript
// In each round card, add vote breakdown section
<div>
  <div className="text-sm font-medium mb-2 text-muted-foreground">Phase 1: Vote Results</div>
  <div className="space-y-1">
    {Array.from(round.phaseOneVotes.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by vote count descending
      .map(([actorId, voteCount]) => (
        <div key={actorId} className="flex items-center justify-between">
          {getActorBadge(actorId)}
          <span className="text-sm font-mono">
            {voteCount} vote{voteCount !== 1 ? 's' : ''}
          </span>
        </div>
      ))}
  </div>
  <div className="flex items-center gap-2 mt-2">
    <span className="text-sm font-semibold">Removed:</span>
    {getActorBadge(round.phaseOneRemoved)}
  </div>
</div>
```

**Features:**
- Display all actors who received votes, sorted by vote count (highest first)
- Show exact vote counts for each actor
- Highlight the actor who was removed
- Use consistent styling with existing badges
- Consider showing vote percentages alongside raw counts
- Optionally collapse/expand vote details for rounds with many voters

**Benefits:**
- Full transparency into voting mechanics
- Users can understand tie situations and close votes
- Helps identify voting patterns and strategic behavior
- Essential for analyzing traitor detection strategies

#### C. Enhanced Histogram Interaction

Modify `Histogram.tsx` to make it interactive:
- When user clicks on a bar, show all games with that specific round count
- Add a callback prop: `onBarClick?: (roundCount: number) => void`
- Update the App to filter and display games when a bar is clicked

#### D. Navigation Between Views

Add a tabbed interface or view switcher:
```typescript
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="all-games">All Games</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    {/* Existing histogram and statistics */}
  </TabsContent>
  
  <TabsContent value="all-games">
    <GameList games={results} ... />
  </TabsContent>
</Tabs>
```

Alternatively, use the existing dialog pattern but enhance it to show a list first, then drill down to individual games.

### 4. Performance Considerations

**Memory Management:**
- Running 10,000 simulations with full game data could consume significant memory
- Each `GameResult` contains arrays of rounds, votes, and actor states
- Estimate: ~1-5KB per game result → 10,000 games = 10-50MB

**Mitigation strategies:**
1. **Pagination**: Load and display games in chunks (e.g., 100 at a time)
2. **Lazy loading**: Store game parameters and only re-run specific games when user requests details
3. **Progressive enhancement**: Offer "light mode" (just round counts) and "detailed mode" (full results)
4. **Virtual scrolling**: Use react-virtual or similar for rendering large lists

**Recommended approach for MVP:**
- Store full results for simulations up to 1,000 games
- For larger simulations (>1,000), show a warning and either:
  - Limit storage to a random sample of games
  - Only store summary data and allow re-running specific games on demand

### 5. Data Persistence - Do We Need a Database?

**Short Answer: No, not for the initial implementation.**

**Analysis:**

**Current Approach - In-Memory Storage (Recommended for MVP):**
- Store simulation results in React component state
- Pros:
  - Simple implementation with no additional infrastructure
  - Fast read/write access
  - No server-side dependencies
  - Sufficient for typical usage patterns (running simulations and analyzing results in same session)
  - 10-50MB of data fits comfortably in browser memory
- Cons:
  - Results lost on page refresh
  - Cannot share results between users or sessions
  - Limited to browser memory constraints

**When You WOULD Need a Database:**
- **Persistence across sessions**: Users want to save simulation results and return to them later
- **Sharing results**: Users want to share specific simulation runs with others via links
- **Historical analysis**: Users want to compare results across multiple simulation sessions over time
- **Collaboration**: Multiple users analyzing the same simulation data
- **Very large datasets**: Simulations exceeding browser memory limits (100k+ games)

**Alternative: Browser Storage (Middle Ground):**
Before implementing a full database, consider browser storage options:
- **localStorage**: Store recent simulations (5MB limit, synchronous)
- **IndexedDB**: Store larger datasets in browser (asyncronous, more complex)
- Pros: Persistence without server infrastructure
- Cons: Still limited to single user/browser, storage limits vary by browser

**Recommendation:**
1. **Phase 1 (this implementation)**: Use in-memory React state only
2. **Phase 2 (if users request it)**: Add localStorage/IndexedDB for session persistence
3. **Phase 3 (if scaling needed)**: Implement backend database with API

This incremental approach validates user needs before investing in database infrastructure.

### 6. Backward Compatibility

Ensure existing features continue to work:
- Histogram visualization (extract round counts from GameResult[])
- Statistics calculation (extract round counts from GameResult[])
- Sample game display (use first game or random selection from results)

## Implementation Steps

### Phase 1: Core Data Structure (2-3 hours)
1. Modify `runSimulation()` to return `GameResult[]`
2. Update `calculateStatistics()` to handle new data structure
3. Update App.tsx state and references
4. Verify histogram still renders correctly
5. Write unit tests for updated functions

### Phase 2: Game List Component (3-4 hours)
1. Create `GameList.tsx` component
2. Implement basic table/list view with game info
3. Add sorting functionality
4. Add filtering by outcome
5. Implement click handler to show game details
6. Style according to existing design system

### Phase 3: Vote Visibility Enhancement (2-3 hours)
1. **Enhance `GameDetails.tsx` to display all votes**
2. Add vote breakdown section showing all actors who received votes
3. Display vote counts in descending order
4. Highlight the removed actor
5. Add optional collapse/expand for detailed vote views
6. Test with various voting scenarios (ties, unanimous votes, close calls)

### Phase 4: Integration (2-3 hours)
1. Add tab/view switching UI in App.tsx
2. Wire up GameList to open enhanced GameDetails dialog
3. Test with various simulation sizes (10, 100, 1000 games)
4. Handle edge cases (0 games, 1 game, etc.)

### Phase 5: Enhancements (2-4 hours)
1. Make histogram bars clickable to filter games
2. Add game number to GameResult
3. Implement search/filter UI
4. Add pagination or virtual scrolling if needed
5. Add loading states and progress indicators

### Phase 6: Performance & Polish (2-3 hours)
1. Implement memory management strategy
2. Add warnings for large simulations
3. Test performance with 10,000+ games
4. Add tooltips and help text
5. Update documentation

### Phase 7: Testing & Documentation (1-2 hours)
1. Write integration tests
2. Test on mobile devices
3. Update README with new feature
4. Add inline code comments
5. Create user documentation

## User Experience Flow

### Scenario 1: Small Simulation (< 100 games)
1. User runs simulation with 50 iterations
2. Results appear with histogram view (default)
3. User clicks "All Games" tab
4. Full list of 50 games appears in a table
5. User clicks on "Game #23" 
6. Dialog opens showing full round-by-round details for that game
7. User closes dialog, still in "All Games" view
8. User can select another game to inspect

### Scenario 2: Large Simulation (> 1000 games)
1. User runs simulation with 5,000 iterations
2. Warning appears: "Storing full details for 5,000 games. This may use significant memory."
3. User proceeds or reduces iteration count
4. Results render in histogram
5. User switches to "All Games" view
6. Games appear in paginated table (100 per page)
7. User can sort, filter, and navigate pages
8. Clicking a game shows details

### Scenario 3: Histogram Interaction
1. User views histogram
2. User clicks on bar showing "8 rounds"
3. View switches to filtered game list showing only games with 8 rounds
4. Header shows: "Games with 8 rounds (234 games)"
5. User can view any of these specific games
6. User can clear filter to see all games again

## Design Specifications

### Color Coding
- Maintain existing color scheme from PRD.md
- Loyalist actors: `oklch(0.65 0.15 240)` (Loyalist Blue)
- Traitor actors: `oklch(0.60 0.20 25)` (Traitor Red)
- Neutral/removed actors: `oklch(0.88 0.01 250)` (Neutral Gray)
- These colors represent actor types, not outcome types

### Typography
- Game numbers: `var(--font-mono)` (JetBrains Mono - defined in `src/index.css`)
- Headers: `var(--font-heading)` (Space Grotesk - defined in `src/index.css`)
- Round counts: `var(--font-mono)` with bold weight
- Use CSS custom properties consistent with existing codebase

### Component States
- Hoverable rows in game list (subtle background change)
- Selected game highlight
- Disabled state for games that can't be viewed (if applicable)

## Edge Cases & Error Handling

1. **No games run yet**: Show empty state with call-to-action
2. **Single game**: Still show in list format for consistency
3. **All games same outcome**: Handle filtering gracefully
4. **Very long games (>100 rounds)**: Ensure GameDetails scrolls properly
5. **Browser memory limits**: Detect and warn before storing huge datasets
6. **Interrupted simulations**: Handle partial results gracefully

## Testing Strategy

### Unit Tests
- `runSimulation()` returns correct GameResult[] structure
- `calculateStatistics()` works with new data format
- GameList sorting and filtering logic
- Game selection handlers

### Integration Tests
- Full simulation flow from run to game detail view
- Histogram → game list interaction
- Filtering and search functionality
- Tab switching with state preservation

### Performance Tests
- Measure memory usage for 1k, 5k, 10k games
- Test render time for GameList with large datasets
- Verify virtual scrolling/pagination performance

### E2E Tests
- User runs simulation and views multiple games
- User filters games by outcome
- User clicks histogram bar and sees filtered results
- User sorts game list by different columns

## Future Enhancements (Out of Scope)

*Priority items for consideration in follow-up iterations:*

1. **Export functionality** ⭐ (High Priority): Download all game results as CSV/JSON - commonly expected in data analysis tools
2. **Persistence** ⭐ (High Priority): Save simulation results to browser storage or backend for later access
3. **Comparison view**: Select multiple games to compare side-by-side
4. **Game replay**: Animate the progression of a selected game
5. **Advanced filtering**: Filter by specific actor removals, vote patterns, etc.
6. **Shareable links**: Generate URLs for specific simulation results
7. **Statistical analysis**: Show distribution of outcomes, actor survival rates, etc.
8. **Memory-based thresholds**: Instead of fixed game count limits, use estimated memory usage that adapts to device capabilities

## Risk Assessment

### Low Risk
- UI component creation (using existing patterns)
- Basic sorting and filtering
- Integration with existing GameDetails component

### Medium Risk  
- Memory consumption with large simulations (mitigated by warnings/limits)
- Performance of rendering large lists (mitigated by virtualization)
- State management complexity (mitigated by keeping it simple)

### High Risk
- None identified for basic feature implementation

## Success Criteria

The feature will be considered successfully implemented when:

1. ✅ Users can view a complete list of all games from a simulation
2. ✅ Users can click any game to see its full round-by-round details
3. ✅ **All votes are visible** - Users can see detailed vote counts for every actor in each round
4. ✅ The list supports sorting and basic filtering
5. ✅ Performance remains acceptable for up to 1,000 game simulations
6. ✅ Existing features (histogram, statistics, sample game) continue to work
7. ✅ The UI follows the existing design system and patterns
8. ✅ Unit tests cover new/modified functions
9. ✅ No memory leaks or performance degradation

## Estimated Effort

- **Total time**: 14-22 hours (updated to include vote visibility enhancement)
- **Complexity**: Medium
- **Dependencies**: None (all required components exist)
- **Team size**: 1 developer
- **Timeline**: 2-3 days for full implementation and testing

## Open Questions

1. Should games be numbered sequentially (Game #1, #2, #3) or use UUIDs?
   - **Recommendation**: Sequential numbers for better UX (easier to reference)

2. Should we preserve the current "View Sample Game" button or replace it entirely?
   - **Recommendation**: Keep it for quick access, but also add "All Games" view

3. What's the maximum simulation size we should support with full game storage?
   - **Recommendation**: 1,000 games with warning; 5,000 with user confirmation

4. Should clicking a histogram bar navigate to filtered games or open a modal?
   - **Recommendation**: Navigate to "All Games" tab with filter applied

5. Should pagination be implemented from the start or added later?
   - **Recommendation**: Implement pagination from the start to prevent browser performance issues with large datasets (simulations can run 10,000+ iterations). This prevents potential crashes and ensures good UX from day one.
