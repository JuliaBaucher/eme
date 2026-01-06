/**
 * EME Monaco Chatbot - Type Definitions
 * Core interfaces and types for the chatbot application
 */

// Message Types
export type MessageRole = 'user' | 'assistant' | 'system' | 'error';

export interface ChatMessage {
  id: string;                    // UUID v4
  timestamp: number;             // Unix timestamp
  role: MessageRole;
  content: string;               // Sanitized content
  metadata?: {
    requestId?: string;
    processingTime?: number;
    confidence?: number;
    sources?: string[];
  };
}

// Application State
export interface ChatState {
  messages: ChatMessage[];
  sessionId: string;
  lastActivity: number;
  version: string;
  userPreferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'high-contrast';
  fontSize: 'small' | 'medium' | 'large';
  autoScroll: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  language: 'fr' | 'en';
  accessibilityMode: boolean;
}

// Storage Schema
export interface StoredChatData {
  version: '1.0';
  sessionId: string;
  created: number;
  lastModified: number;
  messages: ChatMessage[];
  userPreferences: UserPreferences;
  metadata: {
    totalMessages: number;
    totalCharacters: number;
    averageResponseTime: number;
  };
}

// Validation
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  characterCount: number;
  canSend: boolean;
}

// Error Handling
export type ErrorType = 'network' | 'timeout' | 'server' | 'validation' | 'storage';

export interface ErrorState {
  type: ErrorType;
  message: string;
  code?: string;
  timestamp: number;
  retryable: boolean;
  originalRequest?: ChatAPIRequest;
}

// API Types
export interface ChatAPIRequest {
  message: string;
  sessionId: string;
  context?: {
    userType?: 'business' | 'individual' | 'government';
    previousMessages?: ChatMessage[];
    language?: 'fr' | 'en';
  };
  metadata: {
    clientVersion: string;
    timestamp: number;
    userAgent: string;
  };
}

export interface ChatAPIResponse {
  response: string;
  confidence: number;
  sources?: string[];
  suggestedActions?: string[];
  requestId: string;
  processingTime: number;
  metadata: {
    model: string;
    version: string;
    timestamp: number;
  };
}

// Component Interfaces
export interface ComponentConfig {
  element: HTMLElement;
  options?: Record<string, any>;
}

export interface InputFieldConfig extends ComponentConfig {
  maxLength: number;
  placeholder: string;
  onSend: (message: string) => void;
  onInput: (value: string) => void;
}

export interface MessageContainerConfig extends ComponentConfig {
  autoScroll: boolean;
  maxMessages?: number;
}

// Event Types
export interface ChatbotEvent {
  type: string;
  data?: any;
  timestamp: number;
}

export interface MessageEvent extends ChatbotEvent {
  type: 'message:sent' | 'message:received' | 'message:error';
  data: {
    message: ChatMessage;
    error?: ErrorState;
  };
}

export interface UIEvent extends ChatbotEvent {
  type: 'ui:scroll' | 'ui:focus' | 'ui:resize' | 'ui:theme-change';
  data: {
    element?: HTMLElement;
    value?: any;
  };
}

// Performance Metrics
export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

// Accessibility
export interface AccessibilityConfig {
  announceMessages: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

// Security
export interface SecurityConfig {
  sanitizeInput: boolean;
  sanitizeOutput: boolean;
  validateUrls: boolean;
  enableCSP: boolean;
  maxStorageSize: number;
}

// Theme Configuration
export interface ThemeConfig {
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EventHandler<T = any> = (event: T) => void | Promise<void>;

export type Disposable = {
  dispose(): void;
};