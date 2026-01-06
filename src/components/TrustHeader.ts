/**
 * EME Monaco Chatbot - Trust Header Component
 * Government branding and AI transparency disclosure
 */

import type { ComponentConfig } from '@/types/interfaces';

export class TrustHeader {
  private container: HTMLElement;
  private modal?: HTMLElement;

  constructor(config: ComponentConfig) {
    this.container = config.element;
    this.render();
    this.attachEventListeners();
  }

  /**
   * Render the trust header
   */
  private render(): void {
    this.container.innerHTML = `
      <header class="trust-header" role="banner">
        <div class="government-badge">
          <div class="coat-of-arms" aria-hidden="true">
            🏛️
          </div>
          <div class="badge-text">
            <strong>Service Officiel</strong>
            <span>Gouvernement Princier de Monaco</span>
          </div>
        </div>
        
        <div class="service-title">
          <h1>Assistant EME</h1>
          <p>Extended Monaco Entreprises</p>
        </div>
        
        <div class="ai-disclaimer">
          <span class="ai-badge" role="img" aria-label="Assistant Intelligence Artificielle">
            🤖 Assistant IA
          </span>
          <button 
            class="info-button" 
            aria-label="Informations sur l'assistant IA"
            aria-describedby="ai-info-tooltip"
            type="button">
            ℹ️
          </button>
        </div>
      </header>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    const infoButton = this.container.querySelector('.info-button');
    if (infoButton) {
      infoButton.addEventListener('click', this.showAIInfoModal.bind(this));
    }

    // Handle modal close events
    document.addEventListener('keydown', this.handleModalKeydown.bind(this));
  }

  /**
   * Show AI information modal
   */
  private showAIInfoModal(): void {
    // Get existing modal or use the one in index.html
    this.modal = document.getElementById('ai-info-modal');
    
    if (!this.modal) {
      console.error('AI info modal not found');
      return;
    }

    // Show modal
    this.modal.setAttribute('aria-hidden', 'false');
    this.modal.style.display = 'flex';
    
    // Focus management
    const firstFocusable = this.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Add modal event listeners
    this.addModalEventListeners();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Announce to screen readers
    this.announceToScreenReader('Boîte de dialogue d\'informations sur l\'assistant IA ouverte');
  }

  /**
   * Hide AI information modal
   */
  private hideAIInfoModal(): void {
    if (!this.modal) return;

    // Hide modal
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.style.display = 'none';
    
    // Remove modal event listeners
    this.removeModalEventListeners();
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to info button
    const infoButton = this.container.querySelector('.info-button') as HTMLElement;
    if (infoButton) {
      infoButton.focus();
    }
    
    // Announce to screen readers
    this.announceToScreenReader('Boîte de dialogue fermée');
  }

  /**
   * Add modal event listeners
   */
  private addModalEventListeners(): void {
    if (!this.modal) return;

    // Close buttons
    const closeButtons = this.modal.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', this.hideAIInfoModal.bind(this));
    });

    // Backdrop click
    const backdrop = this.modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', this.hideAIInfoModal.bind(this));
    }

    // Modal click (but not content)
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.hideAIInfoModal();
      }
    });
  }

  /**
   * Remove modal event listeners
   */
  private removeModalEventListeners(): void {
    if (!this.modal) return;

    // Close buttons
    const closeButtons = this.modal.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
      button.removeEventListener('click', this.hideAIInfoModal.bind(this));
    });

    // Backdrop
    const backdrop = this.modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.removeEventListener('click', this.hideAIInfoModal.bind(this));
    }
  }

  /**
   * Handle modal keyboard events
   */
  private handleModalKeydown(event: KeyboardEvent): void {
    if (!this.modal || this.modal.getAttribute('aria-hidden') === 'true') {
      return;
    }

    // Close on Escape
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hideAIInfoModal();
      return;
    }

    // Focus trap
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  /**
   * Trap focus within modal
   */
  private trapFocus(event: KeyboardEvent): void {
    if (!this.modal) return;

    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Announce to screen readers
   */
  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Update government badge information
   */
  updateGovernmentInfo(title: string, subtitle: string): void {
    const badgeText = this.container.querySelector('.badge-text');
    if (badgeText) {
      badgeText.innerHTML = `
        <strong>${title}</strong>
        <span>${subtitle}</span>
      `;
    }
  }

  /**
   * Update service title
   */
  updateServiceTitle(title: string, subtitle?: string): void {
    const serviceTitle = this.container.querySelector('.service-title');
    if (serviceTitle) {
      serviceTitle.innerHTML = `
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      `;
    }
  }

  /**
   * Show/hide AI disclaimer
   */
  setAIDisclaimerVisible(visible: boolean): void {
    const aiDisclaimer = this.container.querySelector('.ai-disclaimer') as HTMLElement;
    if (aiDisclaimer) {
      aiDisclaimer.style.display = visible ? 'flex' : 'none';
    }
  }

  /**
   * Add custom action button
   */
  addActionButton(text: string, handler: () => void, ariaLabel?: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'header-action-btn';
    button.textContent = text;
    button.setAttribute('aria-label', ariaLabel || text);
    button.addEventListener('click', handler);
    
    // Add to header
    const header = this.container.querySelector('.trust-header');
    if (header) {
      header.appendChild(button);
    }
    
    return button;
  }

  /**
   * Set theme
   */
  setTheme(theme: 'light' | 'dark' | 'high-contrast'): void {
    const header = this.container.querySelector('.trust-header');
    if (header) {
      header.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
      header.classList.add(`theme-${theme}`);
    }
  }

  /**
   * Get current modal state
   */
  isModalOpen(): boolean {
    return this.modal ? this.modal.getAttribute('aria-hidden') === 'false' : false;
  }

  /**
   * Dispose of the component
   */
  dispose(): void {
    // Remove event listeners
    const infoButton = this.container.querySelector('.info-button');
    if (infoButton) {
      infoButton.removeEventListener('click', this.showAIInfoModal.bind(this));
    }

    document.removeEventListener('keydown', this.handleModalKeydown.bind(this));

    // Close modal if open
    if (this.isModalOpen()) {
      this.hideAIInfoModal();
    }

    // Remove modal event listeners
    this.removeModalEventListeners();
  }
}