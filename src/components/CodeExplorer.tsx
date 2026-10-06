import React, { useState } from 'react';
import { DJANGO_PROJECT_FILES } from '../django-project/project-files';
import { DjangoFile } from '../types/sports-ml';
import { downloadDjangoProjectZip } from '../django-project/zip-generator';
import { FileCode, Download, Copy, Check, Folder, ChevronRight } from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<DjangoFile>(DJANGO_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const categories = [
    { id: 'core', label: 'Django Core & Settings' },
    { id: 'models', label: 'ORM Database Models' },
    { id: 'serializers', label: 'DRF Serializers' },
    { id: 'views', label: 'DRF API Views & Routers' },
    { id: 'ml', label: 'Scikit-Learn ML Engine' },
    { id: 'config', label: 'Configuration & Docs' },
    { id: 'deploy', label: 'Docker & Deployment' },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadDjangoProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Production Code Repository</span>
              <span aria-hidden="true">·</span>
              <span>Python 3.11+ / Django 5.0+</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-emerald-400">{DJANGO_PROJECT_FILES.length} Files Ready</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Django REST Framework Project Architecture
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect the clean architecture, ORM schema definitions, DRF serializers, Scikit-Learn training pipelines, and Docker deployment configs.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Creating ZIP...' : 'Download Project ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Grid: File Explorer Sidebar (4 cols) and Code Viewer (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Tree (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
              Project Structure Tree
            </span>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const files = DJANGO_PROJECT_FILES.filter(f => f.category === cat.id);
                if (files.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium py-1">
                      <Folder className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cat.label}</span>
                    </div>

                    <div className="pl-3 space-y-1 border-l border-slate-800">
                      {files.map((file) => {
                        const isSelected = selectedFile.path === file.path;
                        return (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-slate-800 text-emerald-400 font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            }`}
                          >
                            <span className="truncate">{file.name}</span>
                            <ChevronRight className="w-3 h-3 shrink-0 opacity-40" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Code Content & Details (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            {/* File Path & Copy Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-sm font-semibold text-white">
                    {selectedFile.path}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedFile.description}
                </p>
              </div>

              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="relative">
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[580px] leading-relaxed select-text">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
