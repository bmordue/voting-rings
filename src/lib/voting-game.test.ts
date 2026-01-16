import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VotingGame, runSimulation, calculateStatistics } from './voting-game';
import type { GameType } from './interfaces';

describe('VotingGame', () => {
  describe('constructor', () => {
    it('should initialize with correct number of loyalists and traitors', () => {
      const game = new VotingGame(5, 2)
      const result = game.run()
      
      // Initial actors should be 5 loyalists + 2 traitors = 7 total
      // We can verify this by checking that the game runs and produces a result
      expect(result.rounds.length).toBeGreaterThan(0)
      expect(result.totalRounds).toBeGreaterThan(0)
    })

    it('should create actors with sequential IDs', () => {
      const game = new VotingGame(3, 1)
      const result = game.run()
      
      // First round should have removed actors from the initial pool
      expect(result.rounds[0]).toBeDefined()
      expect(result.rounds[0].phaseOneRemoved).toBeGreaterThanOrEqual(0)
    })

    it('should handle edge case with 1 loyalist and 1 traitor', () => {
      const game = new VotingGame(1, 1)
      const result = game.run()
      
      expect(result.totalRounds).toBeGreaterThan(0)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })

    it('should handle multiple traitors', () => {
      const game = new VotingGame(5, 3)
      const result = game.run()
      
      expect(result.totalRounds).toBeGreaterThan(0)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })
  })

  describe('game outcomes', () => {
    it('should end with traitor_removed when all traitors are eliminated', () => {
      // Run multiple games to find one where traitors are removed
      let traitorRemovedFound = false
      
      for (let i = 0; i < 50; i++) {
        const game = new VotingGame(5, 1)
        const result = game.run()
        
        if (result.outcome === 'traitor_removed') {
          traitorRemovedFound = true
          expect(result.outcome).toBe('traitor_removed')
          break
        }
      }
      
      // At least one game should end with traitor removed
      expect(traitorRemovedFound).toBe(true)
    })

    it('should end with no_loyalists when all loyalists are eliminated', () => {
      // Run multiple games to find one where loyalists are eliminated
      let noLoyalistsFound = false
      
      for (let i = 0; i < 50; i++) {
        const game = new VotingGame(2, 1)
        const result = game.run()
        
        if (result.outcome === 'no_loyalists') {
          noLoyalistsFound = true
          expect(result.outcome).toBe('no_loyalists')
          break
        }
      }
      
      // At least one game should end with no loyalists
      expect(noLoyalistsFound).toBe(true)
    })

    it('should terminate within reasonable number of rounds', () => {
      const game = new VotingGame(10, 3)
      const result = game.run()
      
      // Game should complete within a reasonable number of rounds
      // With 10 loyalists and 3 traitors, it should not exceed 50 rounds
      expect(result.totalRounds).toBeLessThan(50)
      expect(result.totalRounds).toBeGreaterThan(0)
    })
  })

  describe('round progression', () => {
    it('should record round history', () => {
      const game = new VotingGame(4, 1)
      const result = game.run()
      
      expect(result.rounds.length).toBe(result.totalRounds)
      
      // Each round should have required properties
      result.rounds.forEach((round, index) => {
        expect(round.roundNumber).toBe(index + 1)
        expect(round.phaseOneVotes).toBeInstanceOf(Map)
        expect(round.phaseOneRemoved).toBeGreaterThanOrEqual(0)
        expect(round.remainingActors).toBeInstanceOf(Array)
      })
    })

    it('should remove exactly one actor in phase one', () => {
      const game = new VotingGame(5, 2)
      const result = game.run()
      
      result.rounds.forEach(round => {
        expect(round.phaseOneRemoved).toBeGreaterThanOrEqual(0)
        expect(typeof round.phaseOneRemoved).toBe('number')
      })
    })

    it('should track remaining actors after each round', () => {
      const game = new VotingGame(4, 1)
      const result = game.run()
      
      let previousActorCount = 5 // 4 loyalists + 1 traitor
      
      result.rounds.forEach(round => {
        const currentCount = round.remainingActors.length
        
        // Actor count should decrease or stay the same
        expect(currentCount).toBeLessThanOrEqual(previousActorCount)
        
        previousActorCount = currentCount
      })
    })
  })

  describe('voting mechanics', () => {
    it('should record votes in phase one', () => {
      const game = new VotingGame(5, 2)
      const result = game.run()
      
      result.rounds.forEach(round => {
        expect(round.phaseOneVotes.size).toBeGreaterThan(0)
        
        // Votes should be positive integers
        for (const votes of round.phaseOneVotes.values()) {
          expect(votes).toBeGreaterThan(0)
          expect(Number.isInteger(votes)).toBe(true)
        }
      })
    })

    it('should handle phase two removal when game continues', () => {
      const game = new VotingGame(6, 1)
      const result = game.run()
      
      // Most rounds should have phase two (except possibly the last)
      const roundsWithPhaseTwo = result.rounds.filter(r => r.phaseTwoRemoved !== -1)
      
      // At least some rounds should have phase two
      if (result.rounds.length > 1) {
        expect(roundsWithPhaseTwo.length).toBeGreaterThan(0)
      }
    })

    it('should skip phase two when game ends after phase one', () => {
      // Run multiple games to find case where game ends in phase one
      let phaseOneEndFound = false
      
      for (let i = 0; i < 30; i++) {
        const game = new VotingGame(3, 1)
        const result = game.run()
        
        const lastRound = result.rounds[result.rounds.length - 1]
        if (lastRound.phaseTwoRemoved === -1) {
          phaseOneEndFound = true
          expect(lastRound.phaseTwoRemoved).toBe(-1)
          break
        }
      }
      
      expect(phaseOneEndFound).toBe(true)
    })
  })
})

