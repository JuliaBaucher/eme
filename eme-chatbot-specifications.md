# EME Monaco Chatbot - Technical Specifications
## Extended Monaco Entreprises - AI Assistant for Digital Services

---

## 1. APPLICATION OVERVIEW

### 1.1 Goal & Purpose
Create a high-end, single-page chatbot interface that serves as a digital concierge for Monégasque companies seeking information about EME's digital transformation services. The chatbot must provide authoritative, accurate responses about:

- **Maturity Diagnostics**: Digital readiness assessments for businesses
- **Professional Directory**: Network of certified digital service providers
- **Funding Opportunities**: Available grants and financial support programs
- **2026 AI Integration Roadmap**: FlashLearn IA program and future initiatives

### 1.2 Target Users
- **Primary**: Business leaders and decision-makers in Monaco
- **Secondary**: IT professionals and digital transformation managers
- **Tertiary**: Administrative staff seeking digital guidance

### 1.3 Success Metrics
- User engagement: Average session duration > 3 minutes
- Query resolution: 85% of questions answered without human escalation
- User satisfaction: 4.5/5 rating on helpfulness
- Accessibility compliance: WCAG 2.1 AA conformance

---

## 2. VISUAL IDENTITY INTEGRATION

### 2.1 Design System Inheritance
The chatbot inherits the complete EME Monaco visual identity system:

```css
/* Core Brand Colors */
:root {
  --chatbot-primary: var(--primary-blue);      /* #003366 - Authority */
  --chatbot-secondary: var(--secondary-blue);  /* #0066CC - Interactive */
  --chatbot-accent: var(--monaco-red);         /* #CE1126 - Monaco identity */
  --chatbot-background: var(--gray-100);       /* #F8F9FA - Clean background */
  --chatbot-surface: var(--monaco-white);      /* #FFFFFF - Message bubbles */
}
```

### 2.2 Typography Hierarchy
```css
/* Chatbot-specific typography */
.chatbot-title {
  font-family: var(--font-secondary);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--primary-blue);
}

.message-text {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

.system-message {
  font-size: var(--text-sm);
  color: var(--gray-600);
  font-style: italic;
}
```

### 2.3 Component Styling
- **Message Bubbles**: Rounded corners (var(--radius-lg)), subtle shadows
- **Input Field**: EME form styling with Monaco red accent on focus
- **Buttons**: Primary EME button styles with government authority colors
- **Loading States**: Monaco red animated indicators

---

## 3. FUNCTIONAL REQUIREMENTS SPECIFICATION

### 3.1 Input Validation & Guardrails

#### 3.1.1 Empty State Prevention
```typescript
interface InputValidation {
  isEmpty: (input: string) => boolean;
  isWhitespaceOnly: (input: string) => boolean;
  canSend: (input: string) => boolean;
}

// Implementation requirements:
// - Trim whitespace before validation
// - Disable send button when input is invalid
// - Show visual feedback for invalid states
```

#### 3.1.2 Character Budgeting
```typescript
interface CharacterLimits {
  maxLength: 4000;
  warningThreshold: 3500; // 87.5% of limit
  criticalThreshold: 3800; // 95% of limit
}

// Visual requirements:
// - Counter shows: "2,847 / 4,000 characters"
// - Green: 0-3499 characters
// - Orange: 3500-3799 characters  
// - Red: 3800-4000 characters
```

#### 3.1.3 Content Sanitization
```typescript
interface SecurityMeasures {
  sanitizeInput: (userInput: string) => string;
  sanitizeOutput: (aiResponse: string) => string;
  preventXSS: (content: string) => string;
}

// Security requirements:
// - Use DOMPurify or similar library
// - Escape HTML entities
// - Remove script tags and event handlers
// - Validate against injection patterns
```

### 3.2 State & Persistence Management

