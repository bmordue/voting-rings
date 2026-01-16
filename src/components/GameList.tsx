import { useState, useMemo } from 'react';
import type { GameResult } from '@/lib/interfaces';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CaretLeft, CaretRight, CaretDoubleLeft, CaretDoubleRight, ArrowUp, ArrowDown } from '@phosphor-icons/react';

interface GameListProps {
  games: GameResult[];
  loyalistCount: number;
  traitorCount: number;
  onSelectGame: (game: GameResult) => void;
}

type SortField = 'id' | 'rounds' | 'outcome';
type SortDirection = 'asc' | 'desc';
type OutcomeFilter = 'all' | 'traitor_removed' | 'all_loyalists' | 'no_loyalists' | 'all_traitors';

export function GameList({ games, loyalistCount, traitorCount, onSelectGame }: GameListProps) {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let result = [...games];

    // Apply outcome filter
    if (outcomeFilter !== 'all') {
      result = result.filter(game => game.outcome === outcomeFilter);
    }

    // Apply search filter (by game ID)
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      result = result.filter(game => 
        game.id?.toString().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = (a.id || 0) - (b.id || 0);
          break;
        case 'rounds':
          comparison = a.totalRounds - b.totalRounds;
          break;
        case 'outcome':
          comparison = a.outcome.localeCompare(b.outcome);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [games, outcomeFilter, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedGames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGames = filteredAndSortedGames.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [outcomeFilter, searchQuery, sortField, sortDirection, itemsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getOutcomeBadge = (outcome: GameResult['outcome']) => {
    switch (outcome) {
      case 'traitor_removed':
        return (
          <Badge className="bg-loyalist text-loyalist-foreground hover:bg-loyalist">
            First Traitor Removed
          </Badge>
        );
      case 'all_loyalists':
        return (
          <Badge className="bg-loyalist text-loyalist-foreground hover:bg-loyalist">
            All Loyalists
          </Badge>
        );
      case 'no_loyalists':
        return (
          <Badge className="bg-traitor text-traitor-foreground hover:bg-traitor">
            No Loyalists
          </Badge>
        );
      case 'all_traitors':
        return (
          <Badge className="bg-traitor text-traitor-foreground hover:bg-traitor">
            All Traitors
          </Badge>
        );
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="inline ml-1" />
    ) : (
      <ArrowDown size={14} className="inline ml-1" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters and controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by game number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="flex gap-2">
          <Select value={outcomeFilter} onValueChange={(value) => setOutcomeFilter(value as OutcomeFilter)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="traitor_removed">First Traitor Removed</SelectItem>
              <SelectItem value="all_loyalists">All Loyalists</SelectItem>
              <SelectItem value="no_loyalists">No Loyalists</SelectItem>
              <SelectItem value="all_traitors">All Traitors</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
              <SelectItem value="200">200 per page</SelectItem>
              <SelectItem value="500">500 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {paginatedGames.length > 0 ? startIndex + 1 : 0}–{Math.min(endIndex, filteredAndSortedGames.length)} of {filteredAndSortedGames.length} games
        {outcomeFilter !== 'all' && ` (filtered from ${games.length} total)`}
      </div>

      {/* Table */}
      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  Game #
                  <SortIcon field="id" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('rounds')}
              >
                <div className="flex items-center">
                  Rounds
                  <SortIcon field="rounds" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('outcome')}
              >
                <div className="flex items-center">
                  Outcome
                  <SortIcon field="outcome" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGames.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                  No games found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              paginatedGames.map((game) => (
                <TableRow 
                  key={game.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectGame(game)}
                >
                  <TableCell style={{ fontFamily: 'var(--font-mono)' }} className="font-medium">
                    {game.id}
                  </TableCell>
                  <TableCell style={{ fontFamily: 'var(--font-mono)' }}>
                    {game.totalRounds}
                  </TableCell>
                  <TableCell>
                    {getOutcomeBadge(game.outcome)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectGame(game);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <CaretDoubleLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <CaretLeft size={16} />
            </Button>
            <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <CaretRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <CaretDoubleRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
