import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    const result = cn('base', false && 'hidden', true && 'visible')
    expect(result).toBe('base visible')
  })

  it('should handle undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should concatenate all provided classes', () => {
    const result = cn('text-white', 'bg-blue-500', 'p-4', 'rounded')
    expect(result).toBe('text-white bg-blue-500 p-4 rounded')
  })

  it('should handle complex combinations', () => {
    const isActive = true
    const isDisabled = false
    
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class',
      'final-class'
    )
    
    expect(result).toBe('base-class active-class final-class')
  })
})
