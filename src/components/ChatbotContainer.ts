/**
 * EME Monaco Chatbot - Main Container Component
 * Orchestrates all chatbot components and manages application state
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  ChatMessage, 
  ChatState, 
  MessageRole, 
  ComponentConfig,
  EventHandler 
} from '@/types/interfaces';
import { InputField } from './InputField';
import { MessageContainer } from './MessageContainer';
import { TrustHeader } from './TrustHeader';
import { StorageManager } from '@/services/StorageManager';
import { ChatAPI } from '@/services/ChatAPI';
import { ErrorHandler } from '@/services/ErrorHandler';

interface ChatbotContainerConfig extends ComponentConfig {
  apiUrl: string;
  maxRetries?: number;
  requestTimeout?: number;
}

export class ChatbotContainer {
  private config: ChatbotContainerConfig;
  private container: HTMLElement;
  
  // Components
  private trustHeader?: TrustHeader;
  private messageContainer?: MessageContainer;
  private inputField?: InputField;
  
  // Services
  private storageManager: StorageManager;
  private chatAPI: ChatAPI;
  private errorHandler: ErrorHandler;
  
  // State
  private chatState: ChatState;
  private isLoading = false;
  private isInitialized = false;

  constructor(config: ChatbotContainerConfig) {
    this.config = config;
    this.container = config.element;
    
    // Initialize services
    this.storageManager = new StorageManager();
    this.chatAPI = new ChatAPI({
      baseUrl: config.apiUrl,
      timeout: config.requestTimeout || 30000,
      maxRetries: config.maxRetries || 3
    });
    this.errorHandler = new ErrorHandler();
    
    // Initialize state
    this.chatState = this.loadInitialState();
  }

  /**
   * Initialize the chatbot application
   */
  async initialize(): Promise<void> {
    try {
      // Render the main structure
      this.render();
      
      // Initialize components
      await this.initializeComponents();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Restore conversation history
      this.restoreConversationHistory();
      
      // Show welcome message if this is a new session
      if (this.chatState.messages.length === 0) {
        this.showWelcomeMessage();
      }
      
      this.isInitialized = true;
      
      // Announce to screen readers
      this.announceToScreenReader('Assistant EME prêt à utiliser');
      
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
      this.showInitializationError(error);
    }
  }

  /**
   * Render the main chatbot structure
   */
  private render(): void {
    this.container.className = 'chatbot-container';
    this.container.innerHTML = `
      <!-- Trust Header -->
      <div id="trust-header" class="trust-header-container"></div>
      
      <!-- Main Application -->
      <div class="app-layout">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <div class="hero-badge">
              <span class="badge-icon">🏛️</span>
              <span class="badge-text">Service Officiel EME</span>
            </div>
            <h1 class="hero-title">Assistant Numérique Monaco</h1>
            <p class="hero-subtitle">
              Votre guide pour la transformation digitale des entreprises monégasques
            </p>
            <div class="hero-features">
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <span>Diagnostic maturité</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">👥</span>
                <span>Annuaire experts</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💰</span>
                <span>Fonds Bleu</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🚀</span>
                <span>FlashLearn IA 2026</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Interface -->
        <main id="main-content" class="chat-interface" role="main" tabindex="-1">
          <!-- Quick Actions -->
          <div class="quick-actions">
            <h2 class="section-title">Questions fréquentes</h2>
            <div class="quick-questions-grid">
              <button class="quick-question-card" data-question="C'est quoi le programme EME et à qui s'adresse-t-il ?">
                <div class="card-icon">🎯</div>
                <div class="card-content">
                  <h3>Programme EME</h3>
                  <p>Objectifs et public cible</p>
                </div>
              </button>
              
              <button class="quick-question-card" data-question="Comment fonctionne l'autodiagnostic de maturité numérique (durée, score, dimensions) ?">
                <div class="card-icon">📊</div>
                <div class="card-content">
                  <h3>Autodiagnostic</h3>
                  <p>Évaluez votre maturité digitale</p>
                </div>
              </button>
              
              <button class="quick-question-card" data-question="Comment utiliser l'annuaire des professionnels du numérique ?">
                <div class="card-icon">👥</div>
                <div class="card-content">
                  <h3>Annuaire</h3>
                  <p>Trouvez des experts certifiés</p>
                </div>
              </button>
              
              <button class="quick-question-card" data-question="Que finance le Fonds Bleu et quels sont les délais de traitement ?">
                <div class="card-icon">💰</div>
                <div class="card-content">
                  <h3>Fonds Bleu</h3>
                  <p>Financements disponibles</p>
                </div>
              </button>
              
              <button class="quick-question-card" data-question="Que propose le programme de sensibilisation Digital FlashUP ?">
                <div class="card-icon">⚡</div>
                <div class="card-content">
                  <h3>FlashUP</h3>
                  <p>Formation et sensibilisation</p>
                </div>
              </button>
              
              <button class="quick-question-card" data-question="Quelles sont les nouveautés 2026 (Questionnaire Opportunité IA, FlashLearn IA) ?">
                <div class="card-icon">🚀</div>
                <div class="card-content">
                  <h3>Nouveautés 2026</h3>
                  <p>FlashLearn IA et plus</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Chat Messages Area -->
          <div class="chat-section">
            <div class="chat-header">
              <h2 class="chat-title">
                <span class="chat-icon">💬</span>
                Conversation
              </h2>
              <div class="chat-actions">
                <button id="clear-chat-btn" class="action-btn" title="Effacer l'historique">
                  <span class="btn-icon">🗑️</span>
                  <span class="btn-text">Effacer</span>
                </button>
                <button id="export-chat-btn" class="action-btn" title="Exporter la conversation">
                  <span class="btn-icon">📥</span>
                  <span class="btn-text">Exporter</span>
                </button>
              </div>
            </div>
            
            <div id="message-container" class="message-container-wrapper"></div>
            <div id="input-container" class="chat-input-container"></div>
          </div>
        </main>

        <!-- Resources Sidebar -->
        <aside class="resources-sidebar" role="complementary" aria-label="Ressources EME">
          <div class="sidebar-header">
            <h2 class="sidebar-title">
              <span class="title-icon">🔗</span>
              Ressources EME
            </h2>
          </div>
          
          <div class="resource-section">
            <h3 class="resource-title">Services officiels</h3>
            <div class="resource-links">
              <a href="https://eme.gouv.mc/evaluer-sa-maturite-numerique/" target="_blank" rel="noopener" class="resource-link">
                <span class="link-icon">📊</span>
                <div class="link-content">
                  <span class="link-title">Autodiagnostic</span>
                  <span class="link-desc">Maturité numérique</span>
                </div>
                <span class="link-arrow">→</span>
              </a>
              
              <a href="https://eme.gouv.mc/rechercher-un-professionnel-du-numerique/" target="_blank" rel="noopener" class="resource-link">
                <span class="link-icon">👥</span>
                <div class="link-content">
                  <span class="link-title">Annuaire</span>
                  <span class="link-desc">Professionnels certifiés</span>
                </div>
                <span class="link-arrow">→</span>
              </a>
              
              <a href="https://eme.gouv.mc/financer-son-projet-3/" target="_blank" rel="noopener" class="resource-link">
                <span class="link-icon">💰</span>
                <div class="link-content">
                  <span class="link-title">Fonds Bleu</span>
                  <span class="link-desc">Financement projets</span>
                </div>
                <span class="link-arrow">→</span>
              </a>
              
              <a href="https://eme.gouv.mc/flashup-tool-box/" target="_blank" rel="noopener" class="resource-link">
                <span class="link-icon">🧰</span>
                <div class="link-content">
                  <span class="link-title">FlashUP Tool Box</span>
                  <span class="link-desc">Outils pratiques</span>
                </div>
                <span class="link-arrow">→</span>
              </a>
            </div>
          </div>

          <div class="trust-notice">
            <div class="notice-header">
              <span class="notice-icon">🔒</span>
              <h3>Confidentialité</h3>
            </div>
            <div class="notice-content">
              <p>Vos conversations restent privées et sont stockées uniquement sur votre appareil.</p>
              <ul class="notice-list">
                <li>✓ Données locales uniquement</li>
                <li>✓ Aucun partage avec des tiers</li>
                <li>✓ Effacement à tout moment</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  /**
   * Initialize all components
   */
  private async initializeComponents(): Promise<void> {
    // Initialize trust header
    const trustHeaderElement = this.container.querySelector('#trust-header') as HTMLElement;
    this.trustHeader = new TrustHeader({
      element: trustHeaderElement
    });

    // Initialize message container
    const messageContainerElement = this.container.querySelector('#message-container') as HTMLElement;
    this.messageContainer = new MessageContainer({
      element: messageContainerElement,
      autoScroll: this.chatState.userPreferences.autoScroll
    });

    // Initialize input field
    const inputContainerElement = this.container.querySelector('#input-container') as HTMLElement;
    this.inputField = new InputField({
      element: inputContainerElement,
      maxLength: 4000,
      placeholder: 'Posez votre question sur les services numériques EME...',
      onSend: this.handleUserMessage.bind(this),
      onInput: this.handleInputChange.bind(this)
    });
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Clear chat button
    const clearChatBtn = this.container.querySelector('#clear-chat-btn');
    clearChatBtn?.addEventListener('click', this.handleClearChat.bind(this));

    // Export chat button
    const exportChatBtn = this.container.querySelector('#export-chat-btn');
    exportChatBtn?.addEventListener('click', this.handleExportChat.bind(this));

    // Quick question buttons
    const quickQuestionBtns = this.container.querySelectorAll('.quick-question-card');
    quickQuestionBtns.forEach(btn => {
      btn.addEventListener('click', this.handleQuickQuestion.bind(this));
    });

    // Connection status events
    document.addEventListener('connection-lost', this.handleConnectionLost.bind(this));
    document.addEventListener('connection-restored', this.handleConnectionRestored.bind(this));

    // Window events
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.addEventListener('resize', this.handleWindowResize.bind(this));

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
  }

  /**
   * Load initial state from storage or create new
   */
  private loadInitialState(): ChatState {
    const stored = this.storageManager.loadChat();
    if (stored) {
      return stored;
    }

    return this.storageManager.createInitialState();
  }

  /**
   * Restore conversation history
   */
  private restoreConversationHistory(): void {
    if (!this.messageContainer) return;

    for (const message of this.chatState.messages) {
      this.messageContainer.addMessage(message);
    }
  }

  /**
   * Show welcome message
   */
  private showWelcomeMessage(): void {
    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      timestamp: Date.now(),
      role: 'assistant',
      content: `Bonjour ! Je suis l'assistant numérique d'Extended Monaco Entreprises (EME).

Je peux vous aider avec :
• **Diagnostics de maturité numérique** - Évaluez la maturité digitale de votre entreprise
• **Annuaire professionnel** - Trouvez des prestataires certifiés
• **Opportunités de financement** - Découvrez les aides disponibles
• **FlashLearn IA 2026** - Informations sur notre programme d'intégration IA

Comment puis-je vous aider aujourd'hui ?`
    };

    this.addMessage(welcomeMessage);
  }

  /**
   * Handle user message input
   */
  private async handleUserMessage(message: string): Promise<void> {
    if (!message.trim() || this.isLoading) {
      return;
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      timestamp: Date.now(),
      role: 'user',
      content: message.trim()
    };

    // Add user message to conversation
    this.addMessage(userMessage);

    // Set loading state
    this.setLoading(true);

    try {
      // Send message to API (use mock in development)
      const response = import.meta.env.DEV 
        ? await this.chatAPI.sendMessageMock({
            message: message.trim(),
            sessionId: this.chatState.sessionId,
            context: {
              userType: 'business',
              previousMessages: this.getRecentMessages(5),
              language: 'fr'
            },
            metadata: {
              clientVersion: '1.0.0',
              timestamp: Date.now(),
              userAgent: navigator.userAgent
            }
          })
        : await this.chatAPI.sendMessage({
            message: message.trim(),
            sessionId: this.chatState.sessionId,
            context: {
              userType: 'business',
              previousMessages: this.getRecentMessages(5),
              language: 'fr'
            },
            metadata: {
              clientVersion: '1.0.0',
              timestamp: Date.now(),
              userAgent: navigator.userAgent
            }
          });

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        timestamp: Date.now(),
        role: 'assistant',
        content: response.response,
        metadata: {
          requestId: response.requestId,
          processingTime: response.processingTime,
          confidence: response.confidence,
          sources: response.sources
        }
      };

      // Add assistant message to conversation
      this.addMessage(assistantMessage);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Handle error
      const errorMessage = this.errorHandler.handleChatError(error);
      this.showSystemMessage(errorMessage, 'error');
      
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Handle input change
   */
  private handleInputChange(value: string): void {
    // Update last activity
    this.chatState.lastActivity = Date.now();
  }

  /**
   * Add message to conversation
   */
  private addMessage(message: ChatMessage): void {
    // Add to state
    this.chatState.messages.push(message);
    this.chatState.lastActivity = Date.now();

    // Add to UI
    if (this.messageContainer) {
      this.messageContainer.addMessage(message);
    }

    // Save to storage
    this.storageManager.saveChat(this.chatState);

    // Announce to screen readers
    if (message.role === 'assistant') {
      this.announceToScreenReader('Nouvelle réponse de l\'assistant EME');
    }
  }

  /**
   * Show system message
   */
  showSystemMessage(content: string, role: MessageRole = 'system'): void {
    const systemMessage: ChatMessage = {
      id: uuidv4(),
      timestamp: Date.now(),
      role,
      content
    };

    this.addMessage(systemMessage);
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.isLoading = loading;

    // Update input field
    if (this.inputField) {
      this.inputField.setEnabled(!loading);
    }

    // Show/hide typing indicator
    if (this.messageContainer) {
      if (loading) {
        this.messageContainer.showTypingIndicator();
      } else {
        this.messageContainer.hideTypingIndicator();
      }
    }

    // Update container class
    if (loading) {
      this.container.classList.add('loading');
    } else {
      this.container.classList.remove('loading');
    }
  }

  /**
   * Get recent messages for context
   */
  private getRecentMessages(count: number): ChatMessage[] {
    return this.chatState.messages.slice(-count);
  }

  /**
   * Handle clear chat
   */
  private handleClearChat(): void {
    const confirmed = confirm(
      'Êtes-vous sûr de vouloir effacer tout l\'historique de conversation ?\n\nCette action est irréversible.'
    );

    if (confirmed) {
      // Clear storage
      this.storageManager.clearChat();
      
      // Reset state
      this.chatState = this.storageManager.createInitialState();
      
      // Clear UI
      if (this.messageContainer) {
        this.messageContainer.clear();
      }
      
      // Clear input
      if (this.inputField) {
        this.inputField.clear();
        this.inputField.focus();
      }
      
      // Show welcome message
      this.showWelcomeMessage();
      
      // Announce to screen readers
      this.announceToScreenReader('Historique de conversation effacé');
    }
  }

  /**
   * Handle quick question button click
   */
  private handleQuickQuestion(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const question = button.getAttribute('data-question');
    
    if (question && this.inputField) {
      // Set the question in the input field
      this.inputField.setValue(question);
      
      // Focus the input field
      this.inputField.focus();
      
      // Scroll to chat section
      const chatSection = this.container.querySelector('.chat-section');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Announce to screen readers
      this.announceToScreenReader(`Question préremplie: ${question}`);
    }
  }

  /**
   * Handle export chat
   */
  private handleExportChat(): void {
    try {
      const exportData = this.storageManager.exportConversation('json');
      
      // Create download
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversation-eme-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      this.showSystemMessage('Conversation exportée avec succès', 'system');
      
    } catch (error) {
      console.error('Failed to export conversation:', error);
      this.showSystemMessage('Erreur lors de l\'export de la conversation', 'error');
    }
  }

  /**
   * Handle connection lost
   */
  private handleConnectionLost(): void {
    this.showSystemMessage(
      'Connexion internet perdue. Les messages seront envoyés une fois la connexion rétablie.',
      'system'
    );
  }

  /**
   * Handle connection restored
   */
  private handleConnectionRestored(): void {
    this.showSystemMessage('Connexion internet rétablie.', 'system');
  }

  /**
   * Handle before unload
   */
  private handleBeforeUnload(): void {
    // Save current state
    this.storageManager.saveChat(this.chatState);
  }

  /**
   * Handle window resize
   */
  private handleWindowResize(): void {
    // Update message container scroll
    if (this.messageContainer) {
      this.messageContainer.scrollToBottom();
    }
  }

  /**
   * Handle global keyboard shortcuts
   */
  private handleGlobalKeydown(event: KeyboardEvent): void {
    // Ctrl/Cmd + K to focus input
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      if (this.inputField) {
        this.inputField.focus();
      }
    }

    // Escape to clear input
    if (event.key === 'Escape' && this.inputField) {
      this.inputField.clear();
    }
  }

  /**
   * Show initialization error
   */
  private showInitializationError(error: any): void {
    this.container.innerHTML = `
      <div class="error-container">
        <div class="error-content">
          <h2>Erreur d'initialisation</h2>
          <p>L'assistant EME n'a pas pu se charger correctement.</p>
          <p>Veuillez rafraîchir la page ou réessayer plus tard.</p>
          <button onclick="window.location.reload()" class="btn btn-primary">
            Rafraîchir la page
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Announce message to screen readers
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
   * Public API methods
   */

  /**
   * Get current chat state
   */
  getChatState(): ChatState {
    return { ...this.chatState };
  }

  /**
   * Check if chatbot is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Dispose of the chatbot
   */
  dispose(): void {
    // Dispose components
    this.trustHeader?.dispose();
    this.messageContainer?.dispose();
    this.inputField?.dispose();

    // Remove event listeners
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.removeEventListener('resize', this.handleWindowResize.bind(this));
    document.removeEventListener('keydown', this.handleGlobalKeydown.bind(this));

    // Save final state
    this.storageManager.saveChat(this.chatState);
  }
}