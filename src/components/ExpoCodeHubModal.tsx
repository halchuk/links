import React, { useState } from 'react';
import { EXPO_FILES, SUPER_PROMPT, ExpoFile } from '../data/expoBlueprint';
import { X, Copy, Check, FileCode2, Sparkles, Terminal, Download } from 'lucide-react';

interface ExpoCodeHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const ExpoCodeHubModal: React.FC<ExpoCodeHubModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<ExpoFile>(EXPO_FILES[0]);
  const [activeTab, setActiveTab] = useState<'code' | 'prompt'>('prompt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCurrent = () => {
    const textToCopy = activeTab === 'prompt' ? SUPER_PROMPT : selectedFile.code;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    onShowToast(
      activeTab === 'prompt'
        ? 'Super Prompt copiado com sucesso!'
        : `${selectedFile.name} copiado para a área de transferência!`,
      'success'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFullProject = () => {
    const fullBundle = {
      project: 'LinkKeeper Expo & React Native',
      superPrompt: SUPER_PROMPT,
      files: EXPO_FILES.map((f) => ({
        path: f.path,
        description: f.description,
        content: f.code,
      })),
    };
    const blob = new Blob([JSON.stringify(fullBundle, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'linkkeeper-expo-project-blueprint.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Blueprint completo baixado com sucesso!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#101622] border-t sm:border border-[#1E2638] rounded-t-3xl sm:rounded-2xl w-full max-w-4xl h-[92vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#1E2638] bg-[#0D121D]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Expo & React Native Hub</h3>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  SDK 52
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Código nativo pronto para Expo Router + NativeWind + SQLite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFullProject}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#172030] hover:bg-[#1E293D] border border-[#232F46] text-xs font-semibold text-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Baixar pacote completo"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Baixar Blueprint</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1A2234] rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex items-center px-5 pt-3 gap-2 border-b border-[#1E2638] bg-[#0E131E]">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'prompt'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>O Super Prompt Definitivo</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'code'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Arquivos do App React Native ({EXPO_FILES.length})</span>
          </button>
        </div>

        {/* Main Body */}
        {activeTab === 'prompt' ? (
          <div className="flex-1 flex flex-col p-5 overflow-hidden bg-[#0A0E17]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2638]">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Prompt Mestre para Geração do App Nativo
                </h4>
                <p className="text-xs text-slate-400">
                  Formulado para responder perfeitamente à sua solicitação com TypeScript, NativeWind, SQLite e busca instantânea.
                </p>
              </div>
              <button
                onClick={handleCopyCurrent}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Super Prompt'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl bg-[#080B12] border border-[#1E2638] p-4 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/20">
              {SUPER_PROMPT}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0A0E17]">
            {/* Sidebar with files */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#1E2638] bg-[#0C111C] p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider hidden md:block">
                Estrutura do Projeto
              </span>
              {EXPO_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs font-mono transition-colors shrink-0 md:w-full ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151D2C] border border-transparent'
                    }`}
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{file.language}</span>
                  </button>
                );
              })}
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden p-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2638]">
                <div className="min-w-0 pr-3">
                  <span className="text-xs font-mono font-bold text-emerald-400 truncate block">
                    {selectedFile.path}
                  </span>
                  <p className="text-[11px] text-slate-400 truncate">{selectedFile.description}</p>
                </div>
                <button
                  onClick={handleCopyCurrent}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#172030] hover:bg-[#1E293D] border border-[#232F46] text-xs font-semibold text-slate-200 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Arquivo'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-auto rounded-xl bg-[#080B12] border border-[#1E2638] p-4">
                <pre className="text-xs font-mono text-slate-200 leading-relaxed selection:bg-emerald-500/20">
                  <code>{selectedFile.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
