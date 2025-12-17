# Contributing to Sportify

Thank you for your interest in contributing to Sportify! 🎉

This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/Sportify.git
cd Sportify
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/Piyush-codez0/Sportify.git
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

See [README.md](README.md) for detailed setup instructions.

### 6. Start Development Server

```bash
npm run dev
```

---

## Development Workflow

### Create a Feature Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### Keep Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### Make Your Changes

1. Write clean, readable code
2. Follow the existing code style
3. Add comments for complex logic
4. Update documentation if needed
5. Add tests for new features

### Test Your Changes

```bash
# Run linter
npm run lint

# Build the project
npm run build

# Start production server
npm run start
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid using `any` type when possible
- Use type inference when appropriate

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Avoid
const user: any = { ... };
```

### React/Next.js

- Use functional components with hooks
- Keep components small and focused
- Use meaningful component and variable names
- Extract reusable logic into custom hooks

```typescript
// Good
const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  return <div>...</div>;
};

export default TournamentCard;
```

### Styling

- Use Tailwind CSS utility classes
- Follow the existing class naming patterns
- Keep styles consistent across components
- Use CSS variables for theme colors

```typescript
// Good
<div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md">
```

### API Routes

- Use proper HTTP status codes
- Return consistent JSON responses
- Add error handling
- Validate input data

```typescript
// Good structure
export async function GET(request: Request) {
  try {
    // Logic here
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

---

## Commit Messages

Follow the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(tournaments): add location-based filtering

- Implement geospatial queries
- Add radius filter component
- Update API endpoints

Closes #123
```

```bash
fix(payment): resolve Razorpay signature verification issue

The signature verification was failing due to incorrect encoding.
Fixed by using proper HMAC SHA256 algorithm.

Fixes #456
```

---

## Pull Request Process

### 1. Update Your Branch

```bash
git fetch upstream
git rebase upstream/main
```

### 2. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template with:
   - Clear description of changes
   - Related issue numbers
   - Screenshots (if UI changes)
   - Testing done
4. Submit the pull request

### 4. PR Review

- Address review comments
- Make requested changes
- Keep PR focused and small
- Be responsive to feedback

### 5. Merging

Once approved:
- Maintainers will merge your PR
- Your branch will be deleted
- You can delete your local branch:

```bash
git checkout main
git pull upstream main
git branch -d feature/your-feature-name
```

---

## Reporting Bugs

### Before Reporting

1. Check existing issues
2. Search closed issues
3. Try to reproduce in latest version
4. Gather system information

### Creating Bug Report

Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)

Include:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details
- Error messages/logs

---

## Suggesting Features

### Before Suggesting

1. Check existing feature requests
2. Ensure it aligns with project goals
3. Consider the scope and impact

### Creating Feature Request

Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)

Include:
- Clear description
- Problem it solves
- Proposed solution
- Use cases
- Mockups if applicable

---

## Areas to Contribute

### 🐛 Bug Fixes

- Check [open issues](https://github.com/Piyush-codez0/Sportify/issues?q=is%3Aissue+is%3Aopen+label%3Abug)
- Look for "good first issue" labels

### ✨ Features

- Implement requested features
- Improve existing functionality
- Add new sports support
- Enhance UI/UX

### 📝 Documentation

- Improve README
- Add code comments
- Create tutorials
- Fix typos

### 🧪 Testing

- Add unit tests
- Add integration tests
- Improve test coverage
- Test edge cases

### 🎨 Design

- UI improvements
- Dark mode enhancements
- Mobile responsiveness
- Accessibility improvements

---

## Questions?

- Open a [discussion](https://github.com/Piyush-codez0/Sportify/discussions)
- Create an issue with "question" label
- Check existing documentation

---

## Recognition

Contributors will be:
- Listed in repository contributors
- Mentioned in release notes
- Credited in documentation

---

**Thank you for contributing to Sportify! 🏆**

Together, we're revolutionizing local sports in India! ⚽🏏🏀
