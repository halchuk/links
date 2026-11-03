import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction ? Number(process.env.PORT || 8080) : 3000;

app.use(express.json());

// API: Scrape OpenGraph Metadata from any URL
app.get('/api/scrape', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Parâmetro url é obrigatório' });
  }

  let parsedUrl: URL;
  try {
    const formattedUrl = targetUrl.startsWith('http://') || targetUrl.startsWith('https://')
      ? targetUrl
      : `https://${targetUrl}`;
    parsedUrl = new URL(formattedUrl);
  } catch {
    return res.status(400).json({ error: 'URL inválida' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 LinkKeeper/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const html = await response.text();

    // Helper regex extractors
    const extractMeta = (propertyPattern: RegExp): string => {
      const match = html.match(propertyPattern);
      return match ? (match[1] || match[2] || '').trim() : '';
    };

    // Extract Title
    let title = extractMeta(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i) ||
                extractMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i) ||
                extractMeta(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']*)["']/i);

    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim() : '';
    }

    // Extract Description
    let description = extractMeta(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i) ||
                      extractMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i) ||
                      extractMeta(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);

    // Extract Image
    let imageUrl = extractMeta(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i) ||
                   extractMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i) ||
                   extractMeta(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']*)["']/i);

    // Extract Favicon
    let faviconUrl = '';
    const faviconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']*)["']/i) ||
                         html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["'](?:shortcut )?icon["']/i);

    if (faviconMatch) {
      faviconUrl = faviconMatch[1].trim();
    }

    // Resolve relative URLs
    const resolveUrl = (relativeOrAbsolute: string) => {
      if (!relativeOrAbsolute) return '';
      try {
        return new URL(relativeOrAbsolute, parsedUrl.origin).href;
      } catch {
        return relativeOrAbsolute;
      }
    };

    if (imageUrl) imageUrl = resolveUrl(imageUrl);
    faviconUrl = faviconUrl ? resolveUrl(faviconUrl) : `${parsedUrl.origin}/favicon.ico`;

    const domain = parsedUrl.hostname.replace(/^www\./, '');

    // Clean up title if still empty
    if (!title) {
      const cleanPath = parsedUrl.pathname.replace(/^\/|\/$/g, '').replace(/[-_]/g, ' ');
      title = cleanPath ? `${cleanPath} · ${domain}` : domain;
    }

    // Unescape common HTML entities
    const unescapeHtml = (str: string) => {
      return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&ndash;/g, '–')
        .replace(/&mdash;/g, '—');
    };

    return res.json({
      success: true,
      metadata: {
        title: unescapeHtml(title),
        description: unescapeHtml(description),
        imageUrl,
        faviconUrl,
        domain,
        url: parsedUrl.href,
      },
    });
  } catch (err: any) {
    // Graceful fallback when scraping fails or is blocked
    const domain = parsedUrl.hostname.replace(/^www\./, '');
    const cleanPath = parsedUrl.pathname.replace(/^\/|\/$/g, '').replace(/[-_]/g, ' ');
    const title = cleanPath ? `${cleanPath} · ${domain}` : domain;

    return res.json({
      success: true,
      metadata: {
        title,
        description: `Link salvo de ${domain}`,
        imageUrl: '',
        faviconUrl: `${parsedUrl.origin}/favicon.ico`,
        domain,
        url: parsedUrl.href,
      },
      warning: 'Scraping em fallback: ' + (err.message || 'Timeout/Bloqueio'),
    });
  }
});

// Mounting Vite in development or serving dist in production
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Links Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
