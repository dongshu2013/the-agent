# Chrome Extension Development Rules

## Project Overview
- **Name**: AI Character Builder
- **Type**: Chrome Extension (Manifest V3)
- **Tech Stack**: TypeScript, Webpack
- **Version**: 1.0.0

## Development Rules

### 1. Code Organization
- Follow the established directory structure as outlined in PROJECT_STRUCTURE.md
- Keep components modular and focused on a single responsibility
- Use TypeScript for all new code
- Maintain clear separation between UI, business logic, and API calls

### 2. Code Style
- Use ESLint and Prettier for code formatting
- Follow TypeScript best practices
- Use meaningful variable and function names
- Document complex functions with JSDoc comments

### 3. State Management
- Use React's Context API for global state when necessary
- Keep component state local when possible
- Avoid prop drilling through multiple component levels

### 4. API Integration
- All backend API calls should be centralized in service modules
- Handle errors gracefully with appropriate user feedback
- Implement proper loading states for asynchronous operations
- Cache responses when appropriate to reduce API load

### 5. Twitter/X.com Integration
- Follow Twitter's Terms of Service
- Ensure content scripts are efficient and don't impact page performance
- Test across different Twitter UI versions
- Handle Twitter DOM changes gracefully

### 6. Browser Compatibility
- Test on multiple Chromium-based browsers
- Ensure compatibility with different Chrome versions
- Follow Manifest V3 best practices

### 7. Security
- Never store sensitive information in local storage
- Sanitize any user input
- Follow Content Security Policy best practices
- Limit permissions to only what's necessary

### 8. Testing
- Write unit tests for utility functions
- Test content scripts against different page structures
- Manually verify extension functionality on target sites
- Test with different user accounts and scenarios

### 9. Build Process
- Use the provided npm scripts for consistent builds
- Ensure production builds are optimized and minified
- Keep the manifest.json updated with the correct version
- Test the built extension before distribution

### 10. Deployment
- Create release notes for each version
- Follow Chrome Web Store publishing guidelines
- Maintain backward compatibility when possible
- Update documentation with new features

## Contribution Workflow
1. Create a feature branch from main
2. Implement changes following these rules
3. Test thoroughly
4. Submit a pull request with a clear description
5. Address review comments
6. Merge only after approval

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed information about the project structure and components.
