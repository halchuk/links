import React from 'react';
import { Tag as TagIcon, X } from 'lucide-react';
import { TagCount } from '../types';

interface TagFilterBarProps {
  availableTags: TagCount[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({
  availableTags,
  selectedTags,
  onToggleTag,
  onClearTags,
}) => {
  if (availableTags.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
      <div className="flex items-center gap-1 text-slate-500 shrink-0 text-xs font-mono pr-1">
        <TagIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tags:</span>
      </div>

      {availableTags.slice(0, 18).map(({ name, count }) => {
        const isSelected = selectedTags.includes(name);

        return (
          <button
            key={name}
            onClick={() => onToggleTag(name)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] rounded-lg font-mono text-[11px] shrink-0 transition-all duration-150 active:scale-[0.97] ${
              isSelected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs font-semibold'
                : 'bg-[#121824] hover:bg-[#161F2E] active:bg-[#182334] text-slate-400 hover:text-slate-200 border border-[#1E2638]'
            }`}
          >
            <span>#{name}</span>
            <span className="text-[10px] text-slate-500 opacity-80">{count}</span>
          </button>
        );
      })}

      {selectedTags.length > 0 && (
        <button
          onClick={onClearTags}
          className="flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-xs shrink-0 transition-colors"
          title="Remover filtro de tags"
        >
          <X className="w-3 h-3" />
          <span className="text-[11px] font-medium">Limpar ({selectedTags.length})</span>
        </button>
      )}
    </div>
  );
};
