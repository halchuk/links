import { ScrapeResponse } from '../types';

export async function scrapeLinkMetadata(rawUrl: string): Promise<ScrapeResponse> {
  const urlToTest = rawUrl.trim();
  if (!urlToTest) {
    return { success: false, error: 'URL vazia' };
  }

  try {
    const res = await fetch(`/api/scrape?url=${encodeURIComponent(urlToTest)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Erro ao chamar /api/scrape, executando fallback local:', err);
  }

  // Client-side fallback if backend route isn't reachable
  try {
    const formatted = urlToTest.startsWith('http://') || urlToTest.startsWith('https://')
      ? urlToTest
      : `https://${urlToTest}`;
    const parsed = new URL(formatted);
    const domain = parsed.hostname.replace(/^www\./, '');
    const cleanPath = parsed.pathname.replace(/^\/|\/$/g, '').replace(/[-_]/g, ' ');
    const title = cleanPath ? `${cleanPath} · ${domain}` : domain;

    return {
      success: true,
      metadata: {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        description: `Link salvo de ${domain}`,
        imageUrl: '',
        faviconUrl: `${parsed.origin}/favicon.ico`,
        domain,
        url: parsed.href,
      },
    };
  } catch {
    return { success: false, error: 'Formato de URL inválido' };
  }
}
