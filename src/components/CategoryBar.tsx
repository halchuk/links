import React, { useState } from 'react';
import { Category } from '../types';
import { Plus, Check, X } from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onAddCategory: (name: string) => void;
  categoryCounts: Record<string, number>;
  totalLinksCount: number;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  categoryCounts,
  totalLinksCount,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
    setIsAdding(false);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
      {/* "Todos" Option */}
      <button
        onClick={() => onSelectCategory('all')}
        className={`flex items-center gap-2 px-3.5 py-2 min-h-[38px] rounded-xl font-medium shrink-0 transition-all duration-150 active:scale-[0.98] ${
          selectedCategoryId === 'all'
            ? 'bg-emerald-500/15 border border-emerald-500/50 text-emerald-400 font-semibold shadow-xs'
            : 'bg-[#121824] hover:bg-[#151D2C] active:bg-[#182232] border border-[#1E2638] text-slate-400 hover:text-slate-200'
        }`}
      >
        <span>Todos</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-md ${
            selectedCategoryId === 'all' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-[#1E2638] text-slate-400'
          }`}
        >
          {totalLinksCount}
        </span>
      </button>

      {/* Individual Categories */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        const count = categoryCounts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 min-h-[38px] rounded-xl font-medium shrink-0 transition-all duration-150 active:scale-[0.98] ${
              isSelected
                ? 'bg-emerald-500/15 border border-emerald-500/50 text-emerald-400 font-semibold shadow-xs'
                : 'bg-[#121824] hover:bg-[#151D2C] active:bg-[#182232] border border-[#1E2638] text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                isSelected ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-[#1E2638] text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}

      {/* Quick Add Category inline */}
      {isAdding ? (
        <form onSubmit={handleCreate} className="flex items-center gap-1 shrink-0">
          <input
            type="text"
            autoFocus
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nome da categoria..."
            className="px-3 py-1.5 min-h-[38px] bg-[#151D2C] border border-emerald-500/50 rounded-xl text-xs text-white placeholder-slate-500 outline-none w-36"
          />
          <button
            type="submit"
            className="w-9 h-9 flex items-center justify-center bg-emerald-500 text-slate-900 rounded-xl hover:bg-emerald-400 transition-colors shrink-0"
            title="Salvar Categoria"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-200 shrink-0"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl border border-dashed border-[#243048] hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs shrink-0 transition-colors active:scale-[0.98]"
          title="Criar nova categoria"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova</span>
        </button>
      )}
    </div>
  );
};
