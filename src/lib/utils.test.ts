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

  it('should merge tailwind classes without conflicts', () => {
    const result = cn('p-4', 'p-2')
    // twMerge should keep only the last padding class
    expect(result).toBe('p-2')
  })

  it('should handle undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle array of classes', () => {
    const result = cn(['class1', 'class2'])
    expect(result).toBe('class1 class2')
  })

  it('should handle objects with boolean values', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true
    })
    expect(result).toBe('class1 class3')
  })

  it('should merge conflicting tailwind classes intelligently', () => {
    // Test tailwind-merge behavior - last value wins for conflicting utilities
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('should preserve non-conflicting classes', () => {
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
