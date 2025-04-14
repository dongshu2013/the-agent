# AI Agent Project Rules & Architecture

## Project Overview
- **Name**: AI Agent
- **Description**: A comprehensive AI agent system with a backend API, Chrome extension frontend, and web dashboard
- **Components**:
  - Backend: Python-based REST API for AI agent functionality
  - Extension: Chrome extension for user interaction
  - Web: Next.js dashboard for user management and API key generation

## Repository Structure

```
├── backend/                # Python-based backend API
│   ├── the_agent/         # Main application code
│   ├── RULES.md           # Backend-specific rules
│   └── requirements.txt   # Python dependencies
│
├── extension/             # Chrome extension frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── PROJECT_STRUCTURE.md # Extension structure documentation
│   └── package.json       # Node.js dependencies
│
├── web/                   # Next.js web dashboard
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── RULES.md           # Web dashboard rules
│   └── package.json       # Node.js dependencies
│
├── .flake8                # Python linting configuration
├── .pre-commit-config.yaml # Pre-commit hooks configuration
└── RULES.md               # This file - project-wide rules
```

## Global Development Rules

### 1. Version Control
- Use Git for version control
- Create feature branches from `main` for new development
- Use descriptive commit messages
- Squash commits before merging to main

### 2. Code Quality
- Follow language-specific style guides:
  - Python: PEP 8
  - TypeScript/JavaScript: ESLint configuration
- Run pre-commit hooks before committing
- Write unit tests for new functionality

### 3. Documentation
- Document all public APIs
- Keep README and RULES files updated
- Use inline comments for complex logic

### 4. Security
- Never commit sensitive credentials
- Use environment variables for secrets
- Follow OWASP security best practices

### 5. Cross-Component Integration
- Backend API changes must be coordinated with extension updates
- Document all API endpoints that the extension depends on
- Maintain API versioning for backward compatibility

## Component-Specific Rules

### Backend
See detailed rules in [backend/RULES.md](backend/RULES.md)

### Extension
See detailed structure in [extension/PROJECT_STRUCTURE.md](extension/PROJECT_STRUCTURE.md)

### Web Dashboard
See detailed rules in [web/RULES.md](web/RULES.md)

## Environment Setup

### Backend
1. Create a Python virtual environment
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Set up required environment variables (see backend/RULES.md)

### Extension
1. Install Node.js dependencies: `cd extension && npm install`
2. Build the extension: `npm run build`
3. Load the extension in Chrome from the `dist` directory

### Web Dashboard
1. Set up Firebase project (see web/RULES.md)
2. Install dependencies: `cd web && npm install`
3. Configure environment variables
4. Run development server: `npm run dev`

## Deployment

### Backend
- Deploy as a containerized service
- Ensure all environment variables are properly configured
- Set up database migrations

### Extension
- Package for Chrome Web Store
- Follow Chrome's extension publishing guidelines
- Maintain version compatibility with backend API

### Web Dashboard
- Deploy to Firebase hosting
- Configure environment variables for production
- Set up SSL certificates
