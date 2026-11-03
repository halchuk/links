import { Category, LinkItem } from '../types';
import { INITIAL_CATEGORIES, INITIAL_LINKS } from '../data/seedData';

const STORAGE_KEY_LINKS = 'linkkeeper_links_v1';
const STORAGE_KEY_CATEGORIES = 'linkkeeper_categories_v1';

export const storageService = {
  getLinks(): LinkItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_LINKS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(INITIAL_LINKS));
        return INITIAL_LINKS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Erro ao ler links do storage:', e);
      return INITIAL_LINKS;
    }
  },

  saveLinks(links: LinkItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
    } catch (e) {
      console.error('Erro ao salvar links no storage:', e);
    }
  },

  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
        return INITIAL_CATEGORIES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Erro ao ler categorias do storage:', e);
      return INITIAL_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]) {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Erro ao salvar categorias no storage:', e);
    }
  },

  addCategory(name: string, icon = 'Folder'): Category {
    const categories = this.getCategories();
    const id = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const existing = categories.find((c) => c.id === id);
    if (existing) return existing;

    const colors = ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EC4899', '#3B82F6', '#14B8A6'];
    const newCat: Category = {
      id,
      name: name.trim(),
      icon,
      color: colors[categories.length % colors.length],
    };
    const updated = [...categories, newCat];
    this.saveCategories(updated);
    return newCat;
  },

  addLink(item: Omit<LinkItem, 'id' | 'createdAt' | 'updatedAt'>): LinkItem {
    const links = this.getLinks();
    const newLink: LinkItem = {
      ...item,
      id: 'link_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newLink, ...links];
    this.saveLinks(updated);
    return newLink;
  },

  updateLink(id: string, updates: Partial<LinkItem>): LinkItem | null {
    const links = this.getLinks();
    const index = links.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...links[index],
      ...updates,
      updatedAt: Date.now(),
    };
    links[index] = updatedItem;
    this.saveLinks(links);
    return updatedItem;
  },

  deleteLink(id: string) {
    const links = this.getLinks().filter((l) => l.id !== id);
    this.saveLinks(links);
  },

  toggleFavorite(id: string): boolean {
    const links = this.getLinks();
    const item = links.find((l) => l.id === id);
    if (!item) return false;
    item.isFavorite = !item.isFavorite;
    item.updatedAt = Date.now();
    this.saveLinks(links);
    return item.isFavorite;
  },

  resetDefaults(): { links: LinkItem[]; categories: Category[] } {
    localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(INITIAL_LINKS));
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return { links: INITIAL_LINKS, categories: INITIAL_CATEGORIES };
  },
};
