/**
 * EME Monaco Chatbot - Input Field Component
 * Handles user input with validation, character counting, and keyboard shortcuts
 */

import type { InputFieldConfig, ValidationResult, EventHandler } from '@/types/interfaces';
import { InputValidator } from '@/services/InputValidator';

export class InputField {
  private container: HTMLElement;
  private textarea: HTMLTextAreaElement;
  private sendButton: HTMLButtonElement;
  private charCounter: HTMLElement;
  private validator: InputValidator;
  private config: InputFieldConfig;
  
  // Event handlers
  private onSendHandler?: EventHandler<string>;
  private onInputHandler?: EventHandler<string>;
  
  // State
  private currentValue = '';
  private isComposing = false;

  constructor(config: InputFieldConfig) {
    this.config = config;
    this.validator = new InputValidator(config.maxLength || 4000);
    this.container = config.element;
    
    this.render();
    this.attachEventListeners();
    this.updateUI();
  }

  /**
   * Render the input field component
   */
  private render(): void {
    this.container.innerHTML = `
      <form class="chat-input-form" role="form" aria-label="Envoyer un message">
        <div class="input-wrapper">
          <label for="message-input" class="sr-only">
            Tapez votre question sur les services EME
          </label>
          <textarea 
            id="message-input"
            class="message-input"
            placeholder="${this.config.placeholder || 'Posez votre question sur les services numériques EME...'}"
            maxlength="${this.config.maxLength || 4000}"
            rows="1"
            aria-describedby="char-counter input-help"
            autocomplete="off"
            spellcheck="true"
            lang="fr">
          </textarea>
          <div id="char-counter" class="char-counter" aria-live="polite">
            0 / ${(this.config.maxLength || 4000).toLocaleString()} caractères
          </div>
          <div id="input-help" class="help-text sr-only">
            Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
          </div>
        </div>
        <button 
          type="submit" 
          class="send-button"
          aria-label="Envoyer le message"
          disabled>
          <span>Envoyer</span>
          <span aria-hidden="true">📤</span>
        </button>
      </form>
    `;

    // Get references to elements
    this.textarea = this.container.querySelector('.message-input') as HTMLTextAreaElement;
    this.sendButton = this.container.querySelector('.send-button') as HTMLButtonElement;
    this.charCounter = this.container.querySelector('.char-counter') as HTMLElement;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Input event for real-time validation
    this.textarea.addEventListener('input', this.handleInput.bind(this));
    
    // Composition events for IME support
    this.textarea.addEventListener('compositionstart', () => {
      this.isComposing = true;
    });
    
    this.textarea.addEventListener('compositionend', () => {
      this.isComposing = false;
      this.handleInput();
    });

    // Keyboard events
    this.textarea.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Form submission
    const form = this.container.querySelector('.chat-input-form') as HTMLFormElement;
    form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Auto-resize
    this.textarea.addEventListener('input', this.autoResize.bind(this));
    
    // Focus management
    this.textarea.addEventListener('focus', this.handleFocus.bind(this));
    this.textarea.addEventListener('blur', this.handleBlur.bind(this));
  }

