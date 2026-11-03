import React, { useState } from 'react';
import { Category, LinkItem } from '../types';
import { scrapeLinkMetadata } from '../services/scraper';
import { X, Sparkles, Loader2, Link as LinkIcon, Plus, Check, Image as ImageIcon } from 'lucide-react';

interface NewLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveLink: (item: Omit<LinkItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const NewLinkModal: React.FC<NewLinkModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveLink,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [domain, setDomain] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'frontend');
  
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [hasScraped, setHasScraped] = useState(false);

  if (!isOpen) return null;

  const handleFetchMetadata = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setScrapeError(null);

    const result = await scrapeLinkMetadata(url);
    setIsLoading(false);

    if (result.success && result.metadata) {
      setTitle(result.metadata.title);
      setDescription(result.metadata.description || '');
      setImageUrl(result.metadata.imageUrl || '');
      setFaviconUrl(result.metadata.faviconUrl || '');
      setDomain(result.metadata.domain);
      setUrl(result.metadata.url);
      setHasScraped(true);

      const autoTags: string[] = [];
      const lower = (result.metadata.title + ' ' + result.metadata.domain).toLowerCase();
      if (lower.includes('react')) autoTags.push('react');
      if (lower.includes('expo')) autoTags.push('expo');
      if (lower.includes('native')) autoTags.push('react-native');
      if (lower.includes('tailwind')) autoTags.push('tailwind');
      if (lower.includes('typescript')) autoTags.push('typescript');
      if (lower.includes('github')) autoTags.push('opensource');
      if (autoTags.length > 0 && tags.length === 0) {
        setTags(autoTags);
      }
    } else {
      setScrapeError(result.error || 'Não foi possível extrair metadados automaticamente.');
      try {
        const d = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
        setDomain(d);
        if (!title) setTitle(d);
      } catch {}
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let finalDomain = domain;
    if (!finalDomain) {
      try {
        finalDomain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
      } catch {
        finalDomain = 'link';
      }
    }

    onSaveLink({
      url: url.startsWith('http') ? url : `https://${url}`,
      domain: finalDomain,
      title: title.trim() || finalDomain,
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      faviconUrl: faviconUrl.trim() || undefined,
      categoryId,
      tags,
      isFavorite,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#121824] border-t sm:border border-[#1E2638] rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1E2638]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Adicionar Novo Link</h2>
              <p className="text-xs text-slate-400">Captura automática de OpenGraph</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#1C2538] rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1">
          {/* URL Input & Auto Scrape */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL do Link *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => {
                  if (url.trim() && !hasScraped && !title) {
                    handleFetchMetadata();
                  }
                }}
                placeholder="https://exemplo.com/artigo"
                className="flex-1 px-3.5 py-2.5 min-h-[44px] bg-[#0C111C] border border-[#1E2638] focus:border-emerald-500/70 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleFetchMetadata}
                disabled={isLoading || !url.trim()}
                className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] bg-[#1A2335] hover:bg-[#202B40] disabled:opacity-50 border border-[#232F46] rounded-xl text-xs font-semibold text-emerald-400 transition-all shrink-0 cursor-pointer active:scale-95"
                title="Buscar metadados OpenGraph"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="hidden sm:inline">{isLoading ? 'Extraindo...' : 'Auto Preencher'}</span>
              </button>
            </div>
            {scrapeError && (
              <p className="text-xs text-amber-400/90 mt-1">{scrapeError}</p>
            )}
          </div>

          {/* Scraped Preview Card */}
          {hasScraped && title && (
            <div className="p-3 bg-[#0C111C] border border-[#1E2638] rounded-xl flex gap-3 items-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="w-14 h-12 sm:w-16 sm:h-12 object-cover rounded-lg shrink-0 border border-[#1E2638]"
                  onError={() => setImageUrl('')}
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#151D2C] flex items-center justify-center shrink-0 text-slate-600">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-mono text-emerald-400 block truncate">{domain}</span>
                <span className="text-xs font-medium text-slate-200 line-clamp-1">{title}</span>
                {description && <span className="text-[11px] text-slate-400 line-clamp-1">{description}</span>}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Título do Link *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título descritivo do link"
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#0C111C] border border-[#1E2638] focus:border-emerald-500/70 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descrição / Observação
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Por que esse link é relevante..."
              className="w-full px-3.5 py-2 bg-[#0C111C] border border-[#1E2638] focus:border-emerald-500/70 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors resize-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#0C111C] border border-[#1E2638] focus:border-emerald-500/70 rounded-xl text-sm text-white outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#121824] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags (digite e toque em + ou vírgula)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="ex: react, expo, css"
                className="flex-1 px-3.5 py-2 min-h-[44px] bg-[#0C111C] border border-[#1E2638] focus:border-emerald-500/70 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="w-11 min-h-[44px] flex items-center justify-center bg-[#1A2335] hover:bg-[#202B40] border border-[#232F46] rounded-xl text-xs text-slate-300 transition-colors shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#0C111C] border border-[#1E2638] rounded-xl">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#151D2C] border border-[#243048] rounded-md text-[11px] font-mono text-emerald-300"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-400 hover:text-red-400 ml-1 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 py-1">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded bg-[#0C111C] border-[#1E2638]"
              />
              <span>Salvar diretamente como Favorito</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2638] pb-2 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-[#1E2638] text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#1A2234] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Salvar Link</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
