export type ActorType = 'loyalist' | 'traitor';
export type ActorStatus = 'active' | 'removed';
export type GameType = 'random' | 'fixate';

export interface Actor {
  id: number;
  type: ActorType;
  status: ActorStatus;
}

export interface VoteResult {
  targetId: number;
  votes: number;
}

export interface RoundResult {
  roundNumber: number;
  phaseOneVotes: Map<number, number>;
  phaseOneRemoved: number;
  phaseTwoRemoved: number;
  remainingActors: Actor[];
}

export interface GameResult {
  rounds: RoundResult[];
  totalRounds: number;
  outcome: 'traitor_removed' | 'no_loyalists';
}

export class VotingGame {
  private actors: Actor[];
  private roundHistory: RoundResult[] = [];
  private currentRound = 0;
  private gameType: GameType;
  private loyalistSuspects: Map<number, number> = new Map(); // Maps loyalist ID to their suspect ID

  constructor(loyalistCount: number, traitorCount: number, gameType: GameType = 'random') {
    this.actors = [];
    this.gameType = gameType;
    
    for (let i = 0; i < loyalistCount; i++) {
      this.actors.push({
        id: i,
        type: 'loyalist',
        status: 'active'
      });
    }
    
    for (let i = loyalistCount; i < loyalistCount + traitorCount; i++) {
      this.actors.push({
        id: i,
        type: 'traitor',
        status: 'active'
      });
    }
  }

  private getActiveActors(): Actor[] {
    return this.actors.filter(a => a.status === 'active');
  }

  private getActiveLoyalists(): Actor[] {
    return this.actors.filter(a => a.status === 'active' && a.type === 'loyalist');
  }

  private getActiveTraitors(): Actor[] {
    return this.actors.filter(a => a.status === 'active' && a.type === 'traitor');
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getSuspectForLoyalist(loyalistId: number): number {
    const activeActors = this.getActiveActors();
    const validTargets = activeActors.filter(a => a.id !== loyalistId);
    
    if (validTargets.length === 0) {
      return -1;
    }

    // Check if loyalist has an existing suspect
    const currentSuspect = this.loyalistSuspects.get(loyalistId);
    
    // If suspect exists and is still active, keep them
    if (currentSuspect !== undefined) {
      const suspectStillActive = activeActors.some(a => a.id === currentSuspect);
      if (suspectStillActive) {
        return currentSuspect;
      }
    }
    
    // Otherwise, select a new random suspect
    const newSuspect = this.randomChoice(validTargets);
    this.loyalistSuspects.set(loyalistId, newSuspect.id);
    return newSuspect.id;
  }

  private conductVote(eligibleTargets?: Actor[]): Map<number, number> {
    const votes = new Map<number, number>();
    const activeActors = this.getActiveActors();
    const targets = eligibleTargets || activeActors;

    for (const actor of activeActors) {
      let targetId: number;

      if (eligibleTargets) {
        // In tie-breaking scenarios, vote randomly from eligible targets
        const target = this.randomChoice(eligibleTargets);
        targetId = target.id;
      } else if (actor.type === 'loyalist') {
        // Loyalist voting strategy depends on game type
        if (this.gameType === 'fixate') {
          targetId = this.getSuspectForLoyalist(actor.id);
        } else {
          // Random strategy
          const validTargets = activeActors.filter(a => a.id !== actor.id);
          if (validTargets.length > 0) {
            const target = this.randomChoice(validTargets);
            targetId = target.id;
          } else {
            continue;
          }
        }
      } else {
        // Traitor strategy (unchanged): vote for loyalists
        const validTargets = this.getActiveLoyalists();
        if (validTargets.length > 0) {
          const target = this.randomChoice(validTargets);
          targetId = target.id;
        } else {
          continue;
        }
      }

      if (targetId !== -1) {
        votes.set(targetId, (votes.get(targetId) || 0) + 1);
      }
    }

    return votes;
  }

  private findMostVoted(votes: Map<number, number>): number[] {
    let maxVotes = 0;
    const topVoted: number[] = [];

    for (const [actorId, voteCount] of votes.entries()) {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        topVoted.length = 0;
        topVoted.push(actorId);
      } else if (voteCount === maxVotes) {
        topVoted.push(actorId);
      }
    }

    return topVoted;
  }

