import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import morgan from 'morgan';
import { createServer } from 'vite';

async function createDevServer() {
  const app = express();
  app.use(morgan('dev'));

  // --- 1. API ROUTES FIRST ---
  app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the API!' });
  });

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
    if (url.includes('.') && !url.endsWith('.html')) {
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

  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}

createDevServer();