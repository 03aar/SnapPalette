import React, { useState } from 'react';
import { AnalysisResult, ColorToken, TypeStyle } from '../types';
import { Palette, Type, Ruler, Download, Copy, Check, ChevronRight } from './Icons';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onBack: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onBack }) => {
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState<'colors' | 'type' | 'spacing' | 'export'>('colors');

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'type', label: 'Typography', icon: Type },
    { id: 'spacing', label: 'Spacing', icon: Ruler },
    { id: 'export', label: 'Export', icon: Download },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-900 text-sm font-medium flex items-center gap-1">
                ← Back
            </button>
            <h2 className="font-bold text-slate-900">Analysis Results</h2>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-mono">
                {result.id.split('_')[1]}
            </span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                        ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                    `}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>
      </header>

      {/* Content Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Image */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center p-8">
            <div className="relative shadow-2xl rounded-xl overflow-hidden transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
                <img src={result.imageUrl} alt="Analyzed UI" className="max-w-full max-h-[80vh] object-contain block" />
            </div>
            
            {/* Zoom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-slate-200 rounded-full px-4 py-2 flex items-center gap-4 shadow-lg">
                <span className="text-xs font-medium text-slate-500">Zoom</span>
                <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1" 
                    value={zoom} 
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-32 accent-blue-600 h-1 bg-slate-200 rounded-full appearance-none"
                />
                <span className="text-xs font-mono w-8 text-right">{Math.round(zoom * 100)}%</span>
            </div>
        </div>

        {/* Right: Panels */}
        <div className="w-[450px] bg-white border-l border-slate-200 overflow-y-auto">
            {activeTab === 'colors' && <ColorPanel result={result} />}
            {activeTab === 'type' && <TypographyPanel result={result} />}
            {activeTab === 'spacing' && <SpacingPanel result={result} />}
            {activeTab === 'export' && <ExportPanel result={result} />}
        </div>
      </div>
    </div>
  );
};

/* --- Sub-Panels --- */

const ColorSwatch: React.FC<{ color: ColorToken }> = ({ color }) => {
  const [copied, setCopied] = useState(false);

  const copyHex = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer" onClick={copyHex}>
        <div 
            className="w-12 h-12 rounded-lg shadow-inner border border-black/5" 
            style={{ backgroundColor: color.hex }}
        />
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium text-slate-900">{color.hex}</span>
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />}
            </div>
            <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500 capitalize">{color.role}</span>
                <span className="text-xs text-slate-300">{(color.usage * 100).toFixed(0)}%</span>
            </div>
        </div>
    </div>
  );
};

const ColorPanel: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="p-6 space-y-8">
    <section>
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Primary Palette</h3>
        <div className="grid grid-cols-1 gap-2">
            {result.colors.primary.map((c, i) => <ColorSwatch key={i} color={c} />)}
        </div>
    </section>
    <section>
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Extended Palette</h3>
        <div className="grid grid-cols-2 gap-2">
            {result.colors.extended.map((c, i) => <ColorSwatch key={i} color={c} />)}
        </div>
    </section>
  </div>
);

const TypeStyleRow: React.FC<{ style: TypeStyle }> = ({ style }) => (
    <div className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group">
        <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{style.label}</span>
            <div className="text-xs text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                {style.fontFamilyGuess} • {style.fontWeight}
            </div>
        </div>
        <p 
            className="text-slate-900 mb-4 line-clamp-1 overflow-hidden"
            style={{ 
                fontFamily: style.fontFamilyGuess, // Might not load if not on system, but falls back
                fontSize: `${Math.min(style.fontSizePx, 32)}px`, // Cap preview size
                fontWeight: style.fontWeight,
                lineHeight: `${style.lineHeightPx}px`,
                letterSpacing: `${style.letterSpacingPx}px`
            }}
        >
            The quick brown fox
        </p>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-50 text-xs text-slate-500 font-mono">
            <div>
                <span className="block text-slate-300 mb-0.5">Size</span>
                {style.fontSizePx}px
            </div>
            <div>
                <span className="block text-slate-300 mb-0.5">Line Height</span>
                {style.lineHeightPx}px
            </div>
            <div>
                <span className="block text-slate-300 mb-0.5">Tracking</span>
                {style.letterSpacingPx}px
            </div>
        </div>
    </div>
);

const TypographyPanel: React.FC<{ result: AnalysisResult }> = ({ result }) => (
    <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Detected Styles</h3>
            <span className="text-xs text-slate-400">{result.typography.length} styles found</span>
        </div>
        {result.typography.map((s, i) => <TypeStyleRow key={i} style={s} />)}
    </div>
);

const SpacingPanel: React.FC<{ result: AnalysisResult }> = ({ result }) => (
    <div className="p-6 space-y-8">
        <section>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">Spacing Scale</h3>
            <div className="space-y-3">
                {result.spacing.scale.map((val) => (
                    <div key={val} className="flex items-center gap-4 group">
                        <div className="w-8 text-xs font-mono text-slate-400 text-right">{val}</div>
                        <div className="flex-1 flex items-center">
                            <div 
                                className="h-6 bg-pink-500/20 border border-pink-500/50 rounded flex items-center justify-center text-[10px] text-pink-700 font-medium"
                                style={{ width: Math.min(val * 4, 280) }} 
                            >
                                {val >= 12 && `${val}px`}
                            </div>
                        </div>
                        <span className="text-xs text-slate-300 opacity-0 group-hover:opacity-100">space-{val/4}</span>
                    </div>
                ))}
            </div>
        </section>

        <div className="bg-slate-50 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Inference</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
                Based on the analysis, this design seems to follow a <strong>{result.spacing.baseUnit}px</strong> baseline grid. 
                The most common vertical rhythm is {result.spacing.scale[2] || 16}px.
            </p>
        </div>
    </div>
);

const CodeBlock: React.FC<{ label: string, code: string }> = ({ label, code }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-600">{label}</span>
                <button onClick={handleCopy} className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1">
                    {copied ? 'Copied!' : 'Copy Snippet'}
                </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[10px] font-mono overflow-x-auto border border-slate-800">
                {code}
            </pre>
        </div>
    );
};

const ExportPanel: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    // Generate CSS Variables
    const cssVars = `:root {
  /* Colors */
${result.colors.primary.map(c => `  --color-${c.role}: ${c.hex};`).join('\n')}
${result.colors.extended.map((c, i) => `  --color-ext-${i + 1}: ${c.hex};`).join('\n')}

  /* Spacing */
${result.spacing.scale.map(s => `  --space-${s}: ${s}px;`).join('\n')}
}`;

    // Generate Tailwind Config
    const tailwindConfig = `module.exports = {
  theme: {
    extend: {
      colors: {
        ${result.colors.primary.map(c => `${c.role}: '${c.hex}',`).join('\n        ')}
      },
      fontSize: {
        ${result.typography.map(t => `'${t.label.toLowerCase()}': ['${t.fontSizePx}px', { lineHeight: '${t.lineHeightPx}px', letterSpacing: '${t.letterSpacingPx}px' }],`).join('\n        ')}
      },
      spacing: {
        ${result.spacing.scale.map(s => `'${s}': '${s}px',`).join('\n        ')}
      }
    }
  }
}`;

    const downloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `snap_palette_${result.id}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="p-6 pb-20">
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Download JSON</h4>
                    <p className="text-xs text-blue-700 mb-3">Full raw data including usage stats and metadata.</p>
                    <button onClick={downloadJson} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                        Download .json
                    </button>
                </div>
             </div>

             <CodeBlock label="CSS Custom Properties" code={cssVars} />
             <CodeBlock label="Tailwind Config (preview)" code={tailwindConfig} />
        </div>
    );
};

export default AnalysisResults;