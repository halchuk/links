import React, { useState } from 'react';
import { Category, LinkItem } from '../types';
import { exportService } from '../services/exporter';
import { X, Download, FileJson, FileSpreadsheet, Copy, Check, Upload, Eye, EyeOff } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: LinkItem[];
  categories: Category[];
  onImportSuccess: (importedCount: number, importedLinks: LinkItem[]) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  links,
  categories,
  onImportSuccess,
  onShowToast,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'csv' | null>(null);
  const [previewMode, setPreviewMode] = useState<'none' | 'json' | 'csv'>('none');
  const [importJsonText, setImportJsonText] = useState('');
  const [importTab, setImportTab] = useState<'export' | 'import'>('export');

  if (!isOpen) return null;

  const handleDownloadJson = () => {
    exportService.downloadJson(links, categories);
    onShowToast(`Exportado ${links.length} links em formato JSON com sucesso!`, 'success');
  };

  const handleDownloadCsv = () => {
    exportService.downloadCsv(links, categories);
    onShowToast(`Exportado ${links.length} links em formato CSV com sucesso!`, 'success');
  };

  const handleCopy = (format: 'json' | 'csv') => {
    const data = format === 'json'
      ? exportService.generateJsonData(links, categories)
      : exportService.generateCsvData(links, categories);

    navigator.clipboard.writeText(data);
    setCopiedFormat(format);
    onShowToast(`Dados em ${format.toUpperCase()} copiados para a área de transferência!`, 'success');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleExecuteImport = () => {
    if (!importJsonText.trim()) {
      onShowToast('Insira o conteúdo JSON antes de importar.', 'error');
      return;
    }
    try {
      const { importedCount, links: importedLinks } = exportService.importFromJson(importJsonText);
      if (importedCount === 0) {
        onShowToast('Nenhum link válido encontrado no JSON fornecido.', 'error');
        return;
      }
      onImportSuccess(importedCount, importedLinks);
      onShowToast(`Sucesso! ${importedCount} links importados.`, 'success');
      setImportJsonText('');
      onClose();
    } catch {
      onShowToast('Erro ao processar JSON. Verifique a formatação do arquivo.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#121824] border-t sm:border border-[#1E2638] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1E2638]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Exportação & Backup</h2>
              <p className="text-xs text-slate-400">Exportar links e tags</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#1C2538] rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center px-5 pt-3 gap-2 border-b border-[#1E2638]/70">
          <button
            onClick={() => setImportTab('export')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              importTab === 'export'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Exportar Links ({links.length})
          </button>
          <button
            onClick={() => setImportTab('import')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              importTab === 'import'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Restaurar / Importar JSON
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">
          {importTab === 'export' ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#0C111C] border border-[#1E2638] rounded-xl text-center">
                <div>
                  <span className="block text-xl font-bold font-mono text-emerald-400">{links.length}</span>
                  <span className="text-[11px] text-slate-400">Total de Links</span>
                </div>
                <div>
                  <span className="block text-xl font-bold font-mono text-cyan-400">{categories.length}</span>
                  <span className="text-[11px] text-slate-400">Categorias</span>
                </div>
                <div>
                  <span className="block text-xl font-bold font-mono text-amber-400">
                    {links.filter((l) => l.isFavorite).length}
                  </span>
                  <span className="text-[11px] text-slate-400">Favoritos</span>
                </div>
              </div>

              {/* Format Option 1: JSON */}
              <div className="p-4 bg-[#0C111C] border border-[#1E2638] rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#151D2C] border border-[#232F46] rounded-xl text-emerald-400">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Formato JSON</h4>
                      <p className="text-xs text-slate-400">
                        Estrutura completa com arrays de tags, metadados OpenGraph, timestamps e categorias.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar linkkeeper.json</span>
                  </button>
                  <button
                    onClick={() => handleCopy('json')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#161F30] hover:bg-[#1C273C] border border-[#222F46] text-slate-300 hover:text-white text-xs rounded-xl transition-colors"
                  >
                    {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar JSON</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode(previewMode === 'json' ? 'none' : 'json')}
                    className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                  >
                    {previewMode === 'json' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{previewMode === 'json' ? 'Ocultar Prévia' : 'Ver Prévia'}</span>
                  </button>
                </div>

                {previewMode === 'json' && (
                  <pre className="p-3 bg-[#080B12] border border-[#1E2638] rounded-lg text-[11px] text-slate-300 font-mono max-h-48 overflow-y-auto leading-relaxed">
                    {exportService.generateJsonData(links.slice(0, 3), categories)}
                  </pre>
                )}
              </div>

              {/* Format Option 2: CSV */}
              <div className="p-4 bg-[#0C111C] border border-[#1E2638] rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#151D2C] border border-[#232F46] rounded-xl text-cyan-400">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Formato CSV (Planilhas & Notion)</h4>
                      <p className="text-xs text-slate-400">
                        Compatível com Excel, Google Sheets, Notion e Obsidian com colunas estruturadas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar linkkeeper.csv</span>
                  </button>
                  <button
                    onClick={() => handleCopy('csv')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#161F30] hover:bg-[#1C273C] border border-[#222F46] text-slate-300 hover:text-white text-xs rounded-xl transition-colors"
                  >
                    {copiedFormat === 'csv' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar CSV</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode(previewMode === 'csv' ? 'none' : 'csv')}
                    className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                  >
                    {previewMode === 'csv' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{previewMode === 'csv' ? 'Ocultar Prévia' : 'Ver Prévia'}</span>
                  </button>
                </div>

                {previewMode === 'csv' && (
                  <pre className="p-3 bg-[#080B12] border border-[#1E2638] rounded-lg text-[11px] text-slate-300 font-mono max-h-48 overflow-y-auto leading-relaxed">
                    {exportService.generateCsvData(links.slice(0, 3), categories)}
                  </pre>
                )}
              </div>
            </>
          ) : (
            /* Import JSON Tab */
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Cole o conteúdo de um arquivo exportado anteriormente para mesclar com a sua lista atual de links.
              </p>
              <textarea
                rows={8}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Cole o JSON aqui (ex: { "links": [ ... ] } ou [ ... ])'
                className="w-full p-3.5 bg-[#0C111C] border border-[#1E2638] focus:border-emerald-500/70 rounded-xl text-xs text-slate-200 font-mono placeholder-slate-600 outline-none resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importar Links</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
