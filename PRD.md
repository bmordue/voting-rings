# Planning Guide

A Monte Carlo simulation platform for exploring the statistical outcomes of an iterated voting game where traitors and loyalists compete through voting rounds until a terminal condition is met.

**Experience Qualities**: 
1. **Analytical** - The interface should feel precise and data-driven, presenting complex simulation results in clear, digestible visualizations
2. **Interactive** - Users should be able to adjust parameters and immediately see how they affect the distribution of outcomes
3. **Transparent** - The voting game mechanics should be clearly explained and each simulation's progression should be traceable

**Complexity Level**: Light Application (multiple features with basic state)
  - The app focuses on running simulations, displaying results, and allowing parameter adjustments - this is more than a single-purpose tool but doesn't require multiple complex views or advanced state management

## Essential Features

### Run Monte Carlo Simulation
- **Functionality**: Execute multiple iterations of the voting game and collect statistics on round counts before game termination
- **Purpose**: Generate statistically significant data about game outcomes to understand the typical duration and variance
- **Trigger**: User clicks "Run Simulation" button with specified number of iterations
- **Progression**: User sets iteration count → Clicks run → Simulation executes in background → Progress indicator shows completion → Results display in histogram
- **Success criteria**: Simulation completes all iterations, calculates distribution accurately, and updates visualization within reasonable time

### Visualize Results Distribution
- **Functionality**: Display histogram showing frequency distribution of rounds-to-completion across all simulation runs
- **Purpose**: Allow users to understand the probability distribution and identify patterns in game outcomes
- **Trigger**: Simulation completion
- **Progression**: Data collected → Chart renders → User can hover for exact values → Statistics panel shows mean/median/mode
- **Success criteria**: Chart clearly shows distribution shape, hover states work smoothly, statistics are accurate

### Adjust Simulation Parameters
- **Functionality**: Modify initial conditions (number of traitors, number of loyalists, number of simulations to run)
- **Purpose**: Explore how different starting configurations affect the game outcome distribution
- **Trigger**: User interacts with parameter inputs
- **Progression**: User adjusts slider/input → Value updates → User runs new simulation → New results replace old
- **Success criteria**: Parameter changes are reflected immediately, validation prevents invalid configurations

### View Individual Game Details
- **Functionality**: Drill down into a single game iteration to see the step-by-step voting progression
- **Purpose**: Understand the mechanics of how a particular game unfolded
- **Trigger**: User clicks on a bar in the histogram or "View Sample Game" button
- **Progression**: User selects game → Modal/panel opens → Round-by-round breakdown displays → Shows who was voted out each round
- **Success criteria**: Game progression is clear, actor states (loyalist/traitor/removed) are visually distinct

## Edge Case Handling
- **All Loyalists Eliminated**: Handle case where no loyalists remain - display as distinct outcome category
- **Infinite Tie Scenario**: Implement maximum re-vote limit to prevent infinite loops during tie-breaking
- **Zero Iterations**: Validate that user must run at least 1 simulation
- **Invalid Parameters**: Prevent configurations like 0 loyalists or negative values
- **Large Iteration Counts**: Show progress indicator and consider batching for very large simulations (>10000)

## Design Direction
The design should evoke a sense of scientific precision and analytical rigor, like a research tool or data laboratory. It should feel methodical, clear, and trustworthy while maintaining visual interest through careful use of data visualization and color-coding for different actor types.

## Color Selection
A sophisticated palette that distinguishes between actor types and emphasizes data clarity.

- **Primary Color**: Deep Navy `oklch(0.35 0.06 250)` - Communicates analytical precision and trustworthiness, used for primary actions and headers
- **Secondary Colors**: 
  - Loyalist Blue `oklch(0.65 0.15 240)` - Represents loyalist actors, calm and stable
  - Traitor Red `oklch(0.60 0.20 25)` - Represents traitor actors, creates tension and distinction
  - Neutral Gray `oklch(0.88 0.01 250)` - Used for removed/inactive actors
