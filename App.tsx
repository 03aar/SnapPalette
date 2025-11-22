import React, { useState, useEffect } from 'react';
import UploadView from './components/UploadView';
import AnalysisResults from './components/AnalysisResults';
import { AnalysisResult, AnalysisState } from './types';
import { analyzeScreenshot } from './services/geminiService';
import { Trash2, ChevronRight } from './components/Icons';

const STORAGE_KEY = 'snapPalette_history';

export default function App() {
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    currentResult: null,
    history: [],
    errorMsg: undefined
  });

  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState(prev => ({ ...prev, history: JSON.parse(saved) }));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    setState(prev => ({ ...prev, status: 'analyzing', errorMsg: undefined }));
    
    try {
      const result = await analyzeScreenshot(file);
      
      setState(prev => {
        const newHistory = [result, ...prev.history].slice(0, 10); // Keep last 10
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        return {
          ...prev,
          status: 'complete',
          currentResult: result,
          history: newHistory
        };
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMsg: err.message || "Failed to analyze image. Please try again."
      }));
    }
  };

  const loadFromHistory = (result: AnalysisResult) => {
    setState(prev => ({ ...prev, status: 'complete', currentResult: result }));
    setShowHistory(false);
  };

  const clearHistory = () => {
      localStorage.removeItem(STORAGE_KEY);
      setState(prev => ({ ...prev, history: [] }));
  }

  // --- Renders ---

  if (state.status === 'complete' && state.currentResult) {
    return (
      <AnalysisResults 
        result={state.currentResult} 
        onBack={() => setState(prev => ({ ...prev, status: 'idle' }))} 
      />
    );
  }

  return (
    <div className="relative">
       {/* History Toggle */}
       {state.history.length > 0 && (
           <button 
            onClick={() => setShowHistory(true)}
            className="fixed top-6 right-6 z-10 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
           >
            History ({state.history.length})
           </button>
       )}

       {/* Main View */}
       <UploadView 
         onFileSelect={handleFileSelect} 
         isAnalyzing={state.status === 'analyzing'}
       />
       
       {state.status === 'error' && (
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-bounce">
           Error: {state.errorMsg}
         </div>
       )}

       {/* History Sidebar Overlay */}
       {showHistory && (
         <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
            <div className="relative w-80 bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-bold text-slate-900">Recent Scans</h2>
                    <button onClick={clearHistory} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {state.history.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => loadFromHistory(item)}
                            className="group cursor-pointer border border-slate-100 rounded-xl p-3 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <div className="h-24 bg-slate-100 rounded-lg mb-3 overflow-hidden relative">
                                <img src={item.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-mono text-slate-400 mb-1">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-1">
                                        {item.colors.primary.slice(0, 3).map((c, i) => (
                                            <div key={i} className="w-3 h-3 rounded-full" style={{backgroundColor: c.hex}} />
                                        ))}
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>
       )}
    </div>
  );
}
