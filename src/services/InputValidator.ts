/**
 * EME Monaco Chatbot - Input Validation Service
 * Handles user input validation with character limits and content checking
 */

import type { ValidationResult } from '@/types/interfaces';
import { sanitizeUserInput, detectXSSPatterns } from '@/utils/sanitization';

export class InputValidator {
  private readonly maxLength: number;
  private readonly warningThreshold: number;
  private readonly criticalThreshold: number;

  constructor(maxLength: number = 4000) {
    this.maxLength = maxLength;
    this.warningThreshold = Math.floor(maxLength * 0.875); // 87.5%
    this.criticalThreshold = Math.floor(maxLength * 0.95);  // 95%
  }

  /**
   * Validate user input against all criteria
   */
  validate(input: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        errors: ['Input must be a valid string'],
        warnings: [],
        characterCount: 0,
        canSend: false
      };
    }

    const trimmedInput = input.trim();
    const characterCount = input.length;

    // Check if empty or whitespace only
    if (this.isEmpty(input)) {
      errors.push('Message cannot be empty');
    }

    // Check character limit
    if (characterCount > this.maxLength) {
      errors.push(`Message exceeds maximum length of ${this.maxLength} characters`);
    } else if (characterCount >= this.criticalThreshold) {
      warnings.push(`Approaching character limit (${characterCount}/${this.maxLength})`);
    } else if (characterCount >= this.warningThreshold) {
      warnings.push(`Character limit warning (${characterCount}/${this.maxLength})`);
    }

    // Check for potential security issues
    if (detectXSSPatterns(input)) {
      errors.push('Message contains potentially unsafe content');
    }

    // Check for excessive whitespace
    if (this.hasExcessiveWhitespace(input)) {
      warnings.push('Message contains excessive whitespace');
    }

    // Check for very long lines
    if (this.hasVeryLongLines(input)) {
      warnings.push('Message contains very long lines that may be difficult to read');
    }

    const isValid = errors.length === 0;
    const canSend = isValid && !this.isEmpty(input);

    return {
      isValid,
      errors,
      warnings,
      characterCount,
      canSend
    };
  }

  /**
   * Check if input is empty or contains only whitespace
   */
  isEmpty(input: string): boolean {
    return !input || input.trim().length === 0;
  }

  /**
   * Check if input contains only whitespace characters
   */
  isWhitespaceOnly(input: string): boolean {
    return input.length > 0 && input.trim().length === 0;
  }

  /**
   * Get character count status for UI feedback
   */
  getCharacterCountStatus(count: number): 'normal' | 'warning' | 'critical' | 'exceeded' {
    if (count > this.maxLength) {
      return 'exceeded';
    } else if (count >= this.criticalThreshold) {
      return 'critical';
    } else if (count >= this.warningThreshold) {
      return 'warning';
    }
    return 'normal';
  }

  /**
   * Get character count color class for CSS styling
   */
  getCharacterCountClass(count: number): string {
    const status = this.getCharacterCountStatus(count);
    switch (status) {
      case 'exceeded':
      case 'critical':
        return 'critical';
      case 'warning':
        return 'warning';
      default:
        return '';
    }
  }

  /**
   * Sanitize and prepare input for sending
   */
  prepareInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Sanitize the input
    let prepared = sanitizeUserInput(input);
    
    // Normalize whitespace
    prepared = this.normalizeWhitespace(prepared);
    
    // Trim to max length if needed
    if (prepared.length > this.maxLength) {
      prepared = prepared.substring(0, this.maxLength).trim();
    }

    return prepared;
  }

  /**
   * Check for excessive whitespace patterns
   */
  private hasExcessiveWhitespace(input: string): boolean {
    // Check for more than 3 consecutive spaces
    if (/\s{4,}/.test(input)) {
      return true;
    }

    // Check for more than 2 consecutive newlines
    if (/\n{3,}/.test(input)) {
      return true;
    }

    // Check if more than 30% of the content is whitespace
    const whitespaceCount = (input.match(/\s/g) || []).length;
    const whitespaceRatio = whitespaceCount / input.length;
    
    return whitespaceRatio > 0.3;
  }

  /**
   * Check for very long lines that might cause display issues
   */
  private hasVeryLongLines(input: string): boolean {
    const lines = input.split('\n');
    return lines.some(line => line.length > 200);
  }

  /**
   * Normalize whitespace in input
   */
  private normalizeWhitespace(input: string): string {
    return input
      // Replace multiple spaces with single space
      .replace(/[ \t]+/g, ' ')
      // Replace multiple newlines with maximum of 2
      .replace(/\n{3,}/g, '\n\n')
      // Trim leading/trailing whitespace from each line
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // Final trim
      .trim();
  }

  /**
   * Get validation message for display
   */
  getValidationMessage(result: ValidationResult): string {
    if (result.errors.length > 0) {
      return result.errors[0];
    }
    
    if (result.warnings.length > 0) {
      return result.warnings[0];
    }

    return '';
  }

  /**
   * Check if input can be sent
   */
  canSend(input: string): boolean {
    const result = this.validate(input);
    return result.canSend;
  }

  /**
   * Get character limit information
   */
  getCharacterLimits() {
    return {
      maxLength: this.maxLength,
      warningThreshold: this.warningThreshold,
      criticalThreshold: this.criticalThreshold
    };
  }

  /**
   * Format character counter display
   */
  formatCharacterCounter(count: number): string {
    return `${count.toLocaleString()} / ${this.maxLength.toLocaleString()} caractères`;
  }

  /**
   * Validate input for specific use cases
   */
  validateForContext(input: string, context: 'general' | 'search' | 'feedback'): ValidationResult {
    const baseResult = this.validate(input);

    // Add context-specific validation
    switch (context) {
      case 'search':
        if (input.trim().length < 2) {
          baseResult.errors.push('Search query must be at least 2 characters long');
          baseResult.canSend = false;
        }
        break;
        
      case 'feedback':
        if (input.trim().length < 10) {
          baseResult.warnings.push('Feedback should be at least 10 characters for meaningful input');
        }
        break;
    }

    return baseResult;
  }
}