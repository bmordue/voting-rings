export type ActorType = 'loyalist' | 'traitor';
export type ActorStatus = 'active' | 'removed';
export type GameType = 'random' | 'fixate';
export type EndCondition = 'first_traitor_removed' | 'all_one_type';
export type SimulationType = 'random' | 'influence';

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

export interface SimulationResult {
  rounds: number;
  outcome: 'traitor_removed' | 'no_loyalists' | 'all_traitors' | 'all_loyalists';
}
