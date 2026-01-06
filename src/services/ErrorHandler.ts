/**
 * EME Monaco Chatbot - Error Handler Service
 * Centralized error handling with user-friendly messages
 */

import type { ErrorState, ErrorType } from '@/types/interfaces';

export class ErrorHandler {
  private errorLog: ErrorState[] = [];
  private maxLogSize = 100;

  /**
   * Handle chat-related errors
   */
  handleChatError(error: any): string {
    const errorState = this.createErrorState(error);
    this.logError(errorState);
    
    return this.getUserFriendlyMessage(errorState);
  }

  /**
   * Create error state from error object
   */
  private createErrorState(error: any): ErrorState {
    let type: ErrorType = 'network';
    let message = 'Une erreur inattendue s\'est produite';
    let code: string | undefined;
    let retryable = true;

    if (error instanceof Error) {
      message = error.message;

      // Determine error type based on error characteristics
      if (error.name === 'AbortError') {
        type = 'network';
        message = 'Requête annulée';
        retryable = false;
      } else if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
        type = 'timeout';
        message = 'La demande a pris trop de temps';
        retryable = true;
      } else if (error.message.includes('Network error') || error.message.includes('fetch')) {
        type = 'network';
        message = 'Problème de connexion réseau';
        retryable = true;
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        type = 'validation';
        message = 'Données invalides';
        retryable = false;
      } else if (error.message.includes('storage') || error.message.includes('localStorage')) {
        type = 'storage';
        message = 'Erreur de stockage local';
        retryable = false;
      } else if ('status' in error) {
        type = 'server';
        const status = error.status as number;
        
        if (status >= 400 && status < 500) {
          retryable = false;
          if (status === 401) {
            message = 'Authentification requise';
          } else if (status === 403) {
            message = 'Accès non autorisé';
          } else if (status === 404) {
            message = 'Service non trouvé';
          } else if (status === 429) {
            message = 'Trop de demandes, veuillez patienter';
            retryable = true;
          } else {
            message = 'Erreur de requête';
          }
        } else if (status >= 500) {
          message = 'Erreur du serveur EME';
          retryable = true;
        }
        
        code = status.toString();
      }
    }

    return {
      type,
      message,
      code,
      timestamp: Date.now(),
      retryable,
      originalRequest: undefined // Could be added if needed
    };
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(errorState: ErrorState): string {
    const baseMessages: Record<ErrorType, string> = {
      network: 'Problème de connexion. Vérifiez votre réseau et réessayez.',
      timeout: 'La demande a pris trop de temps. Veuillez réessayer.',
      server: 'Service EME temporairement indisponible. Réessayez dans quelques instants.',
      validation: 'Votre message contient des données invalides. Veuillez le modifier.',
      storage: 'Problème de stockage local. Votre historique pourrait ne pas être sauvegardé.'
    };

    let message = baseMessages[errorState.type] || errorState.message;

    // Add specific guidance based on error type
    switch (errorState.type) {
      case 'network':
        message += '\n\n💡 Vérifiez votre connexion internet et réessayez.';
        break;
      case 'timeout':
        message += '\n\n💡 Le service EME met plus de temps que d\'habitude à répondre.';
        break;
      case 'server':
        if (errorState.code === '429') {
          message = 'Trop de demandes simultanées. Attendez quelques secondes avant de réessayer.';
        } else if (errorState.code === '503') {
          message = 'Service EME en maintenance. Réessayez dans quelques minutes.';
        }
        message += '\n\n💡 Si le problème persiste, contactez le support EME.';
        break;
      case 'validation':
        message += '\n\n💡 Vérifiez que votre message ne contient pas de caractères spéciaux.';
        break;
      case 'storage':
        message += '\n\n💡 Libérez de l\'espace de stockage ou utilisez un navigateur récent.';
        break;
    }

    // Add retry information
    if (errorState.retryable) {
      message += '\n\n🔄 Vous pouvez réessayer votre demande.';
    }

    return message;
  }

