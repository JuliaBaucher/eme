/**
 * EME Monaco Chatbot - Message Bubble Component
 * Individual message display with role-based styling and actions
 */

import { marked } from 'marked';
import type { ChatMessage, EventHandler } from '@/types/interfaces';
import { sanitizeAIResponse, sanitizeUserInput } from '@/utils/sanitization';

export class MessageBubble {
  private message: ChatMessage;
  private element: HTMLElement;
  private onCopyHandler?: EventHandler<string>;

  constructor(message: ChatMessage) {
    this.message = message;
    this.element = this.createElement();
    this.attachEventListeners();
  }

  /**
   * Create the message bubble element
   */
  private createElement(): HTMLElement {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${this.message.role}-message`;
    messageElement.setAttribute('role', 'article');
    messageElement.setAttribute('data-message-id', this.message.id);

    // Create message structure
    messageElement.innerHTML = `
      <div class="message-meta" aria-label="${this.getAriaLabel()}">
        <span class="message-role">${this.getRoleDisplay()}</span>
        <span class="message-timestamp">${this.formatTimestamp()}</span>
        ${this.message.metadata?.confidence ? `<span class="message-confidence" title="Niveau de confiance: ${Math.round(this.message.metadata.confidence * 100)}%">⚡</span>` : ''}
      </div>
      <div class="message-bubble">
        <div class="message-content">
          ${this.renderContent()}
        </div>
        ${this.shouldShowActions() ? this.renderActions() : ''}
      </div>
    `;

    return messageElement;
  }

  /**
   * Render message content based on role and format
   */
  private renderContent(): string {
    let content = this.message.content;

    // Sanitize content based on role
    if (this.message.role === 'user') {
      content = sanitizeUserInput(content);
    } else if (this.message.role === 'assistant') {
      content = sanitizeAIResponse(content);
      
      // Render markdown for assistant messages
      try {
        content = this.renderMarkdown(content);
      } catch (error) {
        console.warn('Failed to render markdown:', error);
        // Fall back to plain text
        content = sanitizeAIResponse(this.message.content);
      }
    } else {
      // System and error messages - basic sanitization
      content = sanitizeUserInput(content);
    }

    // Add AI disclaimer for assistant messages
    if (this.message.role === 'assistant') {
      content += this.renderAIDisclaimer();
    }

    return content;
  }

  /**
   * Render markdown content safely
   */
  private renderMarkdown(content: string): string {
    // Configure marked for security
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false, // We handle sanitization separately
      smartLists: true,
      smartypants: false
    });

    // Custom renderer for links
    const renderer = new marked.Renderer();
    renderer.link = (href, title, text) => {
      const sanitizedHref = href?.startsWith('http') ? href : '#';
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${sanitizedHref}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    };

    // Custom renderer for code blocks
    renderer.code = (code, language) => {
      const lang = language || '';
      return `<pre><code class="language-${lang}">${code}</code></pre>`;
    };

    marked.use({ renderer });

    return marked.parse(content) as string;
  }

  /**
   * Render AI disclaimer
   */
  private renderAIDisclaimer(): string {
    return `
      <div class="ai-disclaimer-inline">
        <small>
          <em>Réponse générée par IA • Vérifiez les informations importantes</em>
        </small>
      </div>
    `;
  }

  /**
   * Render message actions
   */
  private renderActions(): string {
    if (this.message.role !== 'assistant') {
      return '';
    }

    return `
      <div class="message-actions">
        <button class="action-btn copy-btn" aria-label="Copier ce message" title="Copier">
          📋 <span>Copier</span>
        </button>
        <button class="action-btn share-btn" aria-label="Partager ce message" title="Partager">
          🔗 <span>Partager</span>
        </button>
        ${this.message.metadata?.sources ? `
          <button class="action-btn sources-btn" aria-label="Voir les sources" title="Sources">
            📚 <span>Sources</span>
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Copy button
    const copyBtn = this.element.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', this.handleCopy.bind(this));
    }

    // Share button
    const shareBtn = this.element.querySelector('.share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', this.handleShare.bind(this));
    }

    // Sources button
    const sourcesBtn = this.element.querySelector('.sources-btn');
    if (sourcesBtn) {
      sourcesBtn.addEventListener('click', this.handleShowSources.bind(this));
    }

    // Link handling for external links
    const links = this.element.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
      link.addEventListener('click', this.handleExternalLink.bind(this));
    });
  }

  /**
   * Handle copy action
   */
  private async handleCopy(): Promise<void> {
    try {
      // Get plain text content without HTML
      const textContent = this.getPlainTextContent();
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textContent);
      } else {
        // Fallback for older browsers
        this.fallbackCopyToClipboard(textContent);
      }

      // Show success feedback
      this.showCopyFeedback(true);
      
      // Call external handler
      if (this.onCopyHandler) {
        this.onCopyHandler(textContent);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.showCopyFeedback(false);
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * Show copy feedback
   */
  private showCopyFeedback(success: boolean): void {
    const copyBtn = this.element.querySelector('.copy-btn');
    if (!copyBtn) return;

    const originalContent = copyBtn.innerHTML;
    const feedbackContent = success ? '✅ <span>Copié!</span>' : '❌ <span>Erreur</span>';
    
    copyBtn.innerHTML = feedbackContent;
    copyBtn.classList.add(success ? 'success' : 'error');
    
    setTimeout(() => {
      copyBtn.innerHTML = originalContent;
      copyBtn.classList.remove('success', 'error');
    }, 2000);
  }

  /**
   * Handle share action
   */
  private async handleShare(): Promise<void> {
    const textContent = this.getPlainTextContent();
    const shareData = {
      title: 'Réponse Assistant EME',
      text: textContent,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await this.handleCopy();
      }
    } catch (error) {
      console.error('Failed to share:', error);
      // Fallback: copy to clipboard
      await this.handleCopy();
    }
  }

  /**
   * Handle show sources action
   */
  private handleShowSources(): void {
    if (!this.message.metadata?.sources) return;

    // Create sources modal or tooltip
    const sourcesModal = document.createElement('div');
    sourcesModal.className = 'sources-modal';
    sourcesModal.innerHTML = `
      <div class="sources-content">
        <h4>Sources utilisées</h4>
        <ul>
          ${this.message.metadata.sources.map(source => `
            <li><a href="${source}" target="_blank" rel="noopener noreferrer">${source}</a></li>
          `).join('')}
        </ul>
        <button class="close-sources">Fermer</button>
      </div>
    `;

    document.body.appendChild(sourcesModal);

    // Close modal handler
    const closeBtn = sourcesModal.querySelector('.close-sources');
    const closeModal = () => {
      document.body.removeChild(sourcesModal);
    };

    closeBtn?.addEventListener('click', closeModal);
    sourcesModal.addEventListener('click', (e) => {
      if (e.target === sourcesModal) closeModal();
    });

    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  /**
   * Handle external link clicks
   */
  private handleExternalLink(event: Event): void {
    const link = event.target as HTMLAnchorElement;
    
    // Add confirmation for external links
    const confirmed = confirm(
      `Vous allez quitter le site EME pour accéder à:\n${link.href}\n\nContinuer?`
    );
    
    if (!confirmed) {
      event.preventDefault();
    }
  }

  /**
   * Get plain text content without HTML
   */
  private getPlainTextContent(): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.message.content;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Get ARIA label for the message
   */
  private getAriaLabel(): string {
    const role = this.getRoleDisplay();
    const time = this.formatTimestamp();
    return `${role}, ${time}`;
  }

  /**
   * Get display text for message role
   */
  private getRoleDisplay(): string {
    switch (this.message.role) {
      case 'user':
        return 'Vous';
      case 'assistant':
        return 'Assistant EME';
      case 'system':
        return 'Système';
      case 'error':
        return 'Erreur';
      default:
        return 'Message';
    }
  }

  /**
   * Format timestamp for display
   */
  private formatTimestamp(): string {
    const date = new Date(this.message.timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if actions should be shown
   */
  private shouldShowActions(): boolean {
    return this.message.role === 'assistant';
  }

  /**
   * Public API methods
   */

  /**
   * Get the DOM element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Get the message data
   */
  getMessage(): ChatMessage {
    return this.message;
  }

  /**
   * Update message content
   */
  updateContent(content: string): void {
    this.message.content = content;
    const contentElement = this.element.querySelector('.message-content');
    if (contentElement) {
      contentElement.innerHTML = this.renderContent();
    }
  }

  /**
   * Set copy handler
   */
  onCopy(handler: EventHandler<string>): void {
    this.onCopyHandler = handler;
  }

  /**
   * Highlight the message (for search results, etc.)
   */
  highlight(): void {
    this.element.classList.add('highlighted');
    setTimeout(() => {
      this.element.classList.remove('highlighted');
    }, 2000);
  }

  /**
   * Dispose of the component
   */
  dispose(): void {
    // Remove event listeners
    const copyBtn = this.element.querySelector('.copy-btn');
    const shareBtn = this.element.querySelector('.share-btn');
    const sourcesBtn = this.element.querySelector('.sources-btn');

    copyBtn?.removeEventListener('click', this.handleCopy.bind(this));
    shareBtn?.removeEventListener('click', this.handleShare.bind(this));
    sourcesBtn?.removeEventListener('click', this.handleShowSources.bind(this));

    // Clear references
    this.onCopyHandler = undefined;
  }
}