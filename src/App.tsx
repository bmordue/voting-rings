import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Histogram } from '@/components/Histogram';
import { GameDetails } from '@/components/GameDetails';
import { runSimulation, calculateStatistics, VotingGame, EndCondition, SimulationType, SimulationResult, GameType, InfluenceVotingGame } from '@/lib/voting-game';
import { Play, ChartBar, Eye, ArrowClockwise, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';

function App() {
  const [loyalists, setLoyalists] = useState(16);
  const [traitors, setTraitors] = useState(4);
  const [iterations, setIterations] = useState(1000);
  const [gameType, setGameType] = useState<GameType>('random');
  const [endCondition, setEndCondition] = useState<EndCondition>('first_traitor_removed');
  const [simulationType, setSimulationType] = useState<SimulationType>('random');
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sampleGame, setSampleGame] = useState<ReturnType<VotingGame['run']> | null>(null);

  const handleRunSimulation = async () => {
    if (loyalists < 1 || traitors < 1) {
      toast.error('Must have at least 1 loyalist and 1 traitor');
      return;
    }

    if (iterations < 1) {
      toast.error('Must run at least 1 iteration');
      return;
    }

    setIsRunning(true);
    setProgress(0);

    const batchSize = 100;
    const batches = Math.ceil(iterations / batchSize);
    const allResults: SimulationResult[] = [];

    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(batchSize, iterations - i * batchSize);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const batchResults = runSimulation(currentBatchSize, loyalists, traitors, simulationType, endCondition, gameType);
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
    toast.success(`Completed ${iterations} simulations`);
  };

  const stats = results.length > 0 ? calculateStatistics(results) : null;

  const handleReset = () => {
    setResults([]);
    setSampleGame(null);
    setProgress(0);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={20} />
                Game Parameters
              </CardTitle>
              <CardDescription>Configure the initial game state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gameType">Voting Strategy</Label>
                <Select 
                  value={gameType} 
                  onValueChange={(value) => {
                    if (value === 'random' || value === 'fixate') {
                      setGameType(value);
                    }
                  }}
                >
                  <SelectTrigger id="gameType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="fixate">Fixate on Suspect</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {gameType === 'random' 
                    ? 'Loyalists vote randomly each round' 
                    : 'Loyalists fixate on a suspect until removed'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="simulation-type">Simulation Type</Label>
                <Select value={simulationType} onValueChange={(value) => setSimulationType(value as SimulationType)}>
                  <SelectTrigger id="simulation-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random Voting</SelectItem>
                    <SelectItem value="influence">Influence-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="loyalists">Loyalists</Label>
                  <Input
                    id="loyalists"
                    type="number"
                    value={loyalists}
                    onChange={(e) => setLoyalists(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 text-right"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    min={1}
                  />
                </div>
                <Slider
                  value={[loyalists]}
                  onValueChange={([value]) => setLoyalists(value)}
                  min={1}
                  max={30}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="traitors">Traitors</Label>
                  <Input
                    id="traitors"
                    type="number"
                    value={traitors}
                    onChange={(e) => setTraitors(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 text-right"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    min={1}
                  />
                </div>
                <Slider
                  value={[traitors]}
                  onValueChange={([value]) => setTraitors(value)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="iterations">Simulations</Label>
                  <Input
                    id="iterations"
                    type="number"
                    value={iterations}
                    onChange={(e) => setIterations(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-24 text-right"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    min={1}
                  />
                </div>
                <Slider
                  value={[iterations]}
                  onValueChange={([value]) => setIterations(value)}
                  min={10}
                  max={10000}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endCondition">End Condition</Label>
                <Select value={endCondition} onValueChange={(value) => setEndCondition(value as EndCondition)}>
                  <SelectTrigger id="endCondition" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_traitor_removed">First Traitor Removed</SelectItem>
                    <SelectItem value="all_one_type">All One Type Remaining</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleRunSimulation} 
                  disabled={isRunning}
                  className="flex-1"
                >
                  <Play size={18} weight="fill" className="mr-2" />
                  {isRunning ? 'Running...' : 'Run Simulation'}
                </Button>
                {results.length > 0 && (
                  <Button onClick={handleReset} variant="outline">
                    <ArrowClockwise size={18} />
                  </Button>
                )}
              </div>

              {isRunning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </CardContent>
          </Card>

          {stats && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar size={20} />
                  Statistics
                </CardTitle>
                <CardDescription>Summary of {results.length.toLocaleString()} simulations</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Simulation Results</CardTitle>
                <CardDescription>Distribution of rounds to completion</CardDescription>
              </div>
              {sampleGame && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Eye size={18} className="mr-2" />
                      View Sample Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Sample Game Details</DialogTitle>
                      <DialogDescription>
                        Step-by-step breakdown of a single game simulation
                      </DialogDescription>
                    </DialogHeader>
                    <GameDetails 
                      game={sampleGame} 
                      initialLoyalists={loyalists}
                      initialTraitors={traitors}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Histogram data={results} width={Math.min(1000, window.innerWidth - 100)} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Game Rules</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <Tabs defaultValue={simulationType} value={simulationType} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="random">Random Voting</TabsTrigger>
                <TabsTrigger value="influence">Influence-Based</TabsTrigger>
              </TabsList>
              
              <TabsContent value="random">
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
                      <li>If there's a tie, a run-off vote occurs between tied actors only</li>
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
                  <li>Each actor votes to remove one other actor</li>
                  <li><strong>Random Strategy:</strong> Loyalists vote randomly for anyone except themselves</li>
                  <li><strong>Fixate Strategy:</strong> Each loyalist votes for the same suspect until that actor is removed, then selects a new random suspect</li>
                  <li>Traitors vote randomly for any loyalist</li>
                  <li>The actor with the most votes is removed</li>
                  <li>If there's a tie, a run-off vote occurs between tied actors only</li>
                  <li><strong>First Traitor Removed:</strong> The game ends when either a traitor is removed (loyalists win) or no loyalists remain (traitors win).</li>
                  <li><strong>All One Type Remaining:</strong> The game continues until all remaining actors are either loyalists (loyalists win) or all traitors (traitors win).</li>
                </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="influence">
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
                      <li>If there's a tie, a run-off vote occurs between tied actors only</li>
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;