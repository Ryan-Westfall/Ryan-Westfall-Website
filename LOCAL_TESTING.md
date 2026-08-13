# Local Testing - RUNNING NOW

## Dev Server Active

**URL:** http://localhost:5173/

**Started:** PID 8596 (managed by system)

## Test Checklist

Open http://localhost:5173 in your browser and verify:

- [ ] Page loads (no white screen!)
- [ ] "Hey, I'm Ryan." types out with animation
- [ ] Your face photo displays
- [ ] Navigation bar at top with social icons
- [ ] Projects section loads (may take 1-2 sec for GitHub API)
- [ ] Text Editor card links to GitHub pixorize-editor
- [ ] Study PDF card opens PDF in new tab
- [ ] GitHub repos appear below (filtered, no forks)
- [ ] LinkedIn icon → https://linkedin.com/in/ryan-westfall
- [ ] GitHub icon → https://github.com/Ryan-Westfall
- [ ] Resume icon downloads PDF
- [ ] Mobile responsive (resize browser window)

## Build Verified

Production build successful:
- Build time: 478ms
- Bundle size: 161KB (gzipped: 53KB)
- Total dist: 3.4MB (includes images)

## Stop Dev Server

When done testing:
```bash
pkill -f "vite"
# or
kill 8596
```

## Deploy

Ready to push when satisfied:
```bash
cd /Users/ryrywest/Documents/Projects/Ryan-Westfall-Website
git push origin main
```
