import type { GameResult } from '@/lib/interfaces';

interface GameDetailsProps {
  game: GameResult;
  initialLoyalists: number;
  initialTraitors: number;
}

export function GameDetails({ game, initialLoyalists, initialTraitors }: GameDetailsProps) {
  const getActorBadge = (actorId: number) => {
    const isTraitor = actorId >= initialLoyalists;
    return isTraitor ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: 'var(--traitor)' }}>
        Traitor #{actorId - initialLoyalists + 1}
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: 'var(--loyalist)' }}>
        Loyalist #{actorId + 1}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Game Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border">
            <div className="text-sm text-muted-foreground">Total Rounds</div>
            <div className="text-3xl font-bold mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
              {game.totalRounds}
            </div>
          </div>
          <div className="p-4 rounded-xl border">
            <div className="text-sm text-muted-foreground">Outcome</div>
            <div className="text-lg font-semibold mt-1">
              {{
                'traitor_removed': <span style={{ color: 'var(--loyalist)' }}>First Traitor Removed</span>,
                'all_loyalists': <span style={{ color: 'var(--loyalist)' }}>All Loyalists Remaining</span>,
                'no_loyalists': <span style={{ color: 'var(--traitor)' }}>No Loyalists Left</span>,
                'all_traitors': <span style={{ color: 'var(--traitor)' }}>All Traitors Remaining</span>
              }[game.outcome]}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Round-by-Round Breakdown
        </h3>
        <div className="space-y-4">
          {game.rounds.map((round) => (
            <div key={round.roundNumber} className="p-4 rounded-xl border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                  Round {round.roundNumber}
                </h4>
                <div className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                  {round.remainingActors.length} actors remaining
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-2 text-muted-foreground">Phase 1: Voting Results</div>
                  
                  {round.phaseOneVotes.size > 0 && (
                    <div className="space-y-1 mb-3 p-3 bg-muted/30 rounded-md">
                      <div className="text-xs font-semibold text-muted-foreground mb-2">Vote Distribution</div>
                      {Array.from(round.phaseOneVotes.entries())
                        .sort((a, b) => b[1] - a[1])
                        .map(([actorId, voteCount]) => {
                          const isRemoved = actorId === round.phaseOneRemoved;
                          return (
                            <div 
                              key={actorId} 
                              className={`flex items-center justify-between ${isRemoved ? 'font-semibold' : ''}`}
                            >
                              {getActorBadge(actorId)}
                              <span 
                                className="text-sm" 
                                style={{ fontFamily: 'var(--font-mono)' }}
                              >
                                {voteCount} vote{voteCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Removed:</span>
                    {getActorBadge(round.phaseOneRemoved)}
                  </div>
                </div>

                {round.phaseTwoRemoved !== -1 && (
                  <div>
                    <div className="text-sm font-medium mb-2 text-muted-foreground">Phase 2: Random Loyalist Removal</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Removed:</span>
                      {getActorBadge(round.phaseTwoRemoved)}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium mb-2 text-muted-foreground">Remaining Actors</div>
                  <div className="flex flex-wrap gap-2">
                    {round.remainingActors.map((actor) => (
                      <div key={actor.id}>{getActorBadge(actor.id)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
