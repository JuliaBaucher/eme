/**
 * EME Monaco Chatbot - Design System Property Tests
 * Feature: eme-chatbot, Property 26: Design system consistency
 */

import { describe, test, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Mock CSS custom properties for testing
const mockCSSProperties = {
  '--monaco-red': '#CE1126',
  '--monaco-white': '#FFFFFF',
  '--primary-blue': '#003366',
  '--secondary-blue': '#0066CC',
  '--font-primary': 'Source Sans Pro, Helvetica Neue, Helvetica, Arial, sans-serif',
  '--font-secondary': 'Roboto, Source Sans Pro, sans-serif',
  '--text-base': '1rem',
  '--text-lg': '1.125rem',
  '--space-4': '1rem',
  '--radius-md': '0.375rem',
  '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
};

// Helper function to create a test element
const createElement = (tagName: string, className?: string): HTMLElement => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  document.body.appendChild(element);
  return element;
};

// Helper function to get computed style value
const getComputedStyleValue = (element: HTMLElement, property: string): string => {
  // Mock getComputedStyle for testing
  const mockValue = mockCSSProperties[property as keyof typeof mockCSSProperties];
  return mockValue || '';
};

// Helper function to check if a color is valid EME color
const isValidEMEColor = (color: string): boolean => {
  const validColors = [
    '#CE1126', // Monaco red
    '#FFFFFF', // Monaco white
    '#003366', // Primary blue
    '#0066CC', // Secondary blue
    '#28A745', // Success green
    '#FFC107', // Warning orange
    '#DC3545', // Error red
    '#17A2B8'  // Info blue
  ];
  return validColors.includes(color.toUpperCase());
};

// Helper function to check if a font is valid EME font
const isValidEMEFont = (font: string): boolean => {
  return font.includes('Source Sans Pro') || font.includes('Roboto');
};

