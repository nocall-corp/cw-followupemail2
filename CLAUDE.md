# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status
This is currently an **empty project directory** within a multi-project repository. The project type and technology stack have not yet been determined.

## Repository Context
This project is part of a larger multi-project repository that contains:
- **Next.js/React Applications**: Modern web apps with TypeScript
- **Google Apps Script Projects**: Business automation tools
- **Python Applications**: Data processing and AI tools
- **MCP Servers**: Claude Desktop integration projects

## Technology Stack Options

### Option 1: Next.js Application (Recommended for web interfaces)
**Commands**:
- `npm install` - Install dependencies
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build
- `npm run start` - Production server  
- `npm run lint` - Code linting
- `npm run type-check` - TypeScript type checking

**Stack**: Next.js 15, TypeScript, shadcn/ui, Tailwind CSS 4, Radix UI

### Option 2: Google Apps Script (For email automation)
**Commands**:
- `npm install -g @google/clasp` - Install clasp globally
- `clasp login` - Authenticate with Google
- `clasp create --title "Follow-up Email 2"` - Create new project
- `clasp push` - Deploy to Apps Script
- `clasp open` - Open in Apps Script editor

**Files**: `.gs` for logic, `.html` for interfaces, `appsscript.json` for config

## Repository Standards

### Next.js Projects Structure
```
app/                 # Next.js App Router pages
  - page.tsx         # Main application page
  - layout.tsx       # Root layout
  - globals.css      # Global styles
components/ui/       # shadcn/ui components
hooks/              # Custom React hooks
lib/                # Utilities and helpers
```

### Google Apps Script Structure
```
Code.gs             # Main application logic
appsscript.json     # Configuration
*.html              # Web interfaces (if needed)
```

### Code Style
- **TypeScript**: Strict mode enabled, use path aliases `@/*`
- **Components**: Functional components with hooks
- **Imports**: ES6 imports, prefer named imports
- **UI**: shadcn/ui components with Tailwind CSS
- **Icons**: Lucide React for Next.js projects

### Key Dependencies (Next.js)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **UI**: shadcn/ui built on Radix UI primitives  
- **Styling**: Tailwind CSS 4
- **Utilities**: clsx, tailwind-merge, date-fns, lucide-react

## Development Workflow
1. **Initialize project**: Choose technology stack and create initial structure
2. **Install dependencies**: Use appropriate package manager commands
3. **Development**: Use provided dev commands with hot reloading
4. **Code quality**: Run lint and type-check commands before commits
5. **Follow patterns**: Use existing projects in repository as reference

## Related Projects
- `cw-followup-email/` - Existing Google Apps Script follow-up email project
- `billing-pj/` - Next.js billing management system with similar patterns
- Other `cw-*` projects - Related automation tools

## Project Initialization Required
Since this is an empty directory, the first step is to determine the project type and initialize the appropriate structure based on the intended functionality (web interface vs email automation).