  /**
   * Handle input changes
   */
  private handleInput(): void {
    if (this.isComposing) {
      return; // Don't process during IME composition
    }

    this.currentValue = this.textarea.value;
    this.updateUI();
    
    // Call external input handler
    if (this.onInputHandler) {
      this.onInputHandler(this.currentValue);
    }
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Enter to send (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSend();
      return;
    }

    // Shift+Enter for new line (default behavior)
    if (event.key === 'Enter' && event.shiftKey) {
      // Allow default behavior (new line)
      return;
    }

    // Escape to clear input
    if (event.key === 'Escape') {
      event.preventDefault();
      this.clear();
      return;
    }

    // Ctrl+A to select all
    if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
      // Allow default behavior
      return;
    }
  }

  /**
   * Handle form submission
   */
  private handleSubmit(event: Event): void {
    event.preventDefault();
    this.handleSend();
  }

  /**
   * Handle send action
   */
  private handleSend(): void {
    const trimmedValue = this.currentValue.trim();
    
    if (!this.validator.canSend(trimmedValue)) {
      // Show validation error
      this.showValidationError();
      return;
    }

    const preparedInput = this.validator.prepareInput(trimmedValue);
    
    if (this.onSendHandler) {
      this.onSendHandler(preparedInput);
    }

    // Clear input after sending
    this.clear();
    this.focus();
  }

  /**
   * Update UI based on current state
   */
  private updateUI(): void {
    const validation = this.validator.validate(this.currentValue);
    
    // Update character counter
    this.updateCharacterCounter(validation);
    
    // Update send button state
    this.updateSendButton(validation);
    
    // Update input styling
    this.updateInputStyling(validation);
    
    // Auto-resize textarea
    this.autoResize();
  }

  /**
   * Update character counter display
   */
  private updateCharacterCounter(validation: ValidationResult): void {
    const formatted = this.validator.formatCharacterCounter(validation.characterCount);
    this.charCounter.textContent = formatted;
    
    // Update counter styling
    const counterClass = this.validator.getCharacterCountClass(validation.characterCount);
    this.charCounter.className = `char-counter ${counterClass}`;
    
    // Update ARIA live region for screen readers
    if (validation.characterCount > this.validator.getCharacterLimits().warningThreshold) {
      this.charCounter.setAttribute('aria-live', 'assertive');
    } else {
      this.charCounter.setAttribute('aria-live', 'polite');
    }
  }

  /**
   * Update send button state
   */
  private updateSendButton(validation: ValidationResult): void {
    this.sendButton.disabled = !validation.canSend;
    
    // Update button styling
    if (validation.canSend) {
      this.sendButton.classList.remove('disabled');
      this.sendButton.setAttribute('aria-label', 'Envoyer le message');
    } else {
      this.sendButton.classList.add('disabled');
      
      if (validation.errors.length > 0) {
        this.sendButton.setAttribute('aria-label', `Impossible d'envoyer: ${validation.errors[0]}`);
      } else {
        this.sendButton.setAttribute('aria-label', 'Saisissez un message pour envoyer');
      }
    }
  }

  /**
   * Update input field styling
   */
  private updateInputStyling(validation: ValidationResult): void {
    // Remove existing validation classes
    this.textarea.classList.remove('valid', 'invalid', 'warning');
    
    if (validation.errors.length > 0) {
      this.textarea.classList.add('invalid');
      this.textarea.setAttribute('aria-invalid', 'true');
    } else if (validation.warnings.length > 0) {
      this.textarea.classList.add('warning');
      this.textarea.setAttribute('aria-invalid', 'false');
    } else if (validation.isValid && this.currentValue.trim().length > 0) {
      this.textarea.classList.add('valid');
      this.textarea.setAttribute('aria-invalid', 'false');
    } else {
      this.textarea.setAttribute('aria-invalid', 'false');
    }
  }

  /**
   * Auto-resize textarea based on content
   */
  private autoResize(): void {
    // Reset height to auto to get the correct scrollHeight
    this.textarea.style.height = 'auto';
    
    // Calculate new height
    const minHeight = 44; // Minimum height in pixels
    const maxHeight = 120; // Maximum height in pixels
    const scrollHeight = this.textarea.scrollHeight;
    
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    this.textarea.style.height = `${newHeight}px`;
    
    // Show/hide scrollbar if content exceeds max height
    if (scrollHeight > maxHeight) {
      this.textarea.style.overflowY = 'auto';
    } else {
      this.textarea.style.overflowY = 'hidden';
    }
  }

  /**
   * Show validation error
   */
  private showValidationError(): void {
    const validation = this.validator.validate(this.currentValue);
    const message = this.validator.getValidationMessage(validation);
    
    if (message) {
      // Create temporary error message
      const errorElement = document.createElement('div');
      errorElement.className = 'input-error-message';
      errorElement.textContent = message;
      errorElement.setAttribute('role', 'alert');
      
      // Insert after input wrapper
      const inputWrapper = this.container.querySelector('.input-wrapper');
      if (inputWrapper && inputWrapper.parentNode) {
        inputWrapper.parentNode.insertBefore(errorElement, inputWrapper.nextSibling);
        
        // Remove after 3 seconds
        setTimeout(() => {
          if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
          }
        }, 3000);
      }
    }
    
    // Focus back to input
    this.focus();
  }

  /**
   * Handle focus event
   */
  private handleFocus(): void {
    this.container.classList.add('focused');
  }

  /**
   * Handle blur event
   */
  private handleBlur(): void {
    this.container.classList.remove('focused');
  }

  /**
   * Public API methods
   */

  /**
   * Get the current input value
   */
  getValue(): string {
    return this.currentValue;
  }

  /**
   * Set the input value
   */
  setValue(value: string): void {
    this.textarea.value = value;
    this.currentValue = value;
    this.updateUI();
  }

  /**
   * Clear the input field
   */
  clear(): void {
    this.textarea.value = '';
    this.currentValue = '';
    this.updateUI();
  }

  /**
   * Focus the input field
   */
  focus(): void {
    this.textarea.focus();
  }

  /**
   * Check if input can be sent
   */
  canSend(): boolean {
    return this.validator.canSend(this.currentValue);
  }

  /**
   * Set event handlers
   */
  onSend(handler: EventHandler<string>): void {
    this.onSendHandler = handler;
  }

  onInput(handler: EventHandler<string>): void {
    this.onInputHandler = handler;
  }

  /**
   * Enable/disable the input field
   */
  setEnabled(enabled: boolean): void {
    this.textarea.disabled = !enabled;
    this.sendButton.disabled = !enabled || !this.canSend();
    
    if (enabled) {
      this.container.classList.remove('disabled');
    } else {
      this.container.classList.add('disabled');
    }
  }

  /**
   * Set placeholder text
   */
  setPlaceholder(placeholder: string): void {
    this.textarea.placeholder = placeholder;
  }

  /**
   * Get validation result for current input
   */
  getValidation(): ValidationResult {
    return this.validator.validate(this.currentValue);
  }

  /**
   * Dispose of the component
   */
  dispose(): void {
    // Remove event listeners
    this.textarea.removeEventListener('input', this.handleInput.bind(this));
    this.textarea.removeEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Clear references
    this.onSendHandler = undefined;
    this.onInputHandler = undefined;
  }
}