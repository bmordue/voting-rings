export type ActorType = 'loyalist' | 'traitor';
export type ActorStatus = 'active' | 'removed';
export type EndCondition = 'first_traitor_removed' | 'all_one_type';

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
  outcome: 'traitor_removed' | 'no_loyalists' | 'all_loyalists' | 'all_traitors';
  endCondition: EndCondition;
}

export class VotingGame {
  private actors: Actor[];
  private roundHistory: RoundResult[] = [];
  private currentRound = 0;
  private endCondition: EndCondition;

  constructor(loyalistCount: number, traitorCount: number, endCondition: EndCondition = 'first_traitor_removed') {
    this.actors = [];
    this.endCondition = endCondition;
    
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

  private conductVote(eligibleTargets?: Actor[]): Map<number, number> {
    const votes = new Map<number, number>();
    const activeActors = this.getActiveActors();
    const targets = eligibleTargets || activeActors;

    for (const actor of activeActors) {
      let validTargets: Actor[];

      if (eligibleTargets) {
        validTargets = eligibleTargets;
      } else if (actor.type === 'loyalist') {
        validTargets = activeActors.filter(a => a.id !== actor.id);
      } else {
        validTargets = this.getActiveLoyalists();
      }

      if (validTargets.length > 0) {
        const target = this.randomChoice(validTargets);
        votes.set(target.id, (votes.get(target.id) || 0) + 1);
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
    
    // This helper only checks whether one side has been completely eliminated.
    // Usage by end condition (see run() method):
    // - 'all_one_type': this directly represents the terminal condition
    // - 'first_traitor_removed': this is used only to detect "no loyalists remain";
    //   the fact that the game ends when any traitor is removed is handled elsewhere
    return activeTraitors.length === 0 || activeLoyalists.length === 0;
  }

  private getOutcome(): 'traitor_removed' | 'no_loyalists' | 'all_loyalists' | 'all_traitors' {
    const activeTraitors = this.getActiveTraitors();
    const activeLoyalists = this.getActiveLoyalists();
    
    if (this.endCondition === 'first_traitor_removed') {
      // In 'first_traitor_removed' mode, the game ends either because
      // all loyalists have been removed or because at least one traitor
      // has been removed while some loyalists remain.
      return activeLoyalists.length === 0 ? 'no_loyalists' : 'traitor_removed';
    } else {
      // 'all_one_type'
      if (activeTraitors.length === 0) {
        return 'all_loyalists';
      } else {
        return 'all_traitors';
      }
    }
  }

  public run(): GameResult {
    while (!this.isGameOver()) {
      this.currentRound++;

      const phaseOne = this.resolvePhaseOne();
      
      // For 'first_traitor_removed', check if a traitor was just removed
      const removedActor = this.actors.find(a => a.id === phaseOne.removedId);
      if (this.endCondition === 'first_traitor_removed' && removedActor?.type === 'traitor') {
        this.roundHistory.push({
          roundNumber: this.currentRound,
          phaseOneVotes: phaseOne.votes,
          phaseOneRemoved: phaseOne.removedId,
          phaseTwoRemoved: -1,
          remainingActors: this.getActiveActors().map(a => ({ ...a }))
        });
        break;
      }
      
      // Check if one side has been completely eliminated (applies to both modes)
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

      // For both conditions, check after both phases are complete
      if (this.isGameOver()) {
        break;
      }
    }

    return {
      rounds: this.roundHistory,
      totalRounds: this.currentRound,
      outcome: this.getOutcome(),
      endCondition: this.endCondition
    };
  }
}

export type SimulationType = 'random' | 'influence';

export interface SimulationResult {
  rounds: number;
  outcome: 'traitor_removed' | 'no_loyalists' | 'all_traitors' | 'all_loyalists';
}

export function runSimulation(iterations: number, loyalistCount: number, traitorCount: number, type: SimulationType = 'random', endCondition: EndCondition = 'first_traitor_removed'): SimulationResult[] {
  const results: SimulationResult[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const game = type === 'influence' 
      ? new InfluenceVotingGame(loyalistCount, traitorCount)
      : new VotingGame(loyalistCount, traitorCount, endCondition);
    const result = game.run();
    results.push({
      rounds: result.totalRounds,
      outcome: result.outcome
    });
  }
  
  return results;
}

// Influence-based voting game
export class InfluenceVotingGame {
  private static readonly MAX_INFLUENCE_SCORE = 100;
  private static readonly MIN_INFLUENCE_SCORE = 1;
  
  private actors: Actor[];
  private roundHistory: RoundResult[] = [];
  private currentRound = 0;
  private influenceScores: Map<string, number> = new Map(); // key: "fromId-toId", value: influence score

  constructor(loyalistCount: number, traitorCount: number) {
    this.actors = [];
    
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

    // Initialize influence scores randomly (MIN_INFLUENCE_SCORE to MAX_INFLUENCE_SCORE)
    for (const actor of this.actors) {
      for (const target of this.actors) {
        if (actor.id !== target.id) {
          const key = `${actor.id}-${target.id}`;
          const range = InfluenceVotingGame.MAX_INFLUENCE_SCORE - InfluenceVotingGame.MIN_INFLUENCE_SCORE + 1;
          this.influenceScores.set(key, Math.floor(Math.random() * range) + InfluenceVotingGame.MIN_INFLUENCE_SCORE);
        }
      }
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

  private getInfluence(fromId: number, toId: number): number {
    const key = `${fromId}-${toId}`;
    return this.influenceScores.get(key) || 0;
  }

  private conductVote(eligibleTargets?: Actor[]): Map<number, number> {
    const votes = new Map<number, number>();
    const activeActors = this.getActiveActors();

    for (const actor of activeActors) {
      let validTargets: Actor[];

      if (eligibleTargets) {
        validTargets = eligibleTargets;
      } else if (actor.type === 'loyalist') {
        validTargets = activeActors.filter(a => a.id !== actor.id);
      } else {
        validTargets = this.getActiveLoyalists();
      }

      if (validTargets.length > 0) {
        // Vote for target with lowest influence score
        let lowestInfluence = Infinity;
        let targetId = validTargets[0].id;

        for (const target of validTargets) {
          const influence = this.getInfluence(actor.id, target.id);
          if (influence < lowestInfluence) {
            lowestInfluence = influence;
            targetId = target.id;
          }
        }

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

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
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

    // Find loyalist with highest total influence
    let highestInfluence = -1;
    let targetId = activeLoyalists[0].id;

    for (const loyalist of activeLoyalists) {
      // Calculate total influence this loyalist has over all other active actors
      let totalInfluence = 0;
      const activeActors = this.getActiveActors();
      
      for (const other of activeActors) {
        if (other.id !== loyalist.id) {
          totalInfluence += this.getInfluence(loyalist.id, other.id);
        }
      }

      if (totalInfluence > highestInfluence) {
        highestInfluence = totalInfluence;
        targetId = loyalist.id;
      }
    }

    const removed = this.actors.find(a => a.id === targetId);
    if (removed) {
      removed.status = 'removed';
    }
    return targetId;
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
      outcome: this.getOutcome(),
      endCondition: 'first_traitor_removed' // InfluenceVotingGame only supports this end condition
      // TODO: update InfluenceVotingGame to support all end conditions
    };
  }
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