#### 3.2.1 Message Data Structure
```typescript
interface ChatMessage {
  id: string;           // UUID v4
  timestamp: number;    // Unix timestamp
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;      // Sanitized content
  metadata?: {
    requestId?: string;
    processingTime?: number;
    confidence?: number;
  };
}

interface ChatState {
  messages: ChatMessage[];
  sessionId: string;
  lastActivity: number;
  version: string;      // For migration compatibility
}
```

#### 3.2.2 LocalStorage Management
```typescript
interface StorageManager {
  saveChat: (state: ChatState) => void;
  loadChat: () => ChatState | null;
  clearChat: () => void;
  migrateData: (oldVersion: string) => ChatState;
}

// Storage requirements:
// - Key: 'eme-chatbot-session'
// - Max size: 5MB (browser limit consideration)
// - Automatic cleanup of old sessions (>30 days)
// - Version migration support
```

### 3.3 Interaction Design (UX)

#### 3.3.1 Auto-Scroll Behavior
```typescript
interface ScrollManager {
  scrollToBottom: (smooth?: boolean) => void;
  isUserScrolling: () => boolean;
  shouldAutoScroll: () => boolean;
}

// Scroll requirements:
// - Smooth scroll for new messages
// - Respect user manual scrolling
// - Show "New message" indicator when scrolled up
// - Auto-scroll on window resize
```

#### 3.3.2 Loading States
```css
/* Typing indicator animation */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--gray-200);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite;
}

.typing-dots {
  display: flex;
  gap: var(--space-1);
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--monaco-red);
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}
```

#### 3.3.3 Keyboard Ergonomics
```typescript
interface KeyboardHandlers {
  onEnter: (event: KeyboardEvent) => void;
  onShiftEnter: (event: KeyboardEvent) => void;
  onEscape: (event: KeyboardEvent) => void;
  onArrowUp: (event: KeyboardEvent) => void; // Message history
}

// Keyboard requirements:
// - Enter: Send message (if not empty)
// - Shift+Enter: New line
// - Escape: Clear current input
// - Up Arrow: Navigate message history
// - Auto-focus input after actions
```

### 3.4 Error Handling & Resilience

#### 3.4.1 Network Error Management
```typescript
interface ErrorHandler {
  handleTimeout: (requestId: string) => void;
  handleNetworkError: (error: NetworkError) => void;
  handleServerError: (status: number, message: string) => void;
  retryRequest: (originalMessage: ChatMessage) => void;
}

// Error message templates:
const ERROR_MESSAGES = {
  TIMEOUT: "La demande a pris trop de temps. Veuillez réessayer.",
  NETWORK: "Problème de connexion. Vérifiez votre réseau.",
  SERVER: "Service temporairement indisponible. Contactez le support.",
  RATE_LIMIT: "Trop de demandes. Attendez quelques instants."
};
```

#### 3.4.2 Input Retention
```typescript
interface InputManager {
  saveCurrentInput: (text: string) => void;
  restoreInput: () => string;
  clearSavedInput: () => void;
  showRetryOption: (originalMessage: string) => void;
}
```

### 3.5 Accessibility Implementation

#### 3.5.1 ARIA Integration
```html
<!-- Chat container with live region -->
<div 
  class="chat-messages" 
  role="log" 
  aria-live="polite" 
  aria-label="Conversation avec l'assistant EME">
  
  <!-- Message structure -->
  <div class="message user-message" role="article">
    <div class="message-meta" aria-label="Vous, envoyé à 14:30">
    <div class="message-content">Votre message</div>
  </div>
  
  <div class="message assistant-message" role="article">
    <div class="message-meta" aria-label="Assistant EME, reçu à 14:31">
    <div class="message-content">Réponse de l'assistant</div>
  </div>
</div>

<!-- Input area -->
<form class="chat-input-form" role="form" aria-label="Envoyer un message">
  <label for="message-input" class="sr-only">
    Tapez votre question sur les services EME
  </label>
  <textarea 
    id="message-input"
    aria-describedby="char-counter input-help"
    placeholder="Posez votre question sur les services numériques EME..."
    maxlength="4000">
  </textarea>
  
  <div id="char-counter" aria-live="polite">
    0 / 4,000 caractères
  </div>
  
  <button 
    type="submit" 
    aria-label="Envoyer le message"
    disabled>
    Envoyer
  </button>
</form>
```

