MIND PALACE - STAGE 6 (installable app + tap-to-read cards)
No new SQL.

1. In your project folder, run:   npm install -D vite-plugin-pwa
   (if it complains about peer dependencies, run it again with --legacy-peer-deps)
2. Copy from this zip into your project, replacing what is there:
     src/            (replace the whole folder)
     public/         (new icons: pwa-192.png, pwa-512.png, pwa-maskable-512.png, apple-touch-icon.png, favicon.svg)
     index.html      (replace)
     vite.config.js  (replace)
   If your vite.config.js uses '@vitejs/plugin-react-swc', change the second line of mine to:
     import react from '@vitejs/plugin-react-swc'
3. npm run build   then deploy the dist folder (Netlify: build command "npm run build", publish directory "dist").
4. Open the live site on your phone:
     Android (Chrome): menu > Install app, or use the Install button on the Profile tab.
     iPhone (Safari): Share > Add to Home Screen.
5. .gitignore should contain: node_modules, dist, .env
