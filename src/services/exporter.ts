import { Category, ExportData, LinkItem } from '../types';

export const exportService = {
  generateJsonData(links: LinkItem[], categories: Category[]): string {
    const exportPayload: ExportData = {
      appName: 'Links',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      totalLinks: links.length,
      categories,
      links: links.map((l) => {
        const cat = categories.find((c) => c.id === l.categoryId);
        return {
          id: l.id,
          title: l.title,
          url: l.url,
          domain: l.domain,
          category: cat ? cat.name : 'Geral',
          tags: l.tags,
          isFavorite: l.isFavorite,
          description: l.description,
          createdAt: new Date(l.createdAt).toISOString(),
        };
      }),
    };

    return JSON.stringify(exportPayload, null, 2);
  },

  downloadJson(links: LinkItem[], categories: Category[]) {
    const jsonString = this.generateJsonData(links, categories);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const filename = `links_export_${new Date().toISOString().slice(0, 10)}.json`;

    this.triggerDownload(blob, filename);
  },

  generateCsvData(links: LinkItem[], categories: Category[]): string {
    const headers = ['Título', 'URL', 'Domínio', 'Categoria', 'Tags', 'Favorito', 'Descrição', 'Data de Criação'];
    
    const escapeCsv = (str: string | undefined | null): string => {
      if (!str) return '""';
      const clean = str.replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = links.map((l) => {
      const cat = categories.find((c) => c.id === l.categoryId);
      return [
        escapeCsv(l.title),
        escapeCsv(l.url),
        escapeCsv(l.domain),
        escapeCsv(cat ? cat.name : 'Geral'),
        escapeCsv(l.tags.join(', ')),
        l.isFavorite ? 'Sim' : 'Não',
        escapeCsv(l.description),
        escapeCsv(new Date(l.createdAt).toLocaleString('pt-BR')),
      ].join(',');
    });

    // Add UTF-8 BOM so Excel opens accents (ç, ã, é) correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    return csvContent;
  },

  downloadCsv(links: LinkItem[], categories: Category[]) {
    const csvString = this.generateCsvData(links, categories);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const filename = `links_export_${new Date().toISOString().slice(0, 10)}.csv`;

    this.triggerDownload(blob, filename);
  },

  triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importFromJson(jsonContent: string): { importedCount: number; links: LinkItem[] } {
    const parsed = JSON.parse(jsonContent);
    const rawLinks = Array.isArray(parsed) ? parsed : parsed.links || [];

    const validated: LinkItem[] = rawLinks.map((item: any, idx: number) => ({
      id: item.id || `imported_${Date.now()}_${idx}`,
      url: item.url || '',
      domain: item.domain || (item.url ? new URL(item.url).hostname.replace(/^www\./, '') : 'link'),
      title: item.title || item.url || 'Link sem título',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      faviconUrl: item.faviconUrl || '',
      categoryId: item.categoryId || 'frontend',
      tags: Array.isArray(item.tags)
        ? item.tags
        : typeof item.tags === 'string'
        ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [],
      isFavorite: !!item.isFavorite,
      createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
      updatedAt: Date.now(),
    })).filter((l: LinkItem) => Boolean(l.url));

    return { importedCount: validated.length, links: validated };
  },
};
