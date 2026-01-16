import type { GameResult, Actor } from '@/lib/interfaces';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface GameDetailsProps {
  game: GameResult;
  initialLoyalists: number;
  initialTraitors: number;
}

export function GameDetails({ game, initialLoyalists, initialTraitors }: GameDetailsProps) {
  const getActorBadge = (actorId: number) => {
    const isTraitor = actorId >= initialLoyalists;
    return isTraitor ? (
      <Badge className="bg-traitor text-traitor-foreground hover:bg-traitor">
        Traitor #{actorId - initialLoyalists + 1}
      </Badge>
    ) : (
      <Badge className="bg-loyalist text-loyalist-foreground hover:bg-loyalist">
        Loyalist #{actorId + 1}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Game Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Rounds</div>
            <div className="text-3xl font-bold mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
              {game.totalRounds}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Outcome</div>
            <div className="text-lg font-semibold mt-1">
              {{
                'traitor_removed': <span className="text-loyalist">First Traitor Removed</span>,
                'all_loyalists': <span className="text-loyalist">All Loyalists Remaining</span>,
                'no_loyalists': <span className="text-traitor">No Loyalists Left</span>,
                'all_traitors': <span className="text-traitor">All Traitors Remaining</span>
              }[game.outcome]}
            </div>
          </Card>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Round-by-Round Breakdown
        </h3>
        <div className="space-y-4">
          {game.rounds.map((round) => (
            <Card key={round.roundNumber} className="p-4">
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
                  <div className="text-sm font-medium mb-2 text-muted-foreground">Phase 1: Voting</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Removed:</span>
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
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
