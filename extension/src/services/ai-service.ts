import OpenAI from 'openai';
import { ToolDescription, getToolDescriptions } from '../tools/tool-descriptions';

interface Settings {
  apiKey: string;
}

export class AIConversationService {
  private openai: OpenAI;
  private abortController: AbortController | null = null;
  private settings: Settings = {
    apiKey: ''
  };
  private readonly defaultBaseUrl = 'https://openrouter.ai/api/v1';
  private readonly defaultModel = 'google/gemini-2.5-pro-exp-03-25:free';

  constructor() {
    // Initialize with default settings
    this.openai = new OpenAI({ 
      apiKey: 'placeholder', // Will be updated after loading settings
      baseURL: this.defaultBaseUrl,
      dangerouslyAllowBrowser: true 
    });
    
    // Load settings asynchronously
    this.loadSettings();
  }

  private async loadSettings(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey'], (result) => {
        if (result.apiKey) {
          this.settings.apiKey = result.apiKey;
        }
        
        // Update OpenAI configuration with loaded settings
        this.openai = new OpenAI({
          apiKey: this.settings.apiKey,
          baseURL: this.defaultBaseUrl,
          dangerouslyAllowBrowser: true
        });
        
        resolve();
      });
    });
  }

  // Use the imported getToolDescriptions function
  private getToolDescriptions(): ToolDescription[] {
    return getToolDescriptions();
  }

  // Send a message and get a streaming response
  public async sendMessage(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    // Create a new AbortController for this request
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      // Prepare messages for the API
      const messages = [
        { role: 'user', content: message },
        { 
          role: 'system', 
          content: 'You are a helpful AI assistant integrated into a Chrome extension. You can help users with their browsing experience.'
        }
      ];

      // Send to OpenAI/OpenRouter
      const response = await fetch(`${this.defaultBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: messages,
          stream: true
        }),
        signal
      });

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') break;
              
              try {
                const parsedChunk = JSON.parse(jsonStr);
                const content = parsedChunk.choices[0]?.delta?.content || '';
                
                if (content) {
                  assistantMessage += content;
                  onChunk(content);
                }
              } catch (parseError) {
                console.error('Error parsing chunk:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was cancelled');
      } else {
        console.error('Error sending message:', error);
        throw error;
      }
    } finally {
      // Reset streaming state
      this.abortController = null;
    }
  }
  
  // Cancel ongoing request
  public cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// Singleton instance
export const aiService = new AIConversationService();
