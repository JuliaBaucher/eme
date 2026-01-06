/**
 * EME Monaco Chatbot - Chat API Service
 * Handles communication with the EME chat backend
 */

import type { ChatAPIRequest, ChatAPIResponse } from '@/types/interfaces';

interface ChatAPIConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  apiKey?: string;
}

export class ChatAPI {
  private config: ChatAPIConfig;
  private abortController?: AbortController;

  constructor(config: ChatAPIConfig) {
    this.config = config;
  }

  /**
   * Send a message to the chat API
   */
  async sendMessage(request: ChatAPIRequest): Promise<ChatAPIResponse> {
    // Cancel any pending request
    if (this.abortController) {
      this.abortController.abort();
    }

    // Create new abort controller
    this.abortController = new AbortController();

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(request, this.abortController.signal);
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }

        // Don't retry on client errors (4xx)
        if (error instanceof Error && 'status' in error && 
            typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('Failed to send message after retries');
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest(request: ChatAPIRequest, signal: AbortSignal): Promise<ChatAPIResponse> {
    const url = `${this.config.baseUrl}/chat`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': request.metadata.clientVersion,
      'X-Session-ID': request.sessionId
    };

    // Add API key if provided
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    // Add CSRF protection
    headers['X-Requested-With'] = 'XMLHttpRequest';

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal,
      credentials: 'same-origin', // Include cookies for CSRF protection
      mode: 'cors'
    };

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.config.timeout);
    });

    try {
      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url, fetchOptions),
        timeoutPromise
      ]);

      // Check if request was successful
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).code = errorData.code;
        throw error;
      }

      // Parse response
      const data = await response.json();
      
      // Validate response structure
      if (!this.isValidResponse(data)) {
        throw new Error('Invalid response format from server');
      }

      return data as ChatAPIResponse;

    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to EME services');
      }

      // Handle timeout
      if (error instanceof Error && error.message === 'Request timeout') {
        throw new Error('Request timed out. Please try again.');
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Parse error response from server
   */
  private async parseErrorResponse(response: Response): Promise<{ message: string; code?: string }> {
    try {
      const data = await response.json();
      return {
        message: data.error || data.message || 'Unknown server error',
        code: data.code
      };
    } catch {
      // If we can't parse the error response, return a generic message
      return {
        message: `Server error: ${response.status} ${response.statusText}`
      };
    }
  }

  /**
   * Validate API response structure
   */
  private isValidResponse(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.response === 'string' &&
      typeof data.requestId === 'string' &&
      typeof data.processingTime === 'number' &&
      typeof data.metadata === 'object'
    );
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cancel any pending request
   */
  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }
  }

  /**
   * Check if API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        timeout: 5000
      } as RequestInit);

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get API status information
   */
  async getStatus(): Promise<{ status: string; version: string; uptime: number }> {
    const response = await fetch(`${this.config.baseUrl}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get API status');
    }

    return response.json();
  }

  /**
   * Mock API response for development/testing
   */
  private createMockResponse(request: ChatAPIRequest): ChatAPIResponse {
    const responses = [
      "Bonjour ! Je peux vous aider avec les services EME. Que souhaitez-vous savoir ?",
      "Pour les diagnostics de maturité numérique, nous proposons une évaluation complète de votre entreprise.",
      "L'annuaire professionnel EME contient plus de 200 prestataires certifiés dans le domaine numérique.",
      "Les opportunités de financement incluent des subventions jusqu'à 50% pour la transformation digitale.",
      "FlashLearn IA 2026 est notre programme d'intégration de l'intelligence artificielle pour les entreprises monégasques."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      response: randomResponse,
      confidence: 0.85 + Math.random() * 0.15,
      sources: [
        'https://eme.gouv.mc/services',
        'https://eme.gouv.mc/financement'
      ],
      suggestedActions: [
        'En savoir plus sur les diagnostics',
        'Consulter l\'annuaire professionnel',
        'Découvrir les financements'
      ],
      requestId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      processingTime: 500 + Math.random() * 1500,
      metadata: {
        model: 'eme-assistant-v1',
        version: '1.0.0',
        timestamp: Date.now()
      }
    };
  }

  /**
   * Enable mock mode for development
   */
  async sendMessageMock(request: ChatAPIRequest): Promise<ChatAPIResponse> {
    // Simulate network delay
    await this.delay(800 + Math.random() * 1200);

    // Simulate occasional errors for testing
    if (Math.random() < 0.05) { // 5% error rate
      throw new Error('Simulated network error for testing');
    }

    return this.createMockResponse(request);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ChatAPIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ChatAPIConfig {
    return { ...this.config };
  }
}