/**
 * EME Monaco Chatbot - Storage Management Service
 * Handles localStorage persistence with data validation and migration
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  ChatState, 
  StoredChatData, 
  ChatMessage, 
  UserPreferences 
} from '@/types/interfaces';
import { validateStorageData, sanitizeStorageData } from '@/utils/sanitization';

export class StorageManager {
  private readonly storageKey = 'eme-chatbot-session';
  private readonly currentVersion = '1.0';
  private readonly maxStorageSize = 5 * 1024 * 1024; // 5MB limit

  /**
   * Save chat state to localStorage
   */
  saveChat(state: ChatState): boolean {
    try {
      const data: StoredChatData = {
        version: this.currentVersion,
        sessionId: state.sessionId,
        created: this.getStoredData()?.created || Date.now(),
        lastModified: Date.now(),
        messages: state.messages,
        userPreferences: state.userPreferences,
        metadata: {
          totalMessages: state.messages.length,
          totalCharacters: state.messages.reduce((sum, msg) => sum + msg.content.length, 0),
          averageResponseTime: this.calculateAverageResponseTime(state.messages)
        }
      };

      // Sanitize data before storing
      const sanitizedData = sanitizeStorageData(data);
      if (!sanitizedData) {
        console.error('Failed to sanitize storage data');
        return false;
      }

      // Check storage size
      const serialized = JSON.stringify(sanitizedData);
      if (serialized.length > this.maxStorageSize) {
        console.warn('Storage data exceeds size limit, cleaning old messages');
        this.cleanOldMessages(sanitizedData);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(sanitizedData));
      return true;
    } catch (error) {
      console.error('Failed to save chat to localStorage:', error);
      return false;
    }
  }

  /**
   * Load chat state from localStorage
   */
  loadChat(): ChatState | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return null;
      }

      const data = JSON.parse(stored);
      
      // Validate data integrity
      if (!validateStorageData(data)) {
        console.warn('Invalid storage data detected, clearing storage');
        this.clearChat();
        return null;
      }

      // Migrate data if necessary
      const migratedData = this.migrateData(data);
      
      return {
        messages: migratedData.messages || [],
        sessionId: migratedData.sessionId || this.generateSessionId(),
        lastActivity: migratedData.lastModified || Date.now(),
        version: this.currentVersion,
        userPreferences: migratedData.userPreferences || this.getDefaultPreferences()
      };
    } catch (error) {
      console.error('Failed to load chat from localStorage:', error);
      this.clearChat(); // Clear corrupted data
      return null;
    }
  }

  /**
   * Clear all chat data from localStorage
   */
  clearChat(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear chat from localStorage:', error);
    }
  }

  /**
   * Get stored data without full parsing
   */
  private getStoredData(): StoredChatData | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Generate a new session ID
   */
  generateSessionId(): string {
    return uuidv4();
  }

  /**
   * Get default user preferences
   */
  getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light',
      fontSize: 'medium',
      autoScroll: true,
      soundEnabled: false,
      animationsEnabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      language: 'fr',
      accessibilityMode: false
    };
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): boolean {
    try {
      const currentState = this.loadChat();
      if (!currentState) {
        return false;
      }

      currentState.userPreferences = {
        ...currentState.userPreferences,
        ...preferences
      };

      return this.saveChat(currentState);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  }

  /**
   * Add a message to the stored conversation
   */
  addMessage(message: ChatMessage): boolean {
    try {
      const currentState = this.loadChat() || this.createInitialState();
      currentState.messages.push(message);
      currentState.lastActivity = Date.now();
      
      return this.saveChat(currentState);
    } catch (error) {
      console.error('Failed to add message:', error);
      return false;
    }
  }

  /**
   * Create initial chat state
   */
  createInitialState(): ChatState {
    return {
      messages: [],
      sessionId: this.generateSessionId(),
      lastActivity: Date.now(),
      version: this.currentVersion,
      userPreferences: this.getDefaultPreferences()
    };
  }

  /**
   * Migrate data from older versions
   */
  private migrateData(data: any): StoredChatData {
    // Handle version migration
    if (!data.version || data.version !== this.currentVersion) {
      console.log(`Migrating data from version ${data.version || 'unknown'} to ${this.currentVersion}`);
      
      // Migration logic for different versions
      if (!data.version) {
        // Migrate from pre-versioned data
        data = {
          version: this.currentVersion,
          sessionId: data.sessionId || this.generateSessionId(),
          created: data.created || Date.now(),
          lastModified: Date.now(),
          messages: data.messages || [],
          userPreferences: data.userPreferences || this.getDefaultPreferences(),
          metadata: {
            totalMessages: (data.messages || []).length,
            totalCharacters: (data.messages || []).reduce((sum: number, msg: any) => sum + (msg.content?.length || 0), 0),
            averageResponseTime: 0
          }
        };
      }

      // Save migrated data
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save migrated data:', error);
      }
    }

    return data;
  }

  /**
   * Clean old messages to free up storage space
   */
  private cleanOldMessages(data: StoredChatData): void {
    // Keep only the last 50 messages
    if (data.messages.length > 50) {
      data.messages = data.messages.slice(-50);
    }

    // Update metadata
    data.metadata.totalMessages = data.messages.length;
    data.metadata.totalCharacters = data.messages.reduce((sum, msg) => sum + msg.content.length, 0);
  }

  /**
   * Calculate average response time from messages
   */
  private calculateAverageResponseTime(messages: ChatMessage[]): number {
    const responseTimes: number[] = [];
    
    for (let i = 1; i < messages.length; i++) {
      const prevMessage = messages[i - 1];
      const currentMessage = messages[i];
      
      if (prevMessage.role === 'user' && currentMessage.role === 'assistant') {
        const responseTime = currentMessage.timestamp - prevMessage.timestamp;
        if (responseTime > 0 && responseTime < 60000) { // Reasonable response time (< 1 minute)
          responseTimes.push(responseTime);
        }
      }
    }

    if (responseTimes.length === 0) {
      return 0;
    }

    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  /**
   * Export conversation data
   */
  exportConversation(format: 'json' | 'txt' = 'json'): string {
    const state = this.loadChat();
    if (!state) {
      return '';
    }

    if (format === 'txt') {
      return this.exportAsText(state);
    }

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      sessionId: state.sessionId,
      messageCount: state.messages.length,
      messages: state.messages.map(msg => ({
        timestamp: new Date(msg.timestamp).toISOString(),
        role: msg.role,
        content: msg.content
      }))
    }, null, 2);
  }

  /**
   * Export conversation as readable text
   */
  private exportAsText(state: ChatState): string {
    const lines = [
      'Conversation EME Monaco Chatbot',
      `Exporté le: ${new Date().toLocaleString('fr-FR')}`,
      `Session ID: ${state.sessionId}`,
      `Nombre de messages: ${state.messages.length}`,
      '',
      '--- Conversation ---',
      ''
    ];

    for (const message of state.messages) {
      const timestamp = new Date(message.timestamp).toLocaleString('fr-FR');
      const role = message.role === 'user' ? 'Vous' : 
                   message.role === 'assistant' ? 'Assistant EME' : 
                   message.role === 'system' ? 'Système' : 'Erreur';
      
      lines.push(`[${timestamp}] ${role}:`);
      lines.push(message.content);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const used = stored ? new Blob([stored]).size : 0;
      const available = this.maxStorageSize - used;
      const percentage = (used / this.maxStorageSize) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: this.maxStorageSize, percentage: 0 };
    }
  }

  /**
   * Check if storage is available
   */
  isStorageAvailable(): boolean {
    try {
      const testKey = 'eme-storage-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up old sessions (called periodically)
   */
  cleanupOldSessions(): void {
    const state = this.loadChat();
    if (!state) {
      return;
    }

    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    if (state.lastActivity < thirtyDaysAgo) {
      console.log('Cleaning up old session data');
      this.clearChat();
    }
  }
}