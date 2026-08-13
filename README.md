# Ryan Westfall Portfolio

Modern portfolio website built with Vite + React.

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **React Helmet Async** - SEO and meta tags

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Deployed on Netlify at [ryan-westfall.info](https://ryan-westfall.info)

Build settings:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20

## Features

- Responsive design
- Projects loaded dynamically from GitHub API
- Resume download
- Social links (LinkedIn, GitHub)
- Typing animation hero
- SEO optimized

## Project Structure

```
src/
├── components/
│   ├── Nav.jsx        - Navigation header
│   ├── Hero.jsx       - Landing hero with typing animation
│   └── Projects.jsx   - GitHub projects grid
├── css/
│   └── main.css       - All styles
├── assets/
│   └── face.png       - Profile image
├── App.jsx            - Main app component
└── main.jsx           - Entry point

public/
├── ryan-resume.pdf    - Resume for download
├── study.pdf          - Research paper
├── favicon.png
└── manifest.json
```

## Migration from Gatsby

Migrated from Gatsby 2.x to Vite + React in 2024 for:
- Faster builds (50x improvement)
- Simpler codebase
- Better developer experience
- Reduced dependencies
