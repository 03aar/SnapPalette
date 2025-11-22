import React, { useCallback, useState } from 'react';
import { UploadCloud, Loader2, ImageIcon } from './Icons';

interface UploadViewProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const UploadView: React.FC<UploadViewProps> = ({ onFileSelect, isAnalyzing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-5xl font-bold text-slate-900 tracking-tight mb-6">
          Turn any screenshot into a <span className="text-blue-600">design system</span>.
        </h1>
        <p className="text-xl text-slate-500 leading-relaxed">
          Instantly extract colors, typography styles, and spacing tokens from UI images. 
          Perfect for reverse-engineering and creating Figma libraries.
        </p>
      </div>

      <div 
        className={`
          w-full max-w-2xl aspect-video border-2 border-dashed rounded-3xl flex flex-col items-center justify-center
          transition-all duration-300 cursor-pointer relative overflow-hidden bg-white
          ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 hover:border-slate-400 hover:shadow-xl'}
          ${isAnalyzing ? 'pointer-events-none opacity-90' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input 
          type="file" 
          id="fileInput"
          className="hidden" 
          accept="image/png, image/jpeg, image/webp"
          onChange={handleInputChange}
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-medium text-slate-700">Analyzing pixels...</h3>
            <p className="text-slate-400 mt-2">Extracting tokens via AI engine</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Click or drag image to upload</h3>
            <p className="text-slate-400">Supports PNG, JPG, WebP up to 10MB</p>
            
            {/* Decorative UI elements to make it look like a tool */}
            <div className="absolute bottom-8 flex gap-4 opacity-50 pointer-events-none">
               <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div> Palette
               </div>
               <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Typography
               </div>
               <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Spacing
               </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full text-center">
        <Step number="1" title="Upload" description="Drop a screenshot of any website or app." />
        <Step number="2" title="Analyze" description="AI identifies colors, fonts, and spacing." />
        <Step number="3" title="Export" description="Get CSS, Tailwind, or JSON tokens." />
      </div>
    </div>
  );
};

const Step = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="flex flex-col items-center">
    <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center mb-3 text-sm">
      {number}
    </span>
    <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
    <p className="text-sm text-slate-500">{description}</p>
  </div>
);

export default UploadView;