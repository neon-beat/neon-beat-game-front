<div align="center">

# Neon Beat Game (Front-End)

Blind test / music quiz front-end built with React 19, TypeScript, Vite 7 and Tailwind CSS 4. Streams a YouTube video while progressively revealing fields (song title, artist, year, etc.).

![App Screenshot](./src/assets/logo.png)

</div>

## Table of Contents
1. Overview
2. Features
3. Tech Stack
4. Quick Start
5. Available Scripts
6. Project Structure
7. Core Components
8. Styling & Design System
9. Testing
10. Linting & Formatting
11. Configuration & Customization
12. Deployment
13. Roadmap / Ideas
14. Contributing
15. License

## 1. Overview
This repository contains the front-end UI for a music blind test game. A YouTube video is embedded and players attempt to guess metadata (song / artist / year, etc.). Fields can be hidden until revealed. The current implementation is a static prototype wired with hard‑coded data; it can be extended to consume a backend or real-time game service later.

## 2. Features
- 🚀 Fast dev environment with Vite + React Fast Refresh
- 🎵 Embedded YouTube playback via `react-player`
- 🧩 Dynamic field list with masked / revealed states
- 🎨 Utility-first styling using Tailwind CSS v4 (with custom gradient + border helpers)
- ✅ Unit testing with Vitest + Testing Library + JSDOM
- 🧹 Strict linting (ESLint 9 + TypeScript rules) & Prettier with Tailwind plugin

## 3. Tech Stack
| Layer | Tech |
|-------|------|
| Framework | React 19 + TypeScript |
| Bundler/Dev | Vite 7 |
| Styling | Tailwind CSS 4 |
| Video | react-player (YouTube) |
| Testing | Vitest, @testing-library/react, @testing-library/jest-dom |
| Lint / Format | ESLint, @typescript-eslint, Prettier, prettier-plugin-tailwindcss |

## 4. Quick Start
Prerequisites: Node.js 20+ (LTS recommended) & npm.

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173 by default)
npm run dev

# Run tests (watch mode)
npm test

# Build production bundle into dist/
npm run build

# Preview the production build locally
npm run preview
```

## 5. Available Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check then build production assets |
| `npm run preview` | Serve the built `dist/` for smoke testing |
| `npm run lint` | Run ESLint over `.ts/.tsx` sources (no warnings allowed) |
| `npm test` | Run Vitest test suite |

## 6. Project Structure
```
src/
  main.tsx            # App bootstrap (React root)
  App.tsx             # Top-level layout & demo wiring
  components/
    Fields/          # Field list component
    YoutubePlayer/    # YouTube player wrapper with optional overlay
  assets/             # Static images (logo, backgrounds)
  App.test.tsx        # Example test
  setupTests.ts       # Testing Library / JSDOM setup
tailwind.config.js    # Tailwind configuration
vite.config.ts        # Vite + React plugin config
```

## 7. Core Components
### Fields
Displays a list of field items with masking logic.
Props:
- `fields: { key: string; value: string; show: boolean; }[]`

Example:
```tsx
<Fields
  fields={[
    { key: 'Song', value: 'Darude - Sandstorm', show: false },
    { key: 'Artist', value: 'Darude', show: false },
    { key: 'Year', value: '1999', show: true },
  ]}
/>
```

### YoutubePlayer
Wrapper around `react-player` specialized for YouTube IDs. Optional overlay for countdowns or hints.
Props:
- `youtubeId?: string` (defaults to a demo ID)
- `showOverlay?: boolean` (default `false`)
- `overlayText?: string` text displayed when overlay visible

Example:
```tsx
<YoutubePlayer youtubeId="D0W6ubDI-64" showOverlay overlayText="30" />
```

## 8. Styling & Design System
Tailwind CSS v4 utilities are used. Custom classes like `custom-gradient` / `custom-border` are defined in local CSS (see `App.css`). Extend Tailwind in `tailwind.config.js` for colors, spacing, animations. Use Prettier + Tailwind plugin to keep class ordering consistent.

## 9. Testing
Vitest is configured for a React + JSDOM environment.

Run all tests:
```bash
npm test
```

Add new tests under `src/**/*.test.tsx`. Use Testing Library queries (`screen.getByRole`, etc.) for resilient assertions.

## 10. Linting & Formatting
Run lint:
```bash
npm run lint
```

Formatting is handled by Prettier (invoke manually or via editor integration). Tailwind class order is auto-sorted by `prettier-plugin-tailwindcss`.

## 11. Deployment
Build artifacts are emitted to `dist/`.

Common static hosting options: Netlify, Vercel, GitHub Pages, Cloudflare Pages.

Minimal static server check after build:
```bash
npm run build
npm run preview
```

## 12. License
This project is licensed under the GNU General Public License v3.0 – see [`LICENSE`](./LICENSE) for details.

---
Feel free to adapt or extend. PRs welcome.
