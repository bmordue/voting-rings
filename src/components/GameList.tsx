import { useState, useMemo, useEffect } from 'react';
import type { GameResult } from '@/lib/interfaces';

interface GameListProps {
  games: GameResult[];
  onSelectGame: (game: GameResult) => void;
}

type SortField = 'id' | 'rounds' | 'outcome';
type SortDirection = 'asc' | 'desc';
type OutcomeFilter = 'all' | 'traitor_removed' | 'all_loyalists' | 'no_loyalists' | 'all_traitors';

export function GameList({ games, onSelectGame }: GameListProps) {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  const filteredAndSortedGames = useMemo(() => {
    let result = [...games];

    if (outcomeFilter !== 'all') {
      result = result.filter(game => game.outcome === outcomeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      result = result.filter(game => 
        game.id?.toString().includes(query)
      );
    }

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

  const totalPages = Math.ceil(filteredAndSortedGames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGames = filteredAndSortedGames.slice(startIndex, endIndex);

  useEffect(() => {
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
    const isLoyalist = outcome === 'traitor_removed' || outcome === 'all_loyalists';
    const label = {
      'traitor_removed': 'First Traitor Removed',
      'all_loyalists': 'All Loyalists',
      'no_loyalists': 'No Loyalists',
      'all_traitors': 'All Traitors'
    }[outcome];
    
    return (
      <span 
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
        style={{ backgroundColor: isLoyalist ? 'var(--loyalist)' : 'var(--traitor)' }}
      >
        {label}
      </span>
    );
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Filters and controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            placeholder="Search by game number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs h-9 px-3 rounded-md border bg-background text-sm w-full"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={outcomeFilter} 
            onChange={(e) => setOutcomeFilter(e.target.value as OutcomeFilter)}
            className="h-9 px-3 rounded-md border bg-background text-sm w-[200px]"
          >
            <option value="all">All Outcomes</option>
            <option value="traitor_removed">First Traitor Removed</option>
            <option value="all_loyalists">All Loyalists</option>
            <option value="no_loyalists">No Loyalists</option>
            <option value="all_traitors">All Traitors</option>
          </select>
          <select 
            value={itemsPerPage.toString()} 
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="h-9 px-3 rounded-md border bg-background text-sm w-[120px]"
          >
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
            <option value="200">200 per page</option>
            <option value="500">500 per page</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {paginatedGames.length > 0 ? startIndex + 1 : 0}–{Math.min(endIndex, filteredAndSortedGames.length)} of {filteredAndSortedGames.length} games
        {outcomeFilter !== 'all' && ` (filtered from ${games.length} total)`}
      </div>

      {/* Table */}
      <div className="h-[600px] overflow-y-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background z-10 border-b">
            <tr>
              <th 
                className="text-left px-4 py-3 font-medium cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('id')}
              >
                Game #<SortIndicator field="id" />
              </th>
              <th 
                className="text-left px-4 py-3 font-medium cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('rounds')}
              >
                Rounds<SortIndicator field="rounds" />
              </th>
              <th 
                className="text-left px-4 py-3 font-medium cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('outcome')}
              >
                Outcome<SortIndicator field="outcome" />
              </th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedGames.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted-foreground h-32 px-4">
                  No games found matching your criteria
                </td>
              </tr>
            ) : (
              paginatedGames.map((game) => (
                <tr 
                  key={game.id} 
                  className="cursor-pointer hover:bg-muted/50 border-b"
                  onClick={() => onSelectGame(game)}
                >
                  <td className="px-4 py-3 font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                    {game.id}
                  </td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)' }}>
                    {game.totalRounds}
                  </td>
                  <td className="px-4 py-3">
                    {getOutcomeBadge(game.outcome)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="px-3 py-1 rounded-md border bg-background text-xs hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectGame(game);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="h-8 px-2 rounded-md border bg-background text-sm hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button
              className="h-8 px-2 rounded-md border bg-background text-sm hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              className="h-8 px-2 rounded-md border bg-background text-sm hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
            <button
              className="h-8 px-2 rounded-md border bg-background text-sm hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
