# Type Definitions

This directory contains centralized type definitions for the application. By consolidating all types in one place, we can maintain consistency and avoid duplicated definitions across multiple files.

## Structure

- `index.ts` - Main export point for all types. Import from this file in most cases: `import { Message, Conversation } from '../types'`
- `messages.ts` - Types related to chat messages and displays
- `conversations.ts` - Types for conversation management
- `api.ts` - Types for API requests and responses
- `settings.ts` - Types for application settings

## Migration Strategy

The codebase is transitioning from scattered type definitions to a centralized system. During this transition period, you'll find:

- `MessageType` is an alias for `Message`: To maintain backward compatibility, we've created a type alias `MessageType = Message`. This allows incremental adoption of the new type naming.
- Usage pattern: `import { Message as MessageType } from "../types";` when importing in components that have their own `Message` name.

Over time, the alias will be deprecated, and all code will use the `Message` type directly.

## Best Practices

1. **Use Centralized Types**: Always import types from the `types` directory instead of defining them locally in service or component files.
2. **Document New Types**: Add JSDoc comments to all new types to make them self-explanatory.
3. **Type Isolation**: Keep types logically grouped by domain/feature.
4. **Type Reuse**: Use type composition and extension rather than duplicating similar types.

## Notable Types

### Message

The core message type used throughout the application for displaying and processing messages in the chat:

```typescript
interface Message {
  id?: string;
  role: string;
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
  type?: string; // Used for error messages
}
```

### Conversation

The conversation model that holds a collection of messages:

```typescript
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Settings

The application settings interface:

```typescript
interface Settings {
  apiKey: string;
  apiUrl: string;
  model: string;
  systemPrompt: string;
  memoryStrategy: MemoryStrategy;
  temperature: number;
  maxTokens: number;
}
```

### Environment Configuration

The environment configuration interface:

```typescript
interface Env {
  OPENAI_MODEL: string;
  API_URL: string;
  BACKEND_URL: string;
  SYSTEM_PROMPT: string;
  SERVER_URL: string;
}
``` 