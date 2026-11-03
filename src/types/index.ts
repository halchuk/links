export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface LinkItem {
  id: string;
  url: string;
  domain: string;
  title: string;
  description: string;
  imageUrl?: string;
  faviconUrl?: string;
  categoryId: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TagCount {
  name: string;
  count: number;
}

export interface ScrapeResponse {
  success: boolean;
  metadata?: {
    title: string;
    description: string;
    imageUrl?: string;
    faviconUrl?: string;
    domain: string;
    url: string;
  };
  warning?: string;
  error?: string;
}

export interface ExportData {
  appName: string;
  version: string;
  exportedAt: string;
  totalLinks: number;
  categories: Category[];
  links: Array<{
    id: string;
    title: string;
    url: string;
    domain: string;
    category: string;
    tags: string[];
    isFavorite: boolean;
    description: string;
    createdAt: string;
  }>;
}