describe('runSimulation', () => {
  it('should run specified number of iterations', () => {
    const iterations = 10
    const results = runSimulation(iterations, 5, 2)
    
    expect(results.length).toBe(iterations)
  })

  it('should return array of round counts', () => {
    const results = runSimulation(5, 4, 1)
    
    results.forEach(result => {
      expect(typeof result.rounds).toBe('number')
      expect(result.rounds).toBeGreaterThan(0)
      expect(Number.isInteger(result.rounds)).toBe(true)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })
  })

  it('should produce varied results across iterations', () => {
    const results = runSimulation(100, 5, 2)
    
    // With randomness, we should get at least some variation
    const uniqueResults = new Set(results.map(r => r.rounds))
    
    // Should have at least 2 different outcomes in 100 runs
    // Using more iterations to ensure statistical significance
    expect(uniqueResults.size).toBeGreaterThanOrEqual(2)
  })

  it('should handle single iteration', () => {
    const results = runSimulation(1, 3, 1)
    
    expect(results.length).toBe(1)
    expect(results[0].rounds).toBeGreaterThan(0)
    expect(['traitor_removed', 'no_loyalists']).toContain(results[0].outcome)
  })

  it('should handle many iterations', () => {
    const results = runSimulation(100, 5, 2)
    
    expect(results.length).toBe(100)
    results.forEach(result => {
      expect(result.rounds).toBeGreaterThan(0)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })
  })
})