- **Accent Color**: Vibrant Cyan `oklch(0.70 0.14 200)` - Highlights interactive elements, CTAs, and active states
- **Foreground/Background Pairings**:
  - Background (Soft White `oklch(0.98 0.005 250)`): Primary Navy text `oklch(0.35 0.06 250)` - Ratio 9.8:1 ✓
  - Accent (Vibrant Cyan `oklch(0.70 0.14 200)`): White text `oklch(1 0 0)` - Ratio 5.2:1 ✓
  - Loyalist Card (Loyalist Blue `oklch(0.65 0.15 240)`): White text `oklch(1 0 0)` - Ratio 4.8:1 ✓
  - Traitor Card (Traitor Red `oklch(0.60 0.20 25)`): White text `oklch(1 0 0)` - Ratio 5.1:1 ✓

## Font Selection
Typography should convey technical precision while remaining highly readable for data-heavy content.

- **Primary Font**: Space Grotesk - A modern geometric sans with technical character, perfect for headings and UI labels
- **Secondary Font**: JetBrains Mono - Monospace font for numerical data, statistics, and code-like elements (round counts, percentages)

- **Typographic Hierarchy**:
  - H1 (Page Title): Space Grotesk Bold / 32px / tight letter spacing (-0.02em)
  - H2 (Section Headers): Space Grotesk SemiBold / 24px / normal letter spacing
  - H3 (Card Titles): Space Grotesk Medium / 18px / normal letter spacing
  - Body (Descriptions): Space Grotesk Regular / 16px / line height 1.6
  - Data Labels: JetBrains Mono Medium / 14px / tabular numbers
  - Statistics: JetBrains Mono Bold / 20px / tabular numbers

## Animations
Animations should feel precise and purposeful, reinforcing the analytical nature while providing satisfying feedback. Smooth data transitions when new simulation results load (chart bars animate in), subtle hover states on interactive elements with slight scale transforms, and progress indicators that feel mechanical and precise. Loading states should use a clean circular progress indicator rather than generic spinners.

## Component Selection
- **Components**: 
  - Card (for parameter controls and statistics display)
  - Button (primary action for running simulations, secondary for viewing details)
  - Slider (for adjusting number of simulations, traitors, loyalists)
  - Input (for precise numerical entry)
  - Dialog (for viewing individual game details)
  - Progress (for simulation execution status)
  - Badge (for labeling actor types: loyalist, traitor, removed)
  - Separator (dividing sections)
  - Tabs (switching between histogram view and detailed results)
  
- **Customizations**: 
  - Custom histogram component using D3.js for the distribution visualization
  - Custom game timeline component showing round-by-round progression
  - Color-coded badges for actor types matching the palette
  
- **States**: 
  - Buttons: Default (solid primary), Hover (slight lift + brightness increase), Active (pressed inset), Disabled (reduced opacity + no interaction)
  - Sliders: Smooth thumb movement, accent color track fill, tooltip showing current value on drag
  - Cards: Subtle shadow at rest, deeper shadow on hover for interactive cards
  
- **Icon Selection**: 
  - Play icon (triangle) for "Run Simulation"
  - BarChart icon for results section
  - Users icon for actor count parameters
  - Eye icon for "View Details"
  - RefreshCw for "Reset" actions
  - Info for tooltips and help text
  
- **Spacing**: 
  - Container padding: p-6 (24px)
  - Card internal padding: p-6
  - Section gaps: gap-6
  - Element groups: gap-4
  - Tight groups (labels + inputs): gap-2
  
- **Mobile**: 
  - Stack parameter cards vertically on mobile
  - Full-width buttons on small screens
  - Reduce histogram height for mobile viewports
  - Simplified game detail view with scrollable timeline
  - Touch-friendly slider handles (min 44px touch target)
