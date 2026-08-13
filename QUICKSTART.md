# Quick Start - Ryan's Portfolio

## Project Ready ✅

Vite + React portfolio is built and committed. Ready to test and deploy.

## Test Locally

```bash
cd /Users/ryrywest/Documents/Projects/Ryan-Westfall-Website

npm install
npm run dev
```

Visit http://localhost:5173

## Deploy to Production

```bash
# Push to GitHub (Netlify auto-deploys)
./push-to-deploy.sh

# Or manually:
git push origin main
```

Site will update at https://ryan-westfall.info automatically via Netlify.

## What Changed

Old Gatsby site → New Vite site

- Build time: 45s → 2s
- Dependencies: 24 → 7
- Pages: 3 → 1 (single page)
- React: 16 → 18
- Resume: Updated to 2024 version
- LinkedIn: Updated URL
- Editor: Removed (links to GitHub)

## Files

- `src/` - React components (234 lines total)
- `public/` - Static assets & resume PDF
- `netlify.toml` - Deploy config
- `MIGRATION.md` - Full migration details

## Next Steps

1. Test locally with `npm run dev`
2. Push to GitHub
3. Verify deploy on Netlify
4. Test ryan-westfall.info

All done! Just need to push.