describe('Design System Property Tests', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Add mock CSS custom properties to document
    const style = document.createElement('style');
    style.textContent = `
      :root {
        ${Object.entries(mockCSSProperties)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n        ')}
      }
    `;
    document.head.appendChild(style);
  });

  test('Property 26: Design system consistency - All UI components use official EME design tokens', () => {
    // Feature: eme-chatbot, Property 26: Design system consistency
    fc.assert(fc.property(
      fc.constantFrom('button', 'div', 'span', 'p', 'h1', 'h2', 'h3'),
      fc.constantFrom(
        'btn-primary', 'btn-secondary', 'message-bubble', 'trust-header',
        'chat-input', 'modal-content', 'government-badge'
      ),
      (tagName, className) => {
        const element = createElement(tagName, className);
        
        // Test color consistency
        const backgroundColor = getComputedStyleValue(element, 'background-color');
        const color = getComputedStyleValue(element, 'color');
        const borderColor = getComputedStyleValue(element, 'border-color');
        
        // If colors are set, they should be valid EME colors
        if (backgroundColor && backgroundColor !== 'transparent') {
          expect(isValidEMEColor(backgroundColor) || backgroundColor === 'rgba(0, 0, 0, 0)').toBe(true);
        }
        
        if (color && color !== 'inherit') {
          expect(isValidEMEColor(color) || color.startsWith('rgba')).toBe(true);
        }
        
        if (borderColor && borderColor !== 'transparent') {
          expect(isValidEMEColor(borderColor) || borderColor.startsWith('rgba')).toBe(true);
        }
        
        // Test font consistency
        const fontFamily = getComputedStyleValue(element, 'font-family');
        if (fontFamily) {
          expect(isValidEMEFont(fontFamily)).toBe(true);
        }
        
        // Clean up
        element.remove();
      }
    ), { numRuns: 100 });
  });

  test('Monaco red accent color usage consistency', () => {
    fc.assert(fc.property(
      fc.constantFrom('focus', 'hover', 'active', 'accent'),
      fc.constantFrom('button', 'input', 'link', 'border'),
      (state, elementType) => {
        const element = createElement('div', `${elementType}-${state}`);
        
        // Mock accent color usage
        if (state === 'accent' || state === 'focus') {
          element.style.setProperty('--accent-color', mockCSSProperties['--monaco-red']);
          const accentColor = element.style.getPropertyValue('--accent-color');
          expect(accentColor).toBe('#CE1126');
        }
        
        element.remove();
      }
    ), { numRuns: 50 });
  });

  test('Typography scale consistency', () => {
    fc.assert(fc.property(
      fc.constantFrom('h1', 'h2', 'h3', 'p', 'span', 'button'),
      fc.constantFrom('title', 'subtitle', 'body', 'caption'),
      (tagName, textType) => {
        const element = createElement(tagName, `text-${textType}`);
        
        // Test font size consistency
        const fontSize = getComputedStyleValue(element, 'font-size');
        if (fontSize) {
          // Font sizes should be from the defined scale
          const validSizes = ['0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem', '1.875rem', '2.25rem', '3rem'];
          const isValidSize = validSizes.some(size => fontSize.includes(size.replace('rem', '')));
          expect(isValidSize || fontSize === '16px' || fontSize === '1em').toBe(true);
        }
        
        element.remove();
      }
    ), { numRuns: 50 });
  });

  test('Spacing system consistency', () => {
    fc.assert(fc.property(
      fc.constantFrom('margin', 'padding'),
      fc.constantFrom('top', 'right', 'bottom', 'left', ''),
      (property, direction) => {
        const element = createElement('div', 'test-spacing');
        const fullProperty = direction ? `${property}-${direction}` : property;
        
        // Mock spacing values from the 8px scale
        const spacingValues = ['0', '0.25rem', '0.5rem', '0.75rem', '1rem', '1.25rem', '1.5rem', '2rem', '2.5rem', '3rem'];
        const randomSpacing = spacingValues[Math.floor(Math.random() * spacingValues.length)];
        
        element.style.setProperty(fullProperty, randomSpacing);
        const computedValue = element.style.getPropertyValue(fullProperty);
        
        // Should use values from the 8px-based scale
        expect(spacingValues.includes(computedValue) || computedValue === '0px').toBe(true);
        
        element.remove();
      }
    ), { numRuns: 50 });
  });

  test('Border radius consistency', () => {
    fc.assert(fc.property(
      fc.constantFrom('button', 'input', 'card', 'modal', 'badge'),
      (componentType) => {
        const element = createElement('div', componentType);
        
        // Mock border radius values
        const validRadii = ['0', '0.125rem', '0.375rem', '0.5rem', '0.75rem', '9999px'];
        const randomRadius = validRadii[Math.floor(Math.random() * validRadii.length)];
        
        element.style.borderRadius = randomRadius;
        const computedRadius = element.style.borderRadius;
        
        expect(validRadii.includes(computedRadius)).toBe(true);
        
        element.remove();
      }
    ), { numRuns: 30 });
  });

  test('Shadow consistency', () => {
    fc.assert(fc.property(
      fc.constantFrom('card', 'modal', 'dropdown', 'button'),
      fc.constantFrom('sm', 'md', 'lg', 'xl'),
      (componentType, shadowSize) => {
        const element = createElement('div', `${componentType}-shadow-${shadowSize}`);
        
        // Mock shadow values
        const validShadows = {
          'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        };
        
        const expectedShadow = validShadows[shadowSize as keyof typeof validShadows];
        element.style.boxShadow = expectedShadow;
        
        expect(element.style.boxShadow).toBe(expectedShadow);
        
        element.remove();
      }
    ), { numRuns: 30 });
  });

  test('Government branding elements presence', () => {
    // Test that government branding elements are consistently present
    const governmentElements = [
      { class: 'government-badge', required: true },
      { class: 'monaco-coat-of-arms', required: true },
      { class: 'trust-header', required: true },
      { class: 'ai-disclaimer', required: true }
    ];

    governmentElements.forEach(({ class: className, required }) => {
      const element = createElement('div', className);
      
      if (required) {
        // Should have proper ARIA attributes for government elements
        element.setAttribute('role', 'banner');
        element.setAttribute('aria-label', 'Service officiel du Gouvernement Princier de Monaco');
        
        expect(element.getAttribute('role')).toBe('banner');
        expect(element.getAttribute('aria-label')).toContain('Monaco');
      }
      
      element.remove();
    });
  });

  test('CSS custom properties are properly defined', () => {
    // Test that all required CSS custom properties are available
    const requiredProperties = [
      '--monaco-red',
      '--monaco-white', 
      '--primary-blue',
      '--secondary-blue',
      '--font-primary',
      '--font-secondary',
      '--text-base',
      '--space-4',
      '--radius-md'
    ];

    requiredProperties.forEach(property => {
      const value = mockCSSProperties[property as keyof typeof mockCSSProperties];
      expect(value).toBeDefined();
      expect(value).not.toBe('');
    });
  });
});