#### 3.5.2 Focus Management
```typescript
interface FocusManager {
  focusInput: () => void;
  focusMessage: (messageId: string) => void;
  trapFocus: (container: HTMLElement) => void;
  restoreFocus: () => void;
}

// Focus requirements:
// - Visible focus rings (2px solid var(--secondary-blue))
// - Logical tab order
// - Focus trapping in modals
// - Skip links for screen readers
```

### 3.6 Responsive Design

#### 3.6.1 Breakpoint Behavior
```css
/* Mobile First (320px+) */
.chatbot-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: var(--space-2);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .chatbot-container {
    max-width: 800px;
    margin: 0 auto;
    height: 80vh;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .chatbot-container {
    max-width: 1000px;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: var(--space-6);
  }
  
  .chat-sidebar {
    display: block; /* Show help panel */
  }
}
```

#### 3.6.2 Flexible Input Area
```css
.message-input {
  min-height: 44px;
  max-height: 120px;
  resize: none;
  overflow-y: auto;
  transition: height 0.2s ease;
}

/* Auto-resize behavior */
.message-input[data-auto-resize] {
  height: auto;
  min-height: 44px;
}
```

---

## 4. TRUST & COMPLIANCE FRAMEWORK

### 4.1 AI Transparency & Disclaimers

#### 4.1.1 Trust Header
```html
<header class="chatbot-header">
  <div class="government-badge">
    <img src="/assets/monaco-coat-of-arms.svg" alt="Armoiries de Monaco">
    <div class="badge-text">
      <strong>Service Officiel</strong>
      <span>Gouvernement Princier de Monaco</span>
    </div>
  </div>
  
  <div class="ai-disclaimer">
    <span class="ai-badge">🤖 Assistant IA</span>
    <button class="info-button" aria-describedby="ai-info-tooltip">
      ℹ️
    </button>
  </div>
</header>
```

#### 4.1.2 AI Disclosure Modal
```html
<div id="ai-info-modal" class="modal" role="dialog" aria-labelledby="ai-modal-title">
  <div class="modal-content">
    <h2 id="ai-modal-title">À propos de cet assistant IA</h2>
    
    <div class="disclaimer-content">
      <h3>🤖 Intelligence Artificielle</h3>
      <p>Cet assistant utilise l'intelligence artificielle pour répondre à vos questions sur les services EME. Bien que nous nous efforcions de fournir des informations précises, les réponses peuvent parfois être incomplètes ou nécessiter une vérification.</p>
      
      <h3>🔒 Confidentialité des Données</h3>
      <p>Vos conversations sont stockées localement sur votre appareil. Aucune donnée personnelle n'est transmise à des tiers. Vous pouvez effacer votre historique à tout moment.</p>
      
      <h3>✅ Informations Officielles</h3>
      <p>Pour des informations officielles ou des démarches administratives, consultez directement les services EME ou contactez nos équipes.</p>
      
      <div class="contact-fallback">
        <h4>Besoin d'aide humaine ?</h4>
        <a href="mailto:contact@eme.gouv.mc" class="btn btn-primary">
          Contacter EME
        </a>
        <a href="tel:+37798987654" class="btn btn-secondary">
          Appeler le +377 98 98 76 54
        </a>
      </div>
    </div>
    
    <button class="btn btn-primary" onclick="closeModal()">
      J'ai compris
    </button>
  </div>
</div>
```

### 4.2 Data Privacy & Security

