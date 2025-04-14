# Web Dashboard Rules & Architecture

## Project Overview
- **Name**: AI Agent Web Dashboard
- **Type**: Next.js Web Application
- **Tech Stack**: Next.js, TypeScript, Tailwind CSS, Firebase Authentication, PostgreSQL
- **Version**: 1.0.0

## Directory Structure

```
├── public/               # Static assets
│   └── google-logo.svg   # Google authentication logo
│
├── src/                  # Source code
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Home/Login page
│   │   └── profile/      # Protected profile page
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/              # Utility libraries
│   │   ├── firebase.ts   # Firebase configuration (auth only)
│   │   ├── prisma.ts     # PostgreSQL database client
│   │   └── apiKeyService.ts # API key management
│   └── middleware.ts     # Route protection middleware
│
├── prisma/               # Prisma ORM
│   └── schema.prisma     # Database schema definition
│
├── .env.local           # Environment variables (not in git)
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## Development Rules

### 1. Authentication
- Use Firebase Authentication for Google sign-in
- Store user data in PostgreSQL database
- Protect routes that require authentication
- Handle authentication state with React context

### 2. Database Schema
- Use PostgreSQL with Prisma ORM
- Schema includes:
  - User: Stores user information and API keys
  - Conversation: Tracks conversation sessions
  - Message: Stores all messages with their content

```prisma
model User {
  id            String         @id @default(uuid())
  username      String         @unique
  email         String?        @unique
  api_key       String         @unique
  conversations Conversation[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Conversation {
  id        String    @id @default(uuid())
  user      User      @relation(fields: [user_id], references: [id])
  user_id   String
  messages  Message[]
  created_at DateTime  @default(now())
  status    String    @default("active") // "active" or "deleted"
}

model Message {
  id              String       @id @default(uuid())
  conversation    Conversation @relation(fields: [conversation_id], references: [id])
  conversation_id String
  role            String       // "system", "user", "assistant", or "tooling"
  content         Json         // Array of text_message or image_message objects
  created_at      DateTime     @default(now())
}
```

### 3. API Key Management
- Generate unique API keys for each user
- Store API keys securely in PostgreSQL
- Provide functionality to rotate keys when compromised
- Never expose API keys in client-side code

### 4. Code Organization
- Follow Next.js App Router conventions
- Use TypeScript for type safety
- Implement responsive design with Tailwind CSS
- Keep components modular and reusable

### 5. State Management
- Use React context for global state
- Keep component state local when possible
- Implement proper loading and error states

### 6. Security
- Never commit sensitive information or API keys
- Use environment variables for Firebase and PostgreSQL configuration
- Implement proper CORS policies
- Follow security best practices for authentication

## Setup Instructions

### 1. Firebase Setup (Authentication Only)
1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Google Authentication in the Firebase console
3. Register a new web app in your Firebase project
4. Copy the Firebase configuration for authentication

### 2. PostgreSQL Setup
1. Create a PostgreSQL database
2. Set the DATABASE_URL in your .env.local file
3. Run database migrations: `npx prisma migrate dev`
4. Generate Prisma client: `npx prisma generate`

### 3. Environment Variables
Create a `.env.local` file in the web directory with the following variables:
```
# Firebase (for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/ai_agent?schema=public"
```

### 4. Development Workflow
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Start production server: `npm start`

## Integration with Backend API

The web dashboard integrates with the AI Agent backend API:

1. Users authenticate through the web dashboard
2. Upon authentication, users receive an API key
3. The API key is used to authenticate requests to the backend API
4. The backend API validates the API key before processing requests

## Deployment

1. Deploy to Vercel or similar platform
2. Ensure environment variables are properly configured
3. Set up proper CORS headers in the backend API
4. Configure PostgreSQL security rules for database access