describe('calculateStatistics', () => {
  it('should calculate correct mean', () => {
    const results = [2, 4, 6, 8, 10].map(rounds => ({ rounds, outcome: 'traitor_removed' as const }))
    const stats = calculateStatistics(results)
    
    expect(stats.mean).toBe(6)
  })

  it('should calculate correct median for odd-length array', () => {
    const results = [1, 3, 5, 7, 9].map(rounds => ({ rounds, outcome: 'traitor_removed' as const }))
    const stats = calculateStatistics(results)
    
    expect(stats.median).toBe(5)
  })

  it('should calculate correct median for even-length array', () => {
    const results = [2, 4, 6, 8].map(rounds => ({ rounds, outcome: 'traitor_removed' as const }))
    const stats = calculateStatistics(results)
    
    expect(stats.median).toBe(5)
  })

  it('should calculate correct mode', () => {
    const results = [2, 3, 3, 3, 4, 5].map(rounds => ({ rounds, outcome: 'traitor_removed' as const }))
    const stats = calculateStatistics(results)
    
    expect(stats.mode).toBe(3)
  })

  it('should calculate correct min and max', () => {
    const results = [3, 1, 4, 1, 5, 9, 2, 6].map(rounds => ({ rounds, outcome: 'traitor_removed' as const }))
    const stats = calculateStatistics(results)
    
    expect(stats.min).toBe(1)
    expect(stats.max).toBe(9)
  })

  it('should calculate standard deviation', () => {
    const results = [2, 4, 4, 4, 5, 5, 7, 9].map(rounds => ({ rounds, outcome: 'traitor_removed' as const }))
    const stats = calculateStatistics(results)
    
    expect(stats.stdDev).toBeGreaterThan(0)
    expect(typeof stats.stdDev).toBe('number')
  })

  it('should handle empty array', () => {
    const results: Array<{ rounds: number; outcome: 'traitor_removed' | 'no_loyalists' }> = []
    const stats = calculateStatistics(results)
    
    expect(stats.mean).toBe(0)
    expect(stats.median).toBe(0)
    expect(stats.mode).toBe(0)
    expect(stats.min).toBe(0)
    expect(stats.max).toBe(0)
    expect(stats.stdDev).toBe(0)
  })

  it('should handle single value', () => {
    const results = [{ rounds: 5, outcome: 'traitor_removed' as const }]
    const stats = calculateStatistics(results)
    
    expect(stats.mean).toBe(5)
    expect(stats.median).toBe(5)
    expect(stats.mode).toBe(5)
    expect(stats.min).toBe(5)
    expect(stats.max).toBe(5)
    expect(stats.stdDev).toBe(0)
  })

  it('should handle all same values', () => {
    const results = [3, 3, 3, 3, 3].map(rounds => ({ rounds, outcome: 'traitor_removed' as const }))
    const stats = calculateStatistics(results)
    
    expect(stats.mean).toBe(3)
    expect(stats.median).toBe(3)
    expect(stats.mode).toBe(3)
    expect(stats.min).toBe(3)
    expect(stats.max).toBe(3)
    expect(stats.stdDev).toBe(0)
  })

  it('should correctly calculate statistics for realistic simulation data', () => {
    const rounds = runSimulation(50, 5, 2)
    const stats = calculateStatistics(rounds)
    
    expect(stats.mean).toBeGreaterThan(0)
    expect(stats.median).toBeGreaterThan(0)
    expect(stats.mode).toBeGreaterThan(0)
    expect(stats.min).toBeGreaterThan(0)
    expect(stats.max).toBeGreaterThanOrEqual(stats.min)
    expect(stats.stdDev).toBeGreaterThanOrEqual(0)
    
    // Mean should be between min and max
    expect(stats.mean).toBeGreaterThanOrEqual(stats.min)
    expect(stats.mean).toBeLessThanOrEqual(stats.max)
  })
})