#### 4.2.1 Privacy Controls
```html
<div class="privacy-controls">
  <button class="btn btn-secondary" onclick="clearChat()" aria-describedby="clear-help">
    🗑️ Effacer l'historique
  </button>
  
  <div id="clear-help" class="help-text">
    Supprime toutes les conversations stockées sur cet appareil
  </div>
  
  <button class="btn btn-secondary" onclick="exportChat()">
    📥 Exporter la conversation
  </button>
</div>
```

#### 4.2.2 Security Headers
```typescript
// Required security implementations
interface SecurityConfig {
  contentSecurityPolicy: string;
  httpsOnly: boolean;
  noSniff: boolean;
  frameOptions: 'DENY';
  referrerPolicy: 'strict-origin-when-cross-origin';
}

// CSP Header
const CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.eme.gouv.mc;
  font-src 'self' https://fonts.googleapis.com;
`;
```

### 4.3 Compliance & Ethics

#### 4.3.1 GDPR Compliance
```typescript
interface GDPRCompliance {
  dataMinimization: boolean;    // Only collect necessary data
  purposeLimitation: boolean;   // Use data only for stated purpose
  storageMinimization: boolean; // Auto-delete old conversations
  userRights: {
    access: boolean;            // Export conversation
    rectification: boolean;     // Edit messages
    erasure: boolean;          // Clear chat
    portability: boolean;      // Export in standard format
  };
}
```

#### 4.3.2 Ethical AI Guidelines
```html
<div class="ethics-notice">
  <h4>Engagement Éthique</h4>
  <ul>
    <li>✅ Transparence sur les capacités et limites de l'IA</li>
    <li>✅ Respect de la vie privée et protection des données</li>
    <li>✅ Accessibilité pour tous les utilisateurs</li>
    <li>✅ Supervision humaine disponible</li>
    <li>✅ Amélioration continue basée sur les retours</li>
  </ul>
</div>
```

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Frontend Stack
```typescript
interface TechStack {
  framework: 'Vanilla TypeScript' | 'React' | 'Vue';
  styling: 'CSS Custom Properties' | 'Tailwind CSS';
  bundler: 'Vite' | 'Webpack';
  testing: 'Jest' | 'Vitest';
  accessibility: 'axe-core';
  security: 'DOMPurify';
  markdown: 'marked' | 'markdown-it';
}
```

### 5.2 API Integration
```typescript
interface ChatAPI {
  endpoint: 'https://api.eme.gouv.mc/chat';
  method: 'POST';
  headers: {
    'Content-Type': 'application/json';
    'X-API-Version': 'v1';
    'X-Client-Version': string;
  };
  timeout: 30000; // 30 seconds
  retries: 3;
}

interface APIRequest {
  message: string;
  sessionId: string;
  context?: {
    userType?: 'business' | 'individual' | 'government';
    previousMessages?: ChatMessage[];
  };
}

interface APIResponse {
  response: string;
  confidence: number;
  sources?: string[];
  suggestedActions?: string[];
  requestId: string;
}
```

### 5.3 Performance Requirements
```typescript
interface PerformanceTargets {
  firstContentfulPaint: 1500; // ms
  largestContentfulPaint: 2500; // ms
  cumulativeLayoutShift: 0.1;
  firstInputDelay: 100; // ms
  timeToInteractive: 3000; // ms
}

// Bundle size limits
interface BundleLimits {
  javascript: 150; // KB gzipped
  css: 50; // KB gzipped
  images: 200; // KB total
  fonts: 100; // KB total
}
```

---

## 6. QUALITY OF LIFE FEATURES

### 6.1 Markdown Support
```typescript
interface MarkdownRenderer {
  supportedElements: [
    'headers', 'bold', 'italic', 'lists', 
    'links', 'code', 'blockquotes'
  ];
  sanitization: boolean;
  linkTarget: '_blank';
  codeHighlighting: boolean;
}
```

### 6.2 Copy to Clipboard
```html
<div class="message-actions">
  <button 
    class="action-btn" 
    onclick="copyToClipboard(messageId)"
    aria-label="Copier ce message">
    📋 Copier
  </button>
  
  <button 
    class="action-btn" 
    onclick="shareMessage(messageId)"
    aria-label="Partager ce message">
    🔗 Partager
  </button>
