import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import morgan from 'morgan';
import { createServer } from 'vite';
import { pathToFileURL } from 'node:url';

async function createDevServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const root = process.cwd();

  app.use(express.json());

   // --- 1. API ROUTES FIRST ---
  app.post('/api/checkPassword', (req, res) => {
      const { password } = req.body;
      const correctPassword = process.env.RESIDENT_PW;

      if (!correctPassword) {
          console.error("Environment variable RESIDENT_PW is not set!");
          return res.status(500).json({ error: "Server configuration error" });
      }

      if (password === correctPassword) {
          return res.status(200).json({ success: true });
      } else {
          return res.status(403).json({ success: false, message: "Incorrect password" });
      }
  });

  if (isProd) {
    
    app.use(express.static(path.resolve(root, 'dist/client'), {
      index: false, // Don't serve index.html automatically
    }));

    // 3. Production SSR Catch-all
    app.get(/^(?!\/api).+/, async (req, res) => {
      try {
        // Read the ALREADY BUILT index.html
        const template = fs.readFileSync(
          path.resolve(root, 'dist/client/index.html'),
          'utf-8'
        );

        // Load the ALREADY BUILT server entry
        const serverEntryPath = path.resolve(root, 'dist/server/entry.js');
        const { render } = await import(pathToFileURL(serverEntryPath).href);

        const appHtml = await render(req.originalUrl);
        const html = template.replace('`empty`', () => appHtml);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        console.error(e.stack);
        res.status(500).end(e.stack);
      }
    });
  } else {
    app.use(morgan('dev'));

    const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'custom'
    });

    app.use(vite.middlewares);

    // --- 2. SSR CATCH-ALL LAST ---
    // render vite client code to browser
    app.get(/^(?!\/api).+/, async (req, res, next) => {
        const url = req.originalUrl;

        // Ignore HMR and static asset requests that might slip through
        if (url?.includes('.') && !url?.endsWith('.html')) {
            return next();
        }

        try {
        // 1. Read index.html (Ensure the path is correct for your project)
        let template = fs.readFileSync(
            path.resolve(process.cwd(), 'index.html'), 
            'utf-8'
        );

        // 2. Apply Vite HTML transforms
        template = await vite.transformIndexHtml(url, template);

        // 3. Load the server entry
        const { render } = await vite.ssrLoadModule('/src/client/entry.jsx');

        // 4. Render the app HTML
        const appHtml = await render(url);

        // 5. Inject into template
        const html = template.replace(``, () => appHtml);

        // 6. Send it back
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
        }
    });
  }

  

  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}

createDevServer();