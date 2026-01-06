/**
 * EME Monaco Chatbot - Content Sanitization
 * XSS protection and content security utilities
 */

import DOMPurify from 'dompurify';

// Configure DOMPurify for secure content sanitization
const configureDOMPurify = () => {
  // Allow safe HTML elements and attributes
  DOMPurify.addHook('beforeSanitizeElements', (node) => {
    // Remove any script tags
    if (node.nodeName === 'SCRIPT') {
      node.remove();
    }
  });

  // Configure allowed tags and attributes
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'class', 'id', 'target', 'rel'
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
    FORCE_BODY: false
  };

  return config;
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeUserInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // First pass: basic sanitization
  let sanitized = input
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, ''); // Remove vbscript: protocol

  // Second pass: DOMPurify sanitization
  const config = configureDOMPurify();
  sanitized = DOMPurify.sanitize(sanitized, {
    ...config,
    ALLOWED_TAGS: ['p', 'br'], // Very restrictive for user input
    ALLOWED_ATTR: []
  });

  return sanitized;
};

/**
 * Sanitize AI response content for safe display
 */
export const sanitizeAIResponse = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  const config = configureDOMPurify();
  
  // Allow more formatting for AI responses but still secure
  const sanitized = DOMPurify.sanitize(content, {
    ...config,
    ADD_ATTR: ['target'], // Allow target="_blank" for links
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });

  return sanitized;
};

/**
 * Validate and sanitize URLs
 */
export const sanitizeUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove dangerous protocols
  const dangerousProtocols = [
    'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'
  ];

  const lowerUrl = url.toLowerCase().trim();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return null;
    }
  }

  // Only allow http, https, mailto, and tel protocols
  const allowedProtocolRegex = /^(https?|mailto|tel):/i;
  
  if (!allowedProtocolRegex.test(url) && !url.startsWith('/') && !url.startsWith('#')) {
    return null;
  }

  // Basic URL validation
  try {
    if (url.startsWith('http')) {
      new URL(url); // This will throw if invalid
    }
    return DOMPurify.sanitize(url, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  } catch {
    return null;
  }
};

/**
 * Sanitize markdown content with XSS protection
 */
export const sanitizeMarkdown = (markdown: string): string => {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  // First sanitize the raw markdown
  let sanitized = markdown
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');

  // Then apply DOMPurify after markdown processing
  const config = configureDOMPurify();
  sanitized = DOMPurify.sanitize(sanitized, config);

  return sanitized;
};

/**
 * Escape HTML entities for safe text display
 */
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Validate data integrity for localStorage
 */
export const validateStorageData = (data: any): boolean => {
  try {
    // Check if data is an object
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check required fields
    const requiredFields = ['version', 'sessionId', 'messages'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return false;
      }
    }

    // Validate messages array
    if (!Array.isArray(data.messages)) {
      return false;
    }

    // Validate each message
    for (const message of data.messages) {
      if (!message.id || !message.timestamp || !message.role || typeof message.content !== 'string') {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize storage data before saving
 */
export const sanitizeStorageData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  try {
    const sanitized = {
      ...data,
      messages: data.messages?.map((message: any) => ({
        ...message,
        content: sanitizeUserInput(message.content)
      })) || []
    };

    return sanitized;
  } catch {
    return null;
  }
};

/**
 * Check if content contains potential XSS patterns
 */
export const detectXSSPatterns = (content: string): boolean => {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
    /<form\b/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /import\s*\(/gi
  ];

  return xssPatterns.some(pattern => pattern.test(content));
};

/**
 * Generate Content Security Policy nonce
 */
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Initialize security measures
 */
export const initializeSecurity = (): void => {
  // Configure DOMPurify
  configureDOMPurify();

  // Add CSP violation reporting
  document.addEventListener('securitypolicyviolation', (event) => {
    console.warn('CSP Violation:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy
    });
  });

  // Prevent clickjacking
  if (window.self !== window.top) {
    document.body.style.display = 'none';
    console.warn('Clickjacking attempt detected');
  }
};