</div>
```

### 6.3 Theme Toggle
```css
/* Light theme (default) */
:root {
  --theme-background: var(--gray-100);
  --theme-surface: var(--monaco-white);
  --theme-text: var(--gray-900);
}

/* Dark theme */
[data-theme="dark"] {
  --theme-background: #1a1a1a;
  --theme-surface: #2d2d2d;
  --theme-text: #ffffff;
}

/* High contrast theme */
[data-theme="high-contrast"] {
  --theme-background: #000000;
  --theme-surface: #ffffff;
  --theme-text: #000000;
}
```

---

## 7. TESTING & VALIDATION

### 7.1 Automated Testing
```typescript
interface TestSuite {
  unit: {
    inputValidation: boolean;
    messageFormatting: boolean;
    storageManager: boolean;
    errorHandling: boolean;
  };
  integration: {
    apiCommunication: boolean;
    stateManagement: boolean;
    userInteractions: boolean;
  };
  e2e: {
    completeConversation: boolean;
    errorRecovery: boolean;
    accessibilityFlow: boolean;
  };
  accessibility: {
    screenReader: boolean;
    keyboardNavigation: boolean;
    colorContrast: boolean;
    focusManagement: boolean;
  };
}
```

### 7.2 Manual Testing Checklist
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS Safari, Android Chrome)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Keyboard-only navigation
- [ ] Network failure scenarios
- [ ] Long conversation performance
- [ ] Character limit edge cases
- [ ] LocalStorage quota exceeded

---

## 8. DEPLOYMENT & MONITORING

### 8.1 Deployment Requirements
```yaml
# Deployment configuration
environment:
  production:
    domain: chat.eme.gouv.mc
    ssl: required
    cdn: enabled
    compression: gzip
    caching: 
      static: 1 year
      html: 1 hour
      api: no-cache

monitoring:
  uptime: required
  performance: Core Web Vitals
  errors: Sentry integration
  analytics: Privacy-compliant tracking
```

### 8.2 Success Metrics
```typescript
interface Metrics {
  usage: {
    dailyActiveUsers: number;
    averageSessionDuration: number;
    messagesPerSession: number;
    returnUserRate: number;
  };
  performance: {
    responseTime: number;
    errorRate: number;
    accessibilityScore: number;
    mobileUsability: number;
  };
  satisfaction: {
    userRating: number;
    taskCompletion: number;
    escalationRate: number;
    feedbackScore: number;
  };
}
```

---

## 9. IMPLEMENTATION ROADMAP

### Phase 1: Core Functionality (4 weeks)
- Basic chat interface with EME visual identity
- Input validation and character limits
- Message persistence with localStorage
- Basic error handling and loading states

### Phase 2: Enhanced UX (3 weeks)
- Advanced keyboard shortcuts
- Markdown rendering
- Copy to clipboard functionality
- Responsive design optimization

### Phase 3: Trust & Compliance (2 weeks)
- AI transparency features
- Privacy controls and data export
- Accessibility audit and fixes
- Security hardening

### Phase 4: Quality & Polish (2 weeks)
- Performance optimization
- Cross-browser testing
- User acceptance testing
- Documentation and deployment

---

## 10. MAINTENANCE & EVOLUTION

### 10.1 Regular Updates
- Monthly security patches
- Quarterly accessibility audits
- Bi-annual UX reviews
- Annual comprehensive redesign evaluation

### 10.2 Feature Evolution
- Integration with EME service booking
- Multi-language support (English, Italian)
- Voice input/output capabilities
- Advanced analytics and personalization

This specification provides a comprehensive foundation for building a world-class, government-grade chatbot interface that maintains the highest standards of usability, accessibility, security, and trust.