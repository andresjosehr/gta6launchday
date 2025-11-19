# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server on port 3000
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
```

## Architecture

This is a simple static website countdown timer for GTA VI release (November 19, 2026).

### Stack
- Vanilla JavaScript (ES modules)
- CSS3 with custom properties
- Vite for build tooling and minification

### Key Files
- `index.html` - Entry point, loads script as ES module
- `script.js` - Countdown logic with setInterval, updates DOM every second
- `style.css` - All styles including animations, responsive breakpoints, and custom GTA Art Deco fonts
- `vite.config.js` - Vite configuration (esbuild minification, dev server on port 3000)

### Assets
- Custom fonts: GTA Art Deco (Regular/Medium) in `assets/fonts/`
- Images: Background and logo in `assets/images/`

## Code Patterns

- CSS uses custom properties defined in `:root` for theming (colors, fonts)
- Countdown calculates time difference from target date and updates 4 DOM elements
- Progress bar shows percentage elapsed since start date (November 6, 2025)