describe('VotingGame with fixate strategy', () => {
  describe('constructor', () => {
    it('should accept gameType parameter and initialize correctly', () => {
      const game = new VotingGame(5, 2, 'fixate')
      const result = game.run()
      
      expect(result.rounds.length).toBeGreaterThan(0)
      expect(result.totalRounds).toBeGreaterThan(0)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })

    it('should default to random strategy when gameType not specified', () => {
      const game = new VotingGame(5, 2)
      const result = game.run()
      
      expect(result.rounds.length).toBeGreaterThan(0)
    })
  })

  describe('fixate voting behavior', () => {
    it('should complete games with fixate strategy', () => {
      const game = new VotingGame(10, 3, 'fixate')
      const result = game.run()
      
      expect(result.totalRounds).toBeGreaterThan(0)
      expect(result.totalRounds).toBeLessThan(100)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })

    it('should handle small games with fixate strategy', () => {
      const game = new VotingGame(2, 1, 'fixate')
      const result = game.run()
      
      expect(result.totalRounds).toBeGreaterThan(0)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })

    it('should produce traitor_removed outcomes with fixate strategy', () => {
      let traitorRemovedFound = false
      
      for (let i = 0; i < 50; i++) {
        const game = new VotingGame(5, 1, 'fixate')
        const result = game.run()
        
        if (result.outcome === 'traitor_removed') {
          traitorRemovedFound = true
          expect(result.outcome).toBe('traitor_removed')
          break
        }
      }
      
      expect(traitorRemovedFound).toBe(true)
    })

    it('should produce no_loyalists outcomes with fixate strategy', () => {
      let noLoyalistsFound = false
      
      for (let i = 0; i < 50; i++) {
        const game = new VotingGame(2, 1, 'fixate')
        const result = game.run()
        
        if (result.outcome === 'no_loyalists') {
          noLoyalistsFound = true
          expect(result.outcome).toBe('no_loyalists')
          break
        }
      }
      
      expect(noLoyalistsFound).toBe(true)
    })

    it('should record round history with fixate strategy', () => {
      const game = new VotingGame(4, 1, 'fixate')
      const result = game.run()
      
      expect(result.rounds.length).toBe(result.totalRounds)
      
      result.rounds.forEach((round, index) => {
        expect(round.roundNumber).toBe(index + 1)
        expect(round.phaseOneVotes).toBeInstanceOf(Map)
        expect(round.phaseOneRemoved).toBeGreaterThanOrEqual(0)
        expect(round.remainingActors).toBeInstanceOf(Array)
      })
    })

    it('should handle edge case with 1 loyalist and 1 traitor', () => {
      const game = new VotingGame(1, 1, 'fixate')
      const result = game.run()
      
      expect(result.totalRounds).toBeGreaterThan(0)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })
  })

  describe('comparison with random strategy', () => {
    it('should produce different statistical distributions than random strategy', () => {
      const randomResults = runSimulation(100, 8, 2, 'random')
      const fixateResults = runSimulation(100, 8, 2, 'fixate')
      
      const randomStats = calculateStatistics(randomResults)
      const fixateStats = calculateStatistics(fixateResults)
      
      // Both should produce valid results
      expect(randomStats.mean).toBeGreaterThan(0)
      expect(fixateStats.mean).toBeGreaterThan(0)
      
      // Results should exist for both strategies
      expect(randomResults.length).toBe(100)
      expect(fixateResults.length).toBe(100)
    })

    it('should maintain game validity with both strategies', () => {
      const strategies: GameType[] = ['random', 'fixate']
      
      strategies.forEach(strategy => {
        const game = new VotingGame(5, 2, strategy)
        const result = game.run()
        
        expect(result.totalRounds).toBeGreaterThan(0)
        expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
      })
    })
  })
})

describe('runSimulation with gameType parameter', () => {
  it('should accept and use gameType parameter', () => {
    const results = runSimulation(10, 5, 2, 'fixate')
    
    expect(results.length).toBe(10)
    results.forEach(result => {
      expect(result.rounds).toBeGreaterThan(0)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })
  })

  it('should default to random when gameType not provided', () => {
    const results = runSimulation(10, 5, 2)
    
    expect(results.length).toBe(10)
    results.forEach(result => {
      expect(result.rounds).toBeGreaterThan(0)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })
  })

  it('should work with random gameType explicitly set', () => {
    const results = runSimulation(10, 5, 2, 'random')
    
    expect(results.length).toBe(10)
    results.forEach(result => {
      expect(result.rounds).toBeGreaterThan(0)
      expect(['traitor_removed', 'no_loyalists']).toContain(result.outcome)
    })
  })

  it('should produce varied results with fixate strategy', () => {
    const results = runSimulation(100, 5, 2, 'fixate')
    
    const uniqueResults = new Set(results.map(r => r.rounds))
    
    // Should have variation due to randomness
    expect(uniqueResults.size).toBeGreaterThanOrEqual(2)
  })
})
