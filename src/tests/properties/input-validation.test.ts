/**
 * EME Monaco Chatbot - Input Validation Property Tests
 * Feature: eme-chatbot, Property 1: Input validation and character limits
 * Feature: eme-chatbot, Property 2: Character counter visual feedback
 */

import { describe, test, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { InputValidator } from '@/services/InputValidator';

describe('Input Validation Property Tests', () => {
  let validator: InputValidator;

  beforeEach(() => {
    validator = new InputValidator(4000);
  });

  test('Property 1: Input validation and character limits - accepts valid inputs, rejects invalid ones', () => {
    // Feature: eme-chatbot, Property 1: Input validation and character limits
    fc.assert(fc.property(
      fc.string({ minLength: 0, maxLength: 5000 }),
      (input) => {
        const result = validator.validate(input);
        
        if (input.length <= 4000 && input.trim().length > 0) {
          // Valid input should be accepted
          expect(result.canSend).toBe(true);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        } else if (input.length > 4000) {
          // Input exceeding character limit should be rejected
          expect(result.canSend).toBe(false);
          expect(result.isValid).toBe(false);
          expect(result.errors.some(error => error.includes('maximum length'))).toBe(true);
        } else if (input.trim().length === 0) {
          // Empty or whitespace-only input should be rejected
          expect(result.canSend).toBe(false);
          expect(result.errors.some(error => error.includes('empty'))).toBe(true);
        }
        
        // Character count should always be accurate
        expect(result.characterCount).toBe(input.length);
      }
    ), { numRuns: 100 });
  });

  test('Property 2: Character counter visual feedback - color changes at specified thresholds', () => {
    // Feature: eme-chatbot, Property 2: Character counter visual feedback
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 5000 }),
      (characterCount) => {
        const status = validator.getCharacterCountStatus(characterCount);
        const cssClass = validator.getCharacterCountClass(characterCount);
        
        if (characterCount > 4000) {
          expect(status).toBe('exceeded');
          expect(cssClass).toBe('critical');
        } else if (characterCount >= 3800) { // 95% of 4000
          expect(status).toBe('critical');
          expect(cssClass).toBe('critical');
        } else if (characterCount >= 3500) { // 87.5% of 4000
          expect(status).toBe('warning');
          expect(cssClass).toBe('warning');
        } else {
          expect(status).toBe('normal');
          expect(cssClass).toBe('');
        }
      }
    ), { numRuns: 100 });
  });

  test('Empty and whitespace-only input detection', () => {
    fc.assert(fc.property(
      fc.string().filter(s => /^\s*$/.test(s)), // Generate whitespace-only strings
      (whitespaceInput) => {
        const isEmpty = validator.isEmpty(whitespaceInput);
        const isWhitespaceOnly = validator.isWhitespaceOnly(whitespaceInput);
        const canSend = validator.canSend(whitespaceInput);
        
        // All whitespace-only inputs should be detected
        expect(isEmpty || isWhitespaceOnly).toBe(true);
        expect(canSend).toBe(false);
        
        const result = validator.validate(whitespaceInput);
        expect(result.canSend).toBe(false);
      }
    ), { numRuns: 50 });
  });

  test('Input sanitization and preparation', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 4000 }).filter(s => s.trim().length > 0),
      (validInput) => {
        const prepared = validator.prepareInput(validInput);
        
        // Prepared input should never exceed max length
        expect(prepared.length).toBeLessThanOrEqual(4000);
        
        // Prepared input should be sanitized (no dangerous content)
        expect(prepared).not.toContain('<script');
        expect(prepared).not.toContain('javascript:');
        expect(prepared).not.toContain('data:');
        
        // If original was valid, prepared should not be empty
        if (validInput.trim().length > 0) {
          expect(prepared.length).toBeGreaterThan(0);
        }
      }
    ), { numRuns: 100 });
  });

  test('Character counter formatting consistency', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 10000 }),
      (count) => {
        const formatted = validator.formatCharacterCounter(count);
        
        // Should always include the count and max length
        expect(formatted).toContain(count.toLocaleString());
        expect(formatted).toContain('4,000');
        expect(formatted).toContain('caractères');
        
        // Should be properly formatted
        expect(formatted).toMatch(/^\d{1,3}(,\d{3})* \/ 4,000 caractères$/);
      }
    ), { numRuns: 50 });
  });

  test('Context-specific validation', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 0, maxLength: 100 }),
      fc.constantFrom('general', 'search', 'feedback'),
      (input, context) => {
        const result = validator.validateForContext(input, context);
        
        // Base validation should always apply
        expect(result.characterCount).toBe(input.length);
        
        // Context-specific rules
        if (context === 'search' && input.trim().length > 0 && input.trim().length < 2) {
          expect(result.errors.some(error => error.includes('at least 2 characters'))).toBe(true);
          expect(result.canSend).toBe(false);
        }
        
        if (context === 'feedback' && input.trim().length > 0 && input.trim().length < 10) {
          expect(result.warnings.some(warning => warning.includes('at least 10 characters'))).toBe(true);
        }
      }
    ), { numRuns: 100 });
  });

  test('Validation result consistency', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 0, maxLength: 5000 }),
      (input) => {
        const result = validator.validate(input);
        
        // Result should always have required properties
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('errors');
        expect(result).toHaveProperty('warnings');
        expect(result).toHaveProperty('characterCount');
        expect(result).toHaveProperty('canSend');
        
        // Arrays should always be arrays
        expect(Array.isArray(result.errors)).toBe(true);
        expect(Array.isArray(result.warnings)).toBe(true);
        
        // Character count should be non-negative
        expect(result.characterCount).toBeGreaterThanOrEqual(0);
        
        // canSend should be boolean
        expect(typeof result.canSend).toBe('boolean');
        
        // If there are errors, isValid should be false
        if (result.errors.length > 0) {
          expect(result.isValid).toBe(false);
        }
        
        // If input is invalid, canSend should be false
        if (!result.isValid) {
          expect(result.canSend).toBe(false);
        }
      }
    ), { numRuns: 100 });
  });

  test('XSS pattern detection in validation', () => {
    const xssPatterns = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(1)">',
      '<iframe src="javascript:alert(1)"></iframe>',
      'data:text/html,<script>alert(1)</script>'
    ];

    xssPatterns.forEach(xssInput => {
      const result = validator.validate(xssInput);
      
      // XSS patterns should be detected and rejected
      expect(result.errors.some(error => error.includes('unsafe content'))).toBe(true);
      expect(result.canSend).toBe(false);
    });
  });

  test('Excessive whitespace detection', () => {
    const whitespacePatterns = [
      'text    with    many    spaces',
      'text\n\n\n\nwith\n\n\n\nmany\n\n\n\nlines',
      '   \t\t\t   lots of mixed whitespace   \t\t\t   ',
      'a'.repeat(10) + ' '.repeat(50) + 'b'.repeat(10) // 30%+ whitespace
    ];

    whitespacePatterns.forEach(input => {
      const result = validator.validate(input);
      
      // Should detect excessive whitespace
      expect(result.warnings.some(warning => 
        warning.includes('excessive whitespace')
      )).toBe(true);
    });
  });

  test('Very long lines detection', () => {
    const longLineInput = 'a'.repeat(250); // Single line over 200 characters
    
    const result = validator.validate(longLineInput);
    
    expect(result.warnings.some(warning => 
      warning.includes('very long lines')
    )).toBe(true);
  });

  test('Character limits configuration', () => {
    const customValidator = new InputValidator(2000);
    const limits = customValidator.getCharacterLimits();
    
    expect(limits.maxLength).toBe(2000);
    expect(limits.warningThreshold).toBe(1750); // 87.5% of 2000
    expect(limits.criticalThreshold).toBe(1900); // 95% of 2000
  });
});