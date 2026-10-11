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
  Sparkles, 
  Loader2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { renderKrokiDiagram, getLldDiagramForProblem, DiagramType } from '../lib/kroki';

interface KrokiDiagramViewerProps {
  slugOrTitle: string;
  category?: string;
}

export const KrokiDiagramViewer: React.FC<KrokiDiagramViewerProps> = ({
  slugOrTitle,
  category
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

  const containerRef = useRef<HTMLDivElement>(null);

  // Re-fetch or re-initialize on problem change
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
      setRenderError('Could not connect to SDETube Diagram engine.');
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
    <div className="flex-1 flex flex-col h-full bg-slate-900/90 text-slate-100 overflow-hidden font-sans">
      
      {/* Top Header / Action Toolbar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        
        {/* Title & Type Badge */}
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">
              {initialTemplate.title}
            </h4>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                SDETube Unified UML
              </span>
              <span>{diagramType.toUpperCase()} Engine</span>
            </div>
          </div>
        </div>

        {/* View Toggles & Zoom Controls */}
        <div className="flex items-center space-x-1.5">
          
          {/* Visual vs Code Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>PlantUML</span>
            </button>
          </div>

          {/* Zoom controls (Only when viewing diagram) */}
          {activeTab === 'visual' && (
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 font-mono text-[11px] text-slate-400 min-w-[36px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Download SVG */}
          <button
            onClick={handleDownloadSvg}
            disabled={!svgContent}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            title="Download Vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Copy PlantUML Code */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Copy PlantUML Source"
          >
            {hasCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === 'visual' ? (
          <div 
            ref={containerRef}
            className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/90 custom-scrollbar relative select-text"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-16 text-slate-400">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs font-mono">Rendering high-resolution UML with SDETube engine...</p>
              </div>
            ) : renderError ? (
              <div className="max-w-md p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start space-x-3 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-rose-200">Diagram Render Notice</h5>
                  <p className="mt-1 text-slate-300">{renderError}</p>
                  <button
                    onClick={() => fetchDiagramSvg(markupCode, diagramType)}
                    className="mt-3 px-3 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry Render</span>
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
              <span className="font-mono text-[11px]">Edit PlantUML source code in real time:</span>
              <button
                onClick={() => {
                  fetchDiagramSvg(markupCode, diagramType);
                  setActiveTab('visual');
                }}
                className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
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

    </div>
  );
};
