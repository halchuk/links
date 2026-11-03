import React from 'react';
import { Search, X, Star, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onChangeQuery: (q: string) => void;
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  viewMode: 'grid' | 'compact';
  onChangeViewMode: (mode: 'grid' | 'compact') => void;
  sortBy: 'newest' | 'oldest' | 'alphabetical' | 'domain';
  onChangeSortBy: (sort: 'newest' | 'oldest' | 'alphabetical' | 'domain') => void;
  totalFiltered: number;
  isMobileSim?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChangeQuery,
  onlyFavorites,
  onToggleFavorites,
  viewMode,
  onChangeViewMode,
  sortBy,
  onChangeSortBy,
  isMobileSim = false,
}) => {
  return (
    <div
      className={`w-full gap-2.5 ${
        isMobileSim
          ? 'flex flex-col items-stretch'
          : 'flex flex-col lg:flex-row items-stretch lg:items-center justify-between'
      }`}
    >
      {/* LINHA 1 NO MOBILE (Linha única exclusiva para a busca) */}
      <div className={`relative w-full ${isMobileSim ? '' : 'lg:flex-1'}`}>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder="Pesquisar por título, domínio ou tags..."
          className="w-full pl-10 pr-10 py-2.5 min-h-[44px] bg-[#121824] hover:bg-[#141C2B] focus:bg-[#151D2C] border border-[#1E2638] focus:border-emerald-500/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-150"
        />
        {query && (
          <button
            onClick={() => onChangeQuery('')}
            className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-slate-400 hover:text-slate-200"
            title="Limpar pesquisa"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* LINHA 2 NO MOBILE (Favoritos, Mais recentes e Grid/List ficam na linha de baixo) */}
      <div
        className={`w-full flex items-center justify-between gap-2 ${
          isMobileSim ? '' : 'lg:w-auto lg:justify-end shrink-0'
        }`}
      >
        {/* Item 1: Favoritos */}
        <button
          onClick={onToggleFavorites}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl text-xs font-medium border transition-colors shrink-0 ${
            onlyFavorites
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 font-semibold'
              : 'bg-[#121824] border-[#1E2638] text-slate-400 hover:text-slate-200 hover:bg-[#151D2C]'
          }`}
          title="Filtrar apenas favoritos"
        >
          <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span>Favoritos</span>
        </button>

        {/* Item 2: Mais recentes (Ordenação) */}
        <div className="relative flex-1 lg:flex-initial flex items-center bg-[#121824] border border-[#1E2638] rounded-xl px-2.5 py-1.5 min-h-[40px] text-xs text-slate-400 min-w-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value as any)}
            className="w-full bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer pr-1 truncate"
          >
            <option value="newest" className="bg-[#121824] text-slate-200">Mais recentes</option>
            <option value="oldest" className="bg-[#121824] text-slate-200">Mais antigos</option>
            <option value="alphabetical" className="bg-[#121824] text-slate-200">Título (A-Z)</option>
            <option value="domain" className="bg-[#121824] text-slate-200">Por Domínio</option>
          </select>
        </div>

        {/* Item 3: Botões Grid or List */}
        <div className="flex items-center bg-[#121824] border border-[#1E2638] rounded-xl p-0.5 min-h-[40px] shrink-0">
          <button
            onClick={() => onChangeViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#1E2638] text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Visualização em Grade"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeViewMode('compact')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'compact'
                ? 'bg-[#1E2638] text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Visualização em Lista Compacta"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
