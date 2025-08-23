# Andrea Bravaccino Portfolio - AI Coding Guidelines

## Architecture Overview

This is a **Cloudflare Pages** hosted static portfolio with serverless AI chatbot integration. The architecture centers around three core layers:

- **Static Frontend**: Vanilla HTML/CSS/JS with Bootstrap 5 framework
- **Cloudflare Functions**: Serverless backend (`functions/` directory) 
- **AI Integration**: Google Gemini API for chatbot with GitHub README fetching

## Key Development Patterns

### Cloudflare Pages Functions Structure
```
functions/
├── _middleware.js          # Meta tag injection, social previews
└── api/
    └── chat.js            # Gemini AI chatbot endpoint
```

**Functions follow Cloudflare Workers patterns:**
- Export `onRequestPost()`, `onRequestOptions()` for HTTP methods
- Access environment via `context.env.GEMINI_API_KEY`
- Always include CORS headers for cross-origin requests
- Use `HTMLRewriter` for dynamic meta tag injection

### AI Chatbot Architecture
The chatbot (`functions/api/chat.js`) implements a sophisticated pattern:

1. **Dynamic GitHub Integration**: Maps project keywords to repos, fetches READMEs dynamically
2. **Personality Context**: Extensive prompt engineering for "SynthDrea" AI persona
3. **Conversation History**: Maintains multi-turn chat context using Gemini's `contents` array
4. **Graceful Fallbacks**: Returns personality-consistent error messages on API failures

**Critical Pattern**: The `projectRepoMap` object maps user-friendly project names to GitHub repositories for automatic documentation fetching.

### Animation System
The frontend uses **Intersection Observer API** for performance-optimized scroll animations:

```javascript
// Pattern: Staggered animations with cubic-bezier easing
skillCards.forEach((card, index) => {
    card.style.transition = `all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${index * 0.15}s`;
    observer.observe(card);
});
```

**Key principle**: All animations are CSS-based with JS only triggering classes, never manipulating styles directly.

### CSS Architecture
Uses **CSS Custom Properties** pattern for consistent theming:
```css
:root {
    --primary-color: #667eea;
    --gradient: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}
```

**Multi-game Integration**: Standalone HTML games (`memory.html`, `labirinto.html`, etc.) are self-contained with embedded CSS/JS.

### MCP Server Development Pattern
The portfolio showcases two major Model Context Protocol (MCP) servers:

**MCP Gemini Prompt Enhancer** (`mcp-gemini-prompt-enhancer`):
- FastMCP framework with TypeScript
- Google Gemini API integration for prompt optimization
- Automatic PDF asset management (downloads prompt engineering guide)
- Supports both stdio and SSE transports
- Environment-based API key authentication

**MCP Documentation Server** (`mcp-documentation-server`):
- Document management with semantic search using local AI embeddings
- Intelligent chunking system preserving document structure
- Support for .txt, .md, and .pdf file processing
- Context window retrieval for better LLM responses
- Local storage in `~/.mcp-documentation-server/` directory

## Development Workflow

### Local Development
```bash
wrangler pages dev .
# Runs on http://localhost:8788
```

### Environment Configuration
- **Local**: API keys in `wrangler.toml` [vars] section
- **Production**: Set `GEMINI_API_KEY` in Cloudflare Pages dashboard
- **Security**: Never commit API keys to git (use `.env.local` for overrides)

### Deployment Pattern
- **Zero build step**: Direct file deployment to Cloudflare Pages
- **Cache busting**: Manual version parameters in CSS/JS includes (`?2909`)
- **SEO optimization**: `_middleware.js` injects dynamic meta tags for social sharing

## Project-Specific Conventions

### File Organization
- `portfolio.css/js`: Main application styles/logic
- `style.css`: Legacy/auxiliary styles (avoid editing)
- `img/`: Optimized images with manual lazy loading
- `css/js/fonts/`: Third-party dependencies (Bootstrap, FontAwesome)

### Chatbot Content Management
When updating AI assistant knowledge:
1. Edit the `contextPrompt` in `functions/api/chat.js`
2. Update `projectRepoMap` for new GitHub repos
3. Maintain the "SynthDrea" personality consistently

**Key Projects in projectRepoMap:**
- `mcp-gemini-prompt-enhancer`: TypeScript MCP server for AI prompt optimization using Gemini
- `mcp-documentation-server`: TypeScript MCP server for document management with semantic search
- `outlook-email-summarizer`: Email summarization tool
- `tool-bulk-api-salesforce`: Salesforce Bulk API management tool

### Performance Patterns
- **Lazy loading**: Manual implementation via Intersection Observer
- **Debounced scroll events**: Used for parallax effects
- **Preloader**: Custom loading screen in `portfolio.js`
- **Font optimization**: Google Fonts with `display=swap`

## Critical Integration Points

### Meta Tag Injection
`_middleware.js` uses Cloudflare's HTMLRewriter to inject social media meta tags dynamically based on URL parameters - essential for social sharing previews.

### Cross-Origin Communication
All API endpoints must include comprehensive CORS headers for frontend/backend communication. The chatbot modal communicates with `/api/chat` via fetch API.

### Error Handling Philosophy
Maintain user experience even during failures - the chatbot returns witty error messages in character rather than technical errors.

## Game Development Pattern
Standalone games are fully self-contained HTML files with embedded CSS/JS. They share the overall color scheme via CSS variables but operate independently of the main portfolio application.
