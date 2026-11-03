import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Category, LinkItem, TagCount } from './types';
import { storageService } from './services/storage';
import { LinkCard } from './components/LinkCard';
import { SearchBar } from './components/SearchBar';
import { CategoryBar } from './components/CategoryBar';
import { TagFilterBar } from './components/TagFilterBar';
import { NewLinkModal } from './components/NewLinkModal';
import { ExportModal } from './components/ExportModal';
import { ExpoCodeHubModal } from './components/ExpoCodeHubModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  Bookmark,
  Plus,
  Download,
  Terminal,
  Smartphone,
  Monitor,
  RefreshCw,
  SearchX,
  Layers,
  Star,
} from 'lucide-react';

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical' | 'domain'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);

  // Modals
  const [isNewLinkOpen, setIsNewLinkOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExpoCodeHubOpen, setIsExpoCodeHubOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize data
  useEffect(() => {
    const loadedLinks = storageService.getLinks();
    const loadedCategories = storageService.getCategories();
    setLinks(loadedLinks);
    setCategories(loadedCategories);
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    links.forEach((l) => {
      map[l.categoryId] = (map[l.categoryId] || 0) + 1;
    });
    return map;
  }, [links]);

  // Compute available tags with frequencies
  const availableTags: TagCount[] = useMemo(() => {
    const tagMap = new Map<string, number>();
    links.forEach((l) => {
      l.tags.forEach((t) => {
        tagMap.set(t, (tagMap.get(t) || 0) + 1);
      });
    });

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [links]);

  // Tag filter toggle
  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

  // Add category
  const handleAddCategory = (name: string) => {
    const newCat = storageService.addCategory(name);
    setCategories(storageService.getCategories());
    setSelectedCategoryId(newCat.id);
    showToast(`Categoria "${newCat.name}" criada com sucesso!`, 'success');
  };

  // Save new link
  const handleSaveLink = (item: Omit<LinkItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLink = storageService.addLink(item);
    setLinks(storageService.getLinks());
    showToast(`"${newLink.title}" salvo com sucesso!`, 'success');
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    const isFav = storageService.toggleFavorite(id);
    setLinks(storageService.getLinks());
    showToast(isFav ? 'Link adicionado aos favoritos' : 'Link removido dos favoritos', 'info');
  };

  // Delete link
  const handleDeleteLink = (id: string) => {
    storageService.deleteLink(id);
    setLinks(storageService.getLinks());
    showToast('Link excluído.', 'info');
  };

  // Reset defaults
  const handleResetDefaults = () => {
    if (confirm('Deseja resetar para a lista padrão de links de Front-end?')) {
      const { links: defLinks, categories: defCats } = storageService.resetDefaults();
      setLinks(defLinks);
      setCategories(defCats);
      setSelectedCategoryId('all');
      setSelectedTags([]);
      setSearchQuery('');
      showToast('Dados restaurados para o padrão de demonstração!', 'info');
    }
  };

  // Filtered & Sorted links
  const filteredLinks = useMemo(() => {
    return links
      .filter((item) => {
        // 1. Category
        if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) {
          return false;
        }

        // 2. Favorites only
        if (onlyFavorites && !item.isFavorite) {
          return false;
        }

        // 3. Multi-tags (item must contain all selected tags)
        if (selectedTags.length > 0) {
          const hasAllTags = selectedTags.every((st) => item.tags.includes(st));
          if (!hasAllTags) return false;
        }

        // 4. Instant Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDomain = item.domain.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
          const matchUrl = item.url.toLowerCase().includes(q);

          if (!matchTitle && !matchDomain && !matchDesc && !matchTags && !matchUrl) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'oldest') return a.createdAt - b.createdAt;
        if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
        if (sortBy === 'domain') return a.domain.localeCompare(b.domain);
        return 0;
      });
  }, [links, selectedCategoryId, onlyFavorites, selectedTags, searchQuery, sortBy]);

  // Main UI Content to render (reusable in Desktop view or Mobile simulator frame)
  const renderAppContent = (isMobileSim = false) => (
    <div className={`flex flex-col flex-1 ${isMobileSim ? 'bg-[#0A0E17] text-slate-100 overflow-y-auto' : ''}`}>
      {/* Top Header */}
      <header className="border-b border-[#1E2638] bg-[#0A0E17]/90 backdrop-blur-md sticky top-0 z-20">
        <div className={`mx-auto flex items-center justify-between ${isMobileSim ? 'px-4 py-3' : 'max-w-7xl px-4 sm:px-6 py-4'}`}>
          {/* Logo & Title Only (Zero secondary text on the left) */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bookmark className="w-4 h-4 fill-emerald-500/20" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Links
            </h1>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex items-center gap-2">
            

            {/* Export JSON / CSV Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#141B2A] hover:bg-[#1A2336] border border-[#1E2638] rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Exportar links em JSON ou CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            {/* New Link Button */}
            <button
              onClick={() => setIsNewLinkOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Novo Link</span>
              <span className="sm:hidden">Novo</span>
            </button>

            {/* Mobile Simulator Toggle (visible on desktop) */}
            {!isMobileSim && (
              <button
                onClick={() => setIsSimulatorMode(!isSimulatorMode)}
                className={`p-2 rounded-xl border transition-colors hidden lg:flex ${
                  isSimulatorMode
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#141B2A] border-[#1E2638] text-slate-400 hover:text-slate-200'
                }`}
                title={isSimulatorMode ? 'Voltar para visão Desktop' : 'Simular tela de Celular (Expo)'}
              >
                {isSimulatorMode ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`mx-auto w-full ${isMobileSim ? 'px-4 py-4 pb-20' : 'max-w-7xl px-4 sm:px-6 py-5 pb-24 sm:pb-8'} space-y-4 flex-1`}>
        {/* Search Bar & Filters */}
        <SearchBar
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onlyFavorites={onlyFavorites}
          onToggleFavorites={() => setOnlyFavorites(!onlyFavorites)}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          sortBy={sortBy}
          onChangeSortBy={setSortBy}
          totalFiltered={filteredLinks.length}
          isMobileSim={isMobileSim}
        />

        {/* Categories Bar */}
        <CategoryBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onAddCategory={handleAddCategory}
          categoryCounts={categoryCounts}
          totalLinksCount={links.length}
        />

        {/* Tags Bar */}
        <TagFilterBar
          availableTags={availableTags}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          onClearTags={handleClearTags}
        />

        {/* Active Filter Indicators */}
        {(searchQuery || selectedTags.length > 0 || onlyFavorites || selectedCategoryId !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-400 bg-[#0F1420] border border-[#1E2638] px-3.5 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">
                {filteredLinks.length} {filteredLinks.length === 1 ? 'link encontrado' : 'links encontrados'}
              </span>
              {selectedCategoryId !== 'all' && (
                <span className="text-slate-500">
                  em <strong className="text-emerald-400 font-normal">{categories.find((c) => c.id === selectedCategoryId)?.name}</strong>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId('all');
                setSelectedTags([]);
                setOnlyFavorites(false);
              }}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}

        {/* Links Grid or List */}
        {filteredLinks.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? `grid gap-4 w-full min-w-0 ${isMobileSim ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`
                : 'flex flex-col gap-2.5 w-full min-w-0'
            }
          >
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                categories={categories}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteLink}
                onTagClick={handleToggleTag}
                onCopySuccess={() => showToast('Link copiado para a área de transferência!', 'success')}
                viewMode={viewMode}
                isMobileSim={isMobileSim}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 bg-[#101622] border border-dashed border-[#1E2638] rounded-2xl text-center">
            <div className="p-3 bg-[#151D2C] rounded-2xl text-slate-500 mb-3">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Nenhum link encontrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Nenhum item corresponde aos critérios de pesquisa ou filtros selecionados no momento.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId('all');
                  setSelectedTags([]);
                  setOnlyFavorites(false);
                }}
                className="px-4 py-2 bg-[#1A2234] hover:bg-[#202B40] text-slate-200 text-xs font-semibold rounded-xl border border-[#232F46] transition-colors"
              >
                Limpar filtros
              </button>
              <button
                onClick={() => setIsNewLinkOpen(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
              >
                Adicionar novo link
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Floating Bottom Bar for Ergonomic Phone Navigation */}
      {!isMobileSim && (
        <nav className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-[#0A0E17]/95 backdrop-blur-xl border-t border-[#1E2638] px-3 py-1.5 safe-pb flex items-center justify-around shadow-2xl">
          <button
            onClick={() => {
              setSelectedCategoryId('all');
              setSelectedTags([]);
              setOnlyFavorites(false);
              setSearchQuery('');
            }}
            className={`flex flex-col items-center justify-center min-w-[54px] py-1 transition-colors ${
              selectedCategoryId === 'all' && !onlyFavorites && !searchQuery
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Início</span>
          </button>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex flex-col items-center justify-center min-w-[54px] py-1 transition-colors ${
              onlyFavorites ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-4 h-4 mb-0.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="text-[10px]">Favoritos</span>
          </button>

          {/* Prominent Center Action for Thumbs */}
          <button
            onClick={() => setIsNewLinkOpen(true)}
            className="w-12 h-12 -mt-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
            title="Adicionar Novo Link"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex flex-col items-center justify-center min-w-[54px] py-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Exportar</span>
          </button>

          <button
            onClick={() => setIsExpoCodeHubOpen(true)}
            className="flex flex-col items-center justify-center min-w-[54px] py-1 text-emerald-400/90 hover:text-emerald-300 transition-colors"
          >
            <Terminal className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Expo</span>
          </button>
        </nav>
      )}

      {/* Footer */}
      <footer className="border-t border-[#1E2638] py-4 bg-[#0A0E17]/60 text-xs text-slate-500 hidden sm:block">
        <div className={`mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 ${isMobileSim ? 'px-4' : 'max-w-7xl px-4 sm:px-6'}`}>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Links · Curadoria & Organização</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
              title="Restaurar dados de exemplo"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restaurar Seed</span>
            </button>
            <button
              onClick={() => setIsExpoCodeHubOpen(true)}
              className="text-emerald-400 hover:underline"
            >
              Ver Super Prompt & Specs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans">
      {isSimulatorMode ? (
        /* Mobile Expo Simulator Frame */
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#060910]">
          <div className="flex items-center justify-between w-full max-w-[420px] mb-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <strong className="text-slate-200">Simulador Expo Mobile</strong> (390x844)
            </span>
            <button
              onClick={() => setIsSimulatorMode(false)}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Visão Expandida</span>
            </button>
          </div>

          {/* iPhone Mockup Frame */}
          <div className="relative w-full max-w-[410px] h-[840px] bg-[#0A0E17] border-[10px] border-[#1C2538] rounded-[52px] shadow-2xl overflow-hidden flex flex-col">
            {/* iPhone Dynamic Island */}
            <div className="w-full pt-3 pb-1 flex justify-center bg-[#0A0E17] shrink-0 z-30">
              <div className="w-28 h-5 bg-black rounded-full border border-white/5" />
            </div>

            {/* In-Phone Screen Content */}
            {renderAppContent(true)}
          </div>
        </div>
      ) : (
        /* Standard Responsive Desktop / Tablet / Mobile View */
        renderAppContent(false)
      )}

      {/* Modals */}
      <NewLinkModal
        isOpen={isNewLinkOpen}
        onClose={() => setIsNewLinkOpen(false)}
        categories={categories}
        onSaveLink={handleSaveLink}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        links={links}
        categories={categories}
        onImportSuccess={(count, newLinks) => {
          setLinks(newLinks);
          storageService.saveLinks(newLinks);
        }}
        onShowToast={showToast}
      />

      <ExpoCodeHubModal
        isOpen={isExpoCodeHubOpen}
        onClose={() => setIsExpoCodeHubOpen(false)}
        onShowToast={showToast}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
