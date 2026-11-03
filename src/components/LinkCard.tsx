import React, { useState } from 'react';
import { LinkItem, Category } from '../types';
import { Bookmark, ExternalLink, Copy, Check, Trash2, Globe } from 'lucide-react';

interface LinkCardProps {
  link: LinkItem;
  categories: Category[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  onCopySuccess: () => void;
  viewMode?: 'grid' | 'compact';
  isMobileSim?: boolean;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  categories,
  onToggleFavorite,
  onDelete,
  onTagClick,
  onCopySuccess,
  viewMode = 'grid',
  isMobileSim = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const category = categories.find((c) => c.id === link.categoryId);
  const categoryName = category ? category.name : 'Geral';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(link.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  if (viewMode === 'compact') {
    return (
      <div className="group relative flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-[#121824] hover:bg-[#151D2C] active:bg-[#162030] border border-[#1E2638] hover:border-slate-700/60 rounded-xl transition-all duration-150 w-full min-w-0 max-w-full">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Ícone de favorito: REMOVIDO na versão mobile, visível apenas no desktop */}
          <button
            onClick={() => onToggleFavorite(link.id)}
            className={`w-9 h-9 sm:w-7 sm:h-7 items-center justify-center text-slate-500 hover:text-amber-400 active:scale-95 transition-all shrink-0 ${
              isMobileSim ? 'hidden' : 'hidden sm:flex'
            }`}
            title={link.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
          >
            <Bookmark
              className={`w-4 h-4 ${link.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
            />
          </button>

          {link.faviconUrl && !imgError ? (
            <img
              src={link.faviconUrl}
              alt=""
              onError={() => setImgError(true)}
              className="w-4 h-4 rounded shrink-0 object-contain"
            />
          ) : (
            <Globe className="w-4 h-4 text-slate-500 shrink-0" />
          )}

          <div className="min-w-0 flex-1">
            {/* Título e link: No mobile, o link vai para a LINHA DE BAIXO do título. No desktop, fica ao lado */}
            <div className={isMobileSim ? 'flex flex-col' : 'flex flex-col sm:flex-row sm:items-center sm:gap-2'}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-semibold text-slate-100 hover:text-emerald-400 truncate block transition-colors leading-snug"
              >
                {link.title}
              </a>
              
              <div className={isMobileSim ? 'flex items-center gap-1.5 mt-0.5' : 'flex items-center gap-1.5 mt-0.5 sm:mt-0'}>
                <span className={isMobileSim ? 'hidden' : 'hidden sm:inline text-xs text-slate-600'}>·</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs text-emerald-400 font-mono truncate hover:underline"
                >
                  {link.domain}
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 mt-0.5">
              <span className="truncate">{categoryName}</span>

              {/* Data de cadastro: REMOVIDA na versão mobile, visível apenas no desktop */}
              <span className={isMobileSim ? 'hidden' : 'hidden sm:inline-flex items-center gap-1.5'}>
                <span aria-hidden="true">·</span>
                <span className="shrink-0">{formattedDate}</span>
              </span>

              {/* Tags: REMOVIDAS na versão mobile, visíveis apenas no desktop */}
              {link.tags.length > 0 && (
                <div className={isMobileSim ? 'hidden' : 'hidden sm:inline-flex items-center gap-1.5 truncate'}>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1 truncate">
                    {link.tags.slice(0, 2).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagClick(tag)}
                        className="text-slate-400 hover:text-emerald-400 hover:underline transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                    {link.tags.length > 2 && (
                      <span className="text-slate-600">+{link.tags.length - 2}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={handleCopy}
            className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 active:text-emerald-400 hover:bg-[#1C2538] rounded-lg transition-colors"
            title="Copiar URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#1C2538] rounded-lg transition-colors"
            title="Abrir link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => onDelete(link.id)}
            className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Grid / Rich Card View
  return (
    <div className="group relative flex flex-col justify-between bg-[#121824] hover:bg-[#141C2B] border border-[#1E2638] hover:border-slate-700/70 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-black/40 w-full min-w-0 max-w-full">
      {/* Optional Preview Image */}
      {link.imageUrl && !imgError ? (
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer noopener"
          className="relative w-full h-32 sm:h-36 bg-[#0B0F17] overflow-hidden border-b border-[#1E2638] block cursor-pointer"
        >
          <img
            src={link.imageUrl}
            alt={link.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-transparent opacity-60" />
        </a>
      ) : null}

      <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
        {/* Top metadata line */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {link.faviconUrl ? (
              <img
                src={link.faviconUrl}
                alt=""
                className="w-3.5 h-3.5 rounded shrink-0 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className="font-mono text-[11px] text-emerald-400 truncate">{link.domain}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="truncate">{categoryName}</span>
          </div>

          {/* Ícone de favorito: REMOVIDO na versão mobile, visível apenas no desktop */}
          <button
            onClick={() => onToggleFavorite(link.id)}
            className={`w-8 h-8 sm:w-7 sm:h-7 items-center justify-center text-slate-500 hover:text-amber-400 active:scale-90 transition-all shrink-0 -mr-1 ${
              isMobileSim ? 'hidden' : 'hidden sm:flex'
            }`}
            title={link.isFavorite ? 'Remover dos favoritos' : 'Favoritar link'}
          >
            <Bookmark
              className={`w-4 h-4 ${link.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`}
            />
          </button>
        </div>

        {/* Title */}
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-sm sm:text-base font-semibold text-slate-100 hover:text-emerald-400 leading-snug line-clamp-2 transition-colors mb-1.5"
        >
          {link.title}
        </a>

        {/* Description */}
        {link.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1 mb-3">
            {link.description}
          </p>
        )}

        {/* Tags footer: REMOVIDAS na versão mobile */}
        <div className="pt-2.5 border-t border-[#1E2638] flex flex-col gap-2 mt-auto">
          {link.tags.length > 0 && (
            <div className={isMobileSim ? 'hidden' : 'hidden sm:flex flex-wrap items-center gap-1.5'}>
              {link.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className="text-[11px] font-mono text-slate-400 hover:text-emerald-400 hover:bg-[#1A2234] px-1.5 py-0.5 rounded transition-colors active:scale-95"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className={`flex items-center ${isMobileSim ? 'justify-end' : 'justify-end sm:justify-between'} pt-1 text-xs text-slate-500`}>
            {/* Data de cadastro: REMOVIDA na versão mobile, visível apenas no desktop */}
            <span className={isMobileSim ? 'hidden' : 'hidden sm:inline'}>{formattedDate}</span>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 active:text-emerald-400 hover:bg-[#1C2538] rounded-lg transition-colors active:scale-95"
                title="Copiar URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#1C2538] rounded-lg transition-colors active:scale-95"
                title="Abrir no navegador"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onDelete(link.id)}
                className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors active:scale-95"
                title="Excluir link"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
