/**
 * EME Monaco Chatbot - Main Application Entry Point
 * Initializes and orchestrates the chatbot application
 */

import './styles/main.css';
import { ChatbotContainer } from './components/ChatbotContainer';
import { initializeSecurity } from './utils/sanitization';

// Application configuration
const APP_CONFIG = {
  apiUrl: (import.meta.env.VITE_API_URL as string) || 'https://api.eme.gouv.mc/chat',
  version: (import.meta.env.VITE_APP_VERSION as string) || '1.0.0',
  maxRetries: 3,
  requestTimeout: 30000,
  enableAnalytics: false // Disabled for privacy
};

/**
 * Initialize the application
 */
async function initializeApp(): Promise<void> {
  try {
    // Initialize security measures
    initializeSecurity();
    
    // Check browser compatibility
    if (!checkBrowserCompatibility()) {
      showBrowserCompatibilityError();
      return;
    }

    // Initialize accessibility features
    initializeAccessibility();
    
    // Get app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }

    // Remove loading state
    const loadingContainer = appContainer.querySelector('.loading-container');
    if (loadingContainer) {
      loadingContainer.remove();
    }

    // Initialize chatbot
    const chatbot = new ChatbotContainer({
      element: appContainer,
      apiUrl: APP_CONFIG.apiUrl,
      maxRetries: APP_CONFIG.maxRetries,
      requestTimeout: APP_CONFIG.requestTimeout
    });

    // Initialize chatbot
    await chatbot.initialize();

    // Enable mock mode for development
    if (import.meta.env.DEV) {
      console.log('Development mode: Using mock API responses');
    }

    // Set up global error handling
    setupGlobalErrorHandling(chatbot);
    
    // Set up performance monitoring
    setupPerformanceMonitoring();
    
    // Set up accessibility monitoring
    setupAccessibilityMonitoring();

    console.log(`EME Monaco Chatbot v${APP_CONFIG.version} initialized successfully`);
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    showInitializationError(error);
  }
}

/**
 * Check browser compatibility
 */
function checkBrowserCompatibility(): boolean {
  // Check for required features
  const requiredFeatures = [
    'localStorage' in window,
    'fetch' in window,
    'Promise' in window,
    'addEventListener' in document,
    'querySelector' in document,
    'classList' in document.createElement('div')
  ];

  return requiredFeatures.every(feature => feature);
}

/**
 * Show browser compatibility error
 */
function showBrowserCompatibilityError(): void {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.innerHTML = `
      <div class="error-container">
        <div class="error-content">
          <h1>Navigateur non compatible</h1>
          <p>Votre navigateur ne supporte pas toutes les fonctionnalités requises pour utiliser l'assistant EME.</p>
          <p>Veuillez utiliser une version récente de:</p>
          <ul>
            <li>Chrome 90+</li>
            <li>Firefox 88+</li>
            <li>Safari 14+</li>
            <li>Edge 90+</li>
          </ul>
          <p>
            <a href="https://eme.gouv.mc" class="btn btn-primary">
              Retour au site EME
            </a>
          </p>
        </div>
      </div>
    `;
  }
}

/**
 * Show initialization error
 */
function showInitializationError(error: any): void {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.innerHTML = `
      <div class="error-container">
        <div class="error-content">
          <h1>Erreur d'initialisation</h1>
          <p>Une erreur s'est produite lors du chargement de l'assistant EME.</p>
          <p>Veuillez rafraîchir la page ou réessayer plus tard.</p>
          <details>
            <summary>Détails techniques</summary>
            <pre>${error.message || 'Erreur inconnue'}</pre>
          </details>
          <div class="error-actions">
            <button onclick="window.location.reload()" class="btn btn-primary">
              Rafraîchir la page
            </button>
            <a href="https://eme.gouv.mc" class="btn btn-secondary">
              Retour au site EME
            </a>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Initialize accessibility features
 */
function initializeAccessibility(): void {
  // Set up focus management
  document.addEventListener('keydown', (event) => {
    // Skip to main content with Alt+1
    if (event.altKey && event.key === '1') {
      event.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
      }
    }
  });

  // Announce page load to screen readers
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = 'Assistant EME chargé et prêt à utiliser';
  document.body.appendChild(announcement);

  // Remove announcement after screen readers have processed it
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  }, 1000);

  // Set up reduced motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
  }

  // Set up high contrast preferences
  if (window.matchMedia('(prefers-contrast: high)').matches) {
    document.documentElement.classList.add('high-contrast');
  }
}

/**
 * Set up global error handling
 */
function setupGlobalErrorHandling(chatbot: ChatbotContainer): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Show user-friendly error message
    chatbot.showSystemMessage(
      'Une erreur inattendue s\'est produite. Veuillez réessayer.',
      'error'
    );
    
    // Prevent default browser error handling
    event.preventDefault();
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    
    // Show user-friendly error message
    chatbot.showSystemMessage(
      'Une erreur technique s\'est produite. L\'application continue de fonctionner.',
      'error'
    );
  });

  // Handle CSP violations
  document.addEventListener('securitypolicyviolation', (event) => {
    console.warn('CSP Violation:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy
    });
  });
}

/**
 * Set up performance monitoring
 */
function setupPerformanceMonitoring(): void {
  // Monitor Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      console.log('CLS:', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  // Monitor memory usage (if available)
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
        console.warn('High memory usage detected');
      }
    }, 30000); // Check every 30 seconds
  }
}

/**
 * Set up accessibility monitoring
 */
function setupAccessibilityMonitoring(): void {
  // Monitor for focus traps in modals
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const modal = document.querySelector('.modal[aria-hidden="false"]');
      if (modal) {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  });
}

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden - pause non-essential operations
    console.log('Page hidden - pausing operations');
  } else {
    // Page is visible - resume operations
    console.log('Page visible - resuming operations');
  }
});

/**
 * Handle online/offline status
 */
window.addEventListener('online', () => {
  console.log('Connection restored');
  // Show connection restored message
  const event = new CustomEvent('connection-restored');
  document.dispatchEvent(event);
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
  // Show offline message
  const event = new CustomEvent('connection-lost');
  document.dispatchEvent(event);
});

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for debugging in development
if (import.meta.env.DEV) {
  (window as any).EME_CHATBOT = {
    version: APP_CONFIG.version,
    config: APP_CONFIG
  };
}