  /**
   * Log error for debugging
   */
  private logError(errorState: ErrorState): void {
    // Add to error log
    this.errorLog.push(errorState);

    // Limit log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Console logging for development
    if (import.meta.env.DEV) {
      console.error('EME Chatbot Error:', {
        type: errorState.type,
        message: errorState.message,
        code: errorState.code,
        timestamp: new Date(errorState.timestamp).toISOString(),
        retryable: errorState.retryable
      });
    }

    // Send to monitoring service in production (if available)
    if (import.meta.env.PROD && 'navigator' in window && 'sendBeacon' in navigator) {
      try {
        const errorData = {
          type: errorState.type,
          message: errorState.message,
          code: errorState.code,
          timestamp: errorState.timestamp,
          userAgent: navigator.userAgent,
          url: window.location.href
        };

        navigator.sendBeacon('/api/errors', JSON.stringify(errorData));
      } catch {
        // Ignore beacon errors
      }
    }
  }

  /**
   * Handle validation errors
   */
  handleValidationError(field: string, message: string): string {
    const errorState: ErrorState = {
      type: 'validation',
      message: `Erreur de validation: ${field} - ${message}`,
      timestamp: Date.now(),
      retryable: false
    };

    this.logError(errorState);
    return `Erreur dans le champ "${field}": ${message}`;
  }

  /**
   * Handle storage errors
   */
  handleStorageError(operation: string, error: any): string {
    const errorState: ErrorState = {
      type: 'storage',
      message: `Erreur de stockage lors de: ${operation}`,
      timestamp: Date.now(),
      retryable: false
    };

    this.logError(errorState);
    
    if (operation === 'save') {
      return 'Impossible de sauvegarder la conversation. Votre historique pourrait être perdu.';
    } else if (operation === 'load') {
      return 'Impossible de charger l\'historique précédent. Une nouvelle session a été créée.';
    } else {
      return 'Problème de stockage local détecté.';
    }
  }

  /**
   * Handle network connectivity issues
   */
  handleConnectivityError(isOnline: boolean): string {
    if (!isOnline) {
      const errorState: ErrorState = {
        type: 'network',
        message: 'Connexion internet perdue',
        timestamp: Date.now(),
        retryable: true
      };

      this.logError(errorState);
      return 'Connexion internet perdue. Vos messages seront envoyés une fois la connexion rétablie.';
    }

    return 'Connexion internet rétablie.';
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { total: number; byType: Record<ErrorType, number>; recent: number } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const byType: Record<ErrorType, number> = {
      network: 0,
      timeout: 0,
      server: 0,
      validation: 0,
      storage: 0
    };

    let recent = 0;

    this.errorLog.forEach(error => {
      byType[error.type]++;
      if (error.timestamp > oneHourAgo) {
        recent++;
      }
    });

    return {
      total: this.errorLog.length,
      byType,
      recent
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Export error log for debugging
   */
  exportErrorLog(): string {
    return JSON.stringify(this.errorLog.map(error => ({
      ...error,
      timestamp: new Date(error.timestamp).toISOString()
    })), null, 2);
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: any): boolean {
    const errorState = this.createErrorState(error);
    return errorState.retryable;
  }

  /**
   * Get retry delay based on error type
   */
  getRetryDelay(error: any, attempt: number): number {
    const errorState = this.createErrorState(error);
    
    if (!errorState.retryable) {
      return 0;
    }

    // Exponential backoff with jitter
    const baseDelay = errorState.type === 'timeout' ? 2000 : 1000;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const maxDelay = 30000; // 30 seconds max
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  /**
   * Create user-friendly error message for display
   */
  createErrorMessage(error: any, context?: string): { title: string; message: string; actions: string[] } {
    const errorState = this.createErrorState(error);
    const userMessage = this.getUserFriendlyMessage(errorState);
    
    let title = 'Erreur';
    const actions: string[] = [];

    switch (errorState.type) {
      case 'network':
        title = 'Problème de connexion';
        actions.push('Vérifier la connexion', 'Réessayer');
        break;
      case 'timeout':
        title = 'Délai d\'attente dépassé';
        actions.push('Réessayer');
        break;
      case 'server':
        title = 'Service indisponible';
        actions.push('Réessayer plus tard', 'Contacter le support');
        break;
      case 'validation':
        title = 'Données invalides';
        actions.push('Modifier le message');
        break;
      case 'storage':
        title = 'Problème de stockage';
        actions.push('Effacer l\'historique', 'Utiliser un autre navigateur');
        break;
    }

    if (context) {
      title += ` - ${context}`;
    }

    return {
      title,
      message: userMessage,
      actions
    };
  }
}