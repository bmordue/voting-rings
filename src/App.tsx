import { useState } from 'react';
import { Histogram } from '@/components/Histogram';
import { GameDetails } from '@/components/GameDetails';
import { GameList } from '@/components/GameList';
import { VotingGame, InfluenceVotingGame, runSimulation, calculateStatistics } from '@/lib/voting-game';
import type { EndCondition, SimulationType, GameResult, GameType } from '@/lib/interfaces';

function App() {
  const [loyalists, setLoyalists] = useState(16);
  const [traitors, setTraitors] = useState(4);
  const [iterations, setIterations] = useState(1000);
  const [gameType, setGameType] = useState<GameType>('random');
  const [endCondition, setEndCondition] = useState<EndCondition>('first_traitor_removed');
  const [simulationType, setSimulationType] = useState<SimulationType>('random');
  const [results, setResults] = useState<GameResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sampleGame, setSampleGame] = useState<ReturnType<VotingGame['run']> | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameResult | null>(null);
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'all-games'>('overview');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRunSimulation = async () => {
    if (loyalists < 1 || traitors < 1) {
      setStatusMessage('Must have at least 1 loyalist and 1 traitor');
      return;
    }

    if (iterations < 1) {
      setStatusMessage('Must run at least 1 iteration');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setStatusMessage(null);

    const batchSize = 100;
    const batches = Math.ceil(iterations / batchSize);
    const allResults: GameResult[] = [];

    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(batchSize, iterations - i * batchSize);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const startId = i * batchSize;
      const batchResults = runSimulation(currentBatchSize, loyalists, traitors, simulationType, endCondition, gameType, startId);
      allResults.push(...batchResults);
      
      setProgress(((i + 1) / batches) * 100);
    }

    setResults(allResults);
    
    const game = simulationType === 'influence'
      ? new InfluenceVotingGame(loyalists, traitors)
      : new VotingGame(loyalists, traitors, endCondition, gameType);
    const gameResult = game.run();
    setSampleGame(gameResult);
    
    setIsRunning(false);
    setStatusMessage(`Completed ${iterations} simulations`);
  };

  const stats = results.length > 0 ? calculateStatistics(results) : null;

  const handleReset = () => {
    setResults([]);
    setSampleGame(null);
    setSelectedGame(null);
    setProgress(0);
    setStatusMessage(null);
  };

  const handleSelectGame = (game: GameResult) => {
    setSelectedGame(game);
    setIsGameDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 
            className="text-4xl font-bold mb-2 tracking-tight" 
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
          >
            Monte Carlo Voting Simulation
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore the statistical outcomes of an iterated voting game between loyalists and traitors
          </p>
        </header>

        {statusMessage && (
          <div className="mb-4 px-4 py-2 rounded-md border bg-muted text-sm">
            {statusMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Parameters Card */}
          <div className="bg-card text-card-foreground rounded-xl border py-6 shadow-sm">
            <div className="px-6 mb-4">
              <h2 className="font-semibold">ℹ️ Game Parameters</h2>
              <p className="text-muted-foreground text-sm">Configure the initial game state</p>
            </div>
            <div className="px-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="gameType" className="text-sm font-medium">Voting Strategy</label>
                <select
                  id="gameType"
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value as GameType)}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="random">Random</option>
                  <option value="fixate">Fixate on Suspect</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {gameType === 'random' 
                    ? 'Loyalists vote randomly each round' 
                    : 'Loyalists fixate on a suspect until removed'}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="simulation-type" className="text-sm font-medium">Simulation Type</label>
                <select
                  id="simulation-type"
                  value={simulationType}
                  onChange={(e) => setSimulationType(e.target.value as SimulationType)}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="random">Random Voting</option>
                  <option value="influence">Influence-Based</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="loyalists" className="text-sm font-medium">Loyalists</label>
                  <input
                    id="loyalists"
                    type="number"
                    value={loyalists}
                    onChange={(e) => setLoyalists(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 text-right h-8 px-2 rounded-md border bg-background text-sm"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    min={1}
                  />
                </div>
                <input
                  type="range"
                  value={loyalists}
                  onChange={(e) => setLoyalists(Number(e.target.value))}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="traitors" className="text-sm font-medium">Traitors</label>
                  <input
                    id="traitors"
                    type="number"
                    value={traitors}
                    onChange={(e) => setTraitors(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 text-right h-8 px-2 rounded-md border bg-background text-sm"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    min={1}
                  />
                </div>
                <input
                  type="range"
                  value={traitors}
                  onChange={(e) => setTraitors(Number(e.target.value))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="iterations" className="text-sm font-medium">Simulations</label>
                  <input
                    id="iterations"
                    type="number"
                    value={iterations}
                    onChange={(e) => setIterations(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-24 text-right h-8 px-2 rounded-md border bg-background text-sm"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    min={1}
                  />
                </div>
                <input
                  type="range"
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  min={10}
                  max={10000}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="endCondition" className="text-sm font-medium">End Condition</label>
                <select
                  id="endCondition"
                  value={endCondition}
                  onChange={(e) => setEndCondition(e.target.value as EndCondition)}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="first_traitor_removed">First Traitor Removed</option>
                  <option value="all_one_type">All One Type Remaining</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleRunSimulation} 
                  disabled={isRunning}
                  className="flex-1 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                >
                  ▶ {isRunning ? 'Running...' : 'Run Simulation'}
                </button>
                {results.length > 0 && (
                  <button 
                    onClick={handleReset}
                    className="h-9 px-3 rounded-md border bg-background text-sm hover:bg-muted"
                  >
                    ↺
                  </button>
                )}
              </div>

              {isRunning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Card */}
          {stats && (
            <div className="lg:col-span-2 bg-card text-card-foreground rounded-xl border py-6 shadow-sm">
              <div className="px-6 mb-4">
                <h2 className="font-semibold">📊 Statistics</h2>
                <p className="text-muted-foreground text-sm">Summary of {results.length.toLocaleString()} simulations</p>
              </div>
              <div className="px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Mean</div>
                    <div className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                      {stats.mean.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Median</div>
                    <div className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                      {stats.median.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Mode</div>
                    <div className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                      {stats.mode}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Min</div>
                    <div className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                      {stats.min}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Max</div>
                    <div className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                      {stats.max}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Std Dev</div>
                    <div className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                      {stats.stdDev.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Card */}
        <div className="bg-card text-card-foreground rounded-xl border py-6 shadow-sm">
          <div className="px-6 mb-4">
            <h2 className="font-semibold">Simulation Results</h2>
            <p className="text-muted-foreground text-sm">
              {results.length > 0 
                ? `Explore ${results.length.toLocaleString()} simulated games`
                : 'Run a simulation to see results'}
            </p>
          </div>
          <div className="px-6">
            {results.length > 0 ? (
              <div>
                {/* Tab buttons */}
                <div className="flex gap-1 mb-4 border-b">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                      activeTab === 'overview' 
                        ? 'border-primary text-foreground' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    📊 Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('all-games')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                      activeTab === 'all-games' 
                        ? 'border-primary text-foreground' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    👁 All Games
                  </button>
                </div>

                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <Histogram data={results} width={Math.min(1000, window.innerWidth - 100)} />
                    
                    {sampleGame && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedGame(sampleGame);
                            setIsGameDialogOpen(true);
                          }}
                          className="px-4 py-2 rounded-md border bg-background text-sm hover:bg-muted"
                        >
                          👁 View Sample Game
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'all-games' && (
                  <GameList
                    games={results}
                    onSelectGame={handleSelectGame}
                  />
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                Run a simulation to view results
              </div>
            )}
          </div>
        </div>

        {/* Game Details Dialog */}
        {isGameDialogOpen && selectedGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={() => setIsGameDialogOpen(false)}
            />
            <div className="relative bg-card rounded-xl border shadow-lg max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedGame.id ? `Game #${selectedGame.id} Details` : 'Game Details'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step breakdown of this game simulation
                  </p>
                </div>
                <button
                  onClick={() => setIsGameDialogOpen(false)}
                  className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-muted"
                >
                  ✕
                </button>
              </div>
              <GameDetails 
                game={selectedGame} 
                initialLoyalists={loyalists}
                initialTraitors={traitors}
              />
            </div>
          </div>
        )}

        {/* Game Rules */}
        <div className="mt-6 bg-card text-card-foreground rounded-xl border py-6 shadow-sm">
          <div className="px-6 mb-4">
            <h2 className="font-semibold">Game Rules</h2>
          </div>
          <div className="px-6">
            <div className="flex gap-1 mb-4 border-b">
              <button
                onClick={() => setSimulationType('random')}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  simulationType === 'random' 
                    ? 'border-primary text-foreground' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Random Voting
              </button>
              <button
                onClick={() => setSimulationType('influence')}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  simulationType === 'influence' 
                    ? 'border-primary text-foreground' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Influence-Based
              </button>
            </div>

            {simulationType === 'random' ? (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Setup</h4>
                  <p className="text-muted-foreground">
                    The game starts with a group of actors consisting of loyalists and traitors.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phase 1: Voting</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Each actor votes to remove one other actor</li>
                    <li>Loyalists vote randomly for anyone except themselves</li>
                    <li>Traitors vote randomly for any loyalist</li>
                    <li>The actor with the most votes is removed</li>
                    <li>If there&apos;s a tie, a run-off vote occurs between tied actors only</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phase 2: Random Removal</h4>
                  <p className="text-muted-foreground">
                    A random loyalist is removed from the group.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Game End</h4>
                  <p className="text-muted-foreground mb-2">
                    The game ending condition can be configured:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>First Traitor Removed:</strong> The game ends when either a traitor is removed (loyalists win) or no loyalists remain (traitors win).</li>
                    <li><strong>All One Type Remaining:</strong> The game continues until all remaining actors are either loyalists or all traitors.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Setup</h4>
                  <p className="text-muted-foreground">
                    The game starts with a group of actors consisting of loyalists and traitors. Each actor has an influence score (1-100) against every other actor, set randomly at the start and never changing.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phase 1: Voting</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Each actor votes to remove one other actor</li>
                    <li>Loyalists vote for the actor they have the lowest influence over</li>
                    <li>Traitors vote for the loyalist they have the lowest influence over</li>
                    <li>The actor with the most votes is removed</li>
                    <li>If there&apos;s a tie, a run-off vote occurs between tied actors only</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phase 2: Influence-Based Removal</h4>
                  <p className="text-muted-foreground">
                    The loyalist with the highest total influence over all other actors is removed from the group.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Game End</h4>
                  <p className="text-muted-foreground">
                    The game ends when either a traitor is removed (loyalists win) or no loyalists remain (traitors win).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
