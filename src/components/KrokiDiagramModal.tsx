import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Code, 
  Eye, 
  X, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { renderKrokiDiagram, getLldDiagramForProblem, DiagramType } from '../lib/kroki';

interface KrokiDiagramModalProps {
  slugOrTitle: string;
  category?: string;
  onClose: () => void;
}

export const KrokiDiagramModal: React.FC<KrokiDiagramModalProps> = ({
  slugOrTitle,
  category,
  onClose
}) => {
  const initialTemplate = getLldDiagramForProblem(slugOrTitle, category);
  const [markupCode, setMarkupCode] = useState<string>(initialTemplate.code);
  const [diagramType, setDiagramType] = useState<DiagramType>(initialTemplate.type);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [hasCopiedCode, setHasCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    const template = getLldDiagramForProblem(slugOrTitle, category);
    setMarkupCode(template.code);
    setDiagramType(template.type);
    fetchDiagramSvg(template.code, template.type);
  }, [slugOrTitle, category]);

  const fetchDiagramSvg = async (codeToRender: string, type: DiagramType) => {
    setIsLoading(true);
    setRenderError(null);
    try {
      const res = await renderKrokiDiagram(codeToRender, type);
      if (res.error) {
        setRenderError(res.error);
        setSvgContent(null);
      } else {
        setSvgContent(res.svg);
      }
    } catch (err: any) {
      setRenderError('Could not connect to Kroki Diagram engine.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(250, prev + 20));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(50, prev - 20));
  const handleResetZoom = () => setZoomLevel(100);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(markupCode);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slugOrTitle || 'lld-architecture'}-diagram.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20 shadow-2xl p-4 sm:p-6 flex flex-col h-[90vh] max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 flex-shrink-0">
          
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[10px] font-black uppercase tracking-wider font-mono">
                  Visual LLD Architecture
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Kroki PlantUML</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 truncate mt-0.5">
                {initialTemplate.title}
              </h3>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            
            {/* Visual vs Code Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  activeTab === 'visual'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visual Diagram</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>PlantUML Source</span>
              </button>
            </div>

            {/* Zoom Controls */}
            {activeTab === 'visual' && (
              <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 font-mono text-[11px] text-cyan-400 font-bold min-w-[40px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Reset Zoom (100%)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Download SVG */}
            <button
              onClick={handleDownloadSvg}
              disabled={!svgContent}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer disabled:opacity-40"
              title="Download Vector SVG"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Copy PlantUML Code */}
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer"
              title="Copy PlantUML Source"
            >
              {hasCopiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Content Body */}
        <div className="flex-1 my-3 flex flex-col min-h-0 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 relative">
          {activeTab === 'visual' ? (
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center custom-scrollbar select-text">
              {isLoading ? (
                <div className="m-auto flex flex-col items-center justify-center space-y-3 py-20 text-slate-400">
                  <Loader2 className="w-9 h-9 text-cyan-400 animate-spin" />
                  <p className="text-xs font-mono">Rendering high-resolution vector architecture...</p>
                </div>
              ) : renderError ? (
                <div className="m-auto max-w-md p-5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-rose-200">Diagram Render Notice</h5>
                    <p className="mt-1 text-slate-300">{renderError}</p>
                    <button
                      onClick={() => fetchDiagramSvg(markupCode, diagramType)}
                      className="mt-3 px-3 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  </div>
                </div>
              ) : svgContent ? (
                <div 
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`, 
                    transformOrigin: 'top center', 
                    transition: 'transform 0.15s ease-out' 
                  }}
                  className="w-auto max-w-full flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60 shadow-2xl [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:w-auto [&_svg]:block"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : null}
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4 bg-slate-950 space-y-3 overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px]">Edit PlantUML class and sequence definitions in real time:</span>
                <button
                  onClick={() => {
                    fetchDiagramSvg(markupCode, diagramType);
                    setActiveTab('visual');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-render Diagram</span>
                </button>
              </div>
              <textarea
                value={markupCode}
                onChange={(e) => setMarkupCode(e.target.value)}
                className="flex-1 w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500 resize-none custom-scrollbar"
                placeholder="@startuml ... @enduml"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500 flex-shrink-0 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Kroki Unified Vector Architecture Active (20p)</span>
          </span>
          <span className="hidden sm:inline">Use mouse scroll & zoom stepper for detailed inspection</span>
        </div>

      </div>
    </div>
  );
};
