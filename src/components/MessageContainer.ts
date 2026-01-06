/**
 * EME Monaco Chatbot - Message Container Component
 * Displays conversation history with auto-scrolling and accessibility features
 */

import type { ChatMessage, MessageContainerConfig } from '@/types/interfaces';
import { MessageBubble } from './MessageBubble';

export class MessageContainer {
  private container: HTMLElement;
  private messagesElement!: HTMLElement;
  private config: MessageContainerConfig;
  
  // State
  private messages: MessageBubble[] = [];
  private isUserScrolling = false;
  private autoScroll: boolean;
  private typingIndicator?: HTMLElement;
  private scrollTimeout?: number;

  constructor(config: MessageContainerConfig) {
    this.config = config;
    this.container = config.element;
    this.autoScroll = config.autoScroll ?? true;
    
    this.render();
    this.attachEventListeners();
  }

  /**
   * Render the message container
   */
  private render(): void {
    this.container.innerHTML = `
      <div 
        class="chat-messages" 
        role="log" 
        aria-live="polite" 
        aria-label="Conversation avec l'assistant EME"
        tabindex="0">
      </div>
    `;

    this.messagesElement = this.container.querySelector('.chat-messages') as HTMLElement;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Scroll event for detecting user scrolling
    this.messagesElement.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Wheel event for scroll detection
    this.messagesElement.addEventListener('wheel', this.handleWheel.bind(this));
    
    // Touch events for mobile scroll detection
    this.messagesElement.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.messagesElement.addEventListener('touchmove', this.handleTouchMove.bind(this));
    
    // Resize observer for layout changes
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        if (this.autoScroll && !this.isUserScrolling) {
          this.scrollToBottom(false);
        }
      });
      resizeObserver.observe(this.messagesElement);
    }
  }

  /**
   * Handle scroll events
   */
  private handleScroll(): void {
    const { scrollTop, scrollHeight, clientHeight } = this.messagesElement;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
    
    // Update user scrolling state
    if (!isAtBottom) {
      this.isUserScrolling = true;
      this.showScrollToBottomButton();
    } else {
      this.isUserScrolling = false;
      this.hideScrollToBottomButton();
    }

    // Clear scroll timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Reset user scrolling after inactivity
    this.scrollTimeout = window.setTimeout(() => {
      if (isAtBottom) {
        this.isUserScrolling = false;
      }
    }, 1000);
  }

  /**
   * Handle wheel events
   */
  private handleWheel(): void {
    this.isUserScrolling = true;
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(): void {
    this.isUserScrolling = true;
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(): void {
    this.isUserScrolling = true;
  }

  /**
   * Add a message to the container
   */
  addMessage(message: ChatMessage): void {
    const messageBubble = new MessageBubble(message);
    this.messages.push(messageBubble);
    
    // Add to DOM
    this.messagesElement.appendChild(messageBubble.getElement());
    
    // Auto-scroll if enabled and user isn't scrolling
    if (this.autoScroll && !this.isUserScrolling) {
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        this.scrollToBottom(true);
      });
    }

    // Limit message history for performance
    if (this.config.maxMessages && this.messages.length > this.config.maxMessages) {
      this.removeOldestMessage();
    }

    // Announce new messages to screen readers
    if (message.role === 'assistant') {
      this.announceNewMessage(message);
    }
  }

  /**
   * Remove the oldest message
   */
  private removeOldestMessage(): void {
    if (this.messages.length === 0) return;

    const oldestMessage = this.messages.shift();
    if (oldestMessage) {
      const element = oldestMessage.getElement();
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      oldestMessage.dispose();
    }
  }

  /**
   * Scroll to bottom of container
   */
  scrollToBottom(smooth: boolean = true): void {
    const scrollOptions: ScrollToOptions = {
      top: this.messagesElement.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    };

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scrollOptions.behavior = 'auto';
    }

    this.messagesElement.scrollTo(scrollOptions);
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator(): void {
    if (this.typingIndicator) {
      return; // Already showing
    }

    this.typingIndicator = document.createElement('div');
    this.typingIndicator.className = 'message assistant-message typing-message';
    this.typingIndicator.innerHTML = `
      <div class="message-meta">
        <span class="message-role">Assistant EME</span>
        <span class="message-timestamp">En cours...</span>
      </div>
      <div class="message-bubble">
        <div class="typing-indicator" aria-label="L'assistant est en train de répondre">
          <span class="typing-text">L'assistant réfléchit</span>
          <div class="typing-dots" aria-hidden="true">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;

    this.messagesElement.appendChild(this.typingIndicator);

    // Auto-scroll to show typing indicator
    if (this.autoScroll && !this.isUserScrolling) {
      requestAnimationFrame(() => {
        this.scrollToBottom(true);
      });
    }

    // Announce to screen readers
    this.announceToScreenReader('L\'assistant EME est en train de répondre');
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator(): void {
    if (this.typingIndicator && this.typingIndicator.parentNode) {
      this.typingIndicator.parentNode.removeChild(this.typingIndicator);
      this.typingIndicator = undefined;
    }
  }

  /**
   * Show scroll to bottom button
   */
  private showScrollToBottomButton(): void {
    let scrollButton = this.container.querySelector('.scroll-to-bottom') as HTMLElement;
    
    if (!scrollButton) {
      scrollButton = document.createElement('button');
      scrollButton.className = 'scroll-to-bottom';
      scrollButton.innerHTML = `
        <span aria-hidden="true">↓</span>
        <span class="sr-only">Aller au bas de la conversation</span>
      `;
      scrollButton.setAttribute('aria-label', 'Aller au bas de la conversation');
      scrollButton.addEventListener('click', () => {
        this.isUserScrolling = false;
        this.scrollToBottom(true);
      });
      
      this.container.appendChild(scrollButton);
    }
    
    scrollButton.style.display = 'flex';
  }

  /**
   * Hide scroll to bottom button
   */
  private hideScrollToBottomButton(): void {
    const scrollButton = this.container.querySelector('.scroll-to-bottom') as HTMLElement;
    if (scrollButton) {
      scrollButton.style.display = 'none';
    }
  }

  /**
   * Announce new message to screen readers
   */
  private announceNewMessage(message: ChatMessage): void {
    // Create a brief announcement
    const announcement = message.content.length > 100 
      ? message.content.substring(0, 100) + '...'
      : message.content;
    
    this.announceToScreenReader(`Nouvelle réponse: ${announcement}`);
  }

  /**
   * Announce to screen readers
   */
  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
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
   * Clear all messages
   */
  clear(): void {
    // Dispose of all message bubbles
    this.messages.forEach(message => message.dispose());
    this.messages = [];
    
    // Clear DOM
    this.messagesElement.innerHTML = '';
    
    // Hide typing indicator
    this.hideTypingIndicator();
    
    // Hide scroll button
    this.hideScrollToBottomButton();
    
    // Reset scroll state
    this.isUserScrolling = false;
  }

  /**
   * Find message by ID
   */
  findMessage(messageId: string): MessageBubble | undefined {
    return this.messages.find(msg => msg.getMessage().id === messageId);
  }

  /**
   * Highlight a specific message
   */
  highlightMessage(messageId: string): void {
    const message = this.findMessage(messageId);
    if (message) {
      message.highlight();
      
      // Scroll to message
      const element = message.getElement();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    return this.messages.map(bubble => bubble.getMessage());
  }

  /**
   * Set auto-scroll behavior
   */
  setAutoScroll(enabled: boolean): void {
    this.autoScroll = enabled;
    
    if (enabled && !this.isUserScrolling) {
      this.scrollToBottom(true);
    }
  }

  /**
   * Check if container is scrolled to bottom
   */
  isAtBottom(): boolean {
    const { scrollTop, scrollHeight, clientHeight } = this.messagesElement;
    return scrollTop + clientHeight >= scrollHeight - 10;
  }

  /**
   * Get message count
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Export messages as text
   */
  exportAsText(): string {
    const lines = ['Conversation EME Monaco Chatbot', ''];
    
    this.messages.forEach(bubble => {
      const message = bubble.getMessage();
      const timestamp = new Date(message.timestamp).toLocaleString('fr-FR');
      const role = message.role === 'user' ? 'Vous' : 
                   message.role === 'assistant' ? 'Assistant EME' : 
                   'Système';
      
      lines.push(`[${timestamp}] ${role}:`);
      lines.push(message.content);
      lines.push('');
    });
    
    return lines.join('\n');
  }

  /**
   * Dispose of the component
   */
  dispose(): void {
    // Clear all messages
    this.clear();
    
    // Clear timeouts
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Remove event listeners
    this.messagesElement.removeEventListener('scroll', this.handleScroll.bind(this));
    this.messagesElement.removeEventListener('wheel', this.handleWheel.bind(this));
    this.messagesElement.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.messagesElement.removeEventListener('touchmove', this.handleTouchMove.bind(this));
  }
}