  private resolvePhaseOne(): { votes: Map<number, number>; removedId: number } {
    let votes = this.conductVote();
    let mostVoted = this.findMostVoted(votes);
    let tieBreakAttempts = 0;
    const MAX_TIE_BREAKS = 10;

    while (mostVoted.length > 1 && tieBreakAttempts < MAX_TIE_BREAKS) {
      const tiedActors = this.actors.filter(a => mostVoted.includes(a.id) && a.status === 'active');
      votes = this.conductVote(tiedActors);
      mostVoted = this.findMostVoted(votes);
      tieBreakAttempts++;
    }

    const removedId = mostVoted.length > 0 ? this.randomChoice(mostVoted) : this.randomChoice(this.getActiveActors()).id;
    const actor = this.actors.find(a => a.id === removedId);
    if (actor) {
      actor.status = 'removed';
    }

    return { votes, removedId };
  }

  private resolvePhaseTwo(): number {
    const activeLoyalists = this.getActiveLoyalists();
    if (activeLoyalists.length === 0) {
      return -1;
    }

    const removed = this.randomChoice(activeLoyalists);
    removed.status = 'removed';
    return removed.id;
  }

  private isGameOver(): boolean {
    const activeTraitors = this.getActiveTraitors();
    const activeLoyalists = this.getActiveLoyalists();
    
    return activeTraitors.length === 0 || activeLoyalists.length === 0;
  }

  private getOutcome(): 'traitor_removed' | 'no_loyalists' {
    const activeTraitors = this.getActiveTraitors();
    return activeTraitors.length === 0 ? 'traitor_removed' : 'no_loyalists';
  }

  public run(): GameResult {
    while (!this.isGameOver()) {
      this.currentRound++;

      const phaseOne = this.resolvePhaseOne();
      
      if (this.isGameOver()) {
        this.roundHistory.push({
          roundNumber: this.currentRound,
          phaseOneVotes: phaseOne.votes,
          phaseOneRemoved: phaseOne.removedId,
          phaseTwoRemoved: -1,
          remainingActors: this.getActiveActors().map(a => ({ ...a }))
        });
        break;
      }

      const phaseTwoRemoved = this.resolvePhaseTwo();

      this.roundHistory.push({
        roundNumber: this.currentRound,
        phaseOneVotes: phaseOne.votes,
        phaseOneRemoved: phaseOne.removedId,
        phaseTwoRemoved,
        remainingActors: this.getActiveActors().map(a => ({ ...a }))
      });

      if (this.isGameOver()) {
        break;
      }
    }

    return {
      rounds: this.roundHistory,
      totalRounds: this.currentRound,
      outcome: this.getOutcome()
    };
  }
}

export interface SimulationResult {
  rounds: number;
  outcome: 'traitor_removed' | 'no_loyalists';
}

export function runSimulation(iterations: number, loyalistCount: number, traitorCount: number, gameType: GameType = 'random'): SimulationResult[] {
  const results: SimulationResult[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const game = new VotingGame(loyalistCount, traitorCount, gameType);
    const result = game.run();
    results.push({
      rounds: result.totalRounds,
      outcome: result.outcome
    });
  }
  
  return results;
}

export function calculateStatistics(results: SimulationResult[]): {
  mean: number;
  median: number;
  mode: number;
  min: number;
  max: number;
  stdDev: number;
} {
  if (results.length === 0) {
    return { mean: 0, median: 0, mode: 0, min: 0, max: 0, stdDev: 0 };
  }

  const rounds = results.map(r => r.rounds);
  const sorted = [...rounds].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  const mean = rounds.reduce((sum, val) => sum + val, 0) / rounds.length;
  
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  const frequency = new Map<number, number>();
  for (const round of rounds) {
    frequency.set(round, (frequency.get(round) || 0) + 1);
  }
  
  let mode = rounds[0];
  let maxFreq = 0;
  for (const [value, freq] of frequency.entries()) {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = value;
    }
  }
  
  const variance = rounds.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / rounds.length;
  const stdDev = Math.sqrt(variance);
  
  return { mean, median, mode, min, max, stdDev };
}
