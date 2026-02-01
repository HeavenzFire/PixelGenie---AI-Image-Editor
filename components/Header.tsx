
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">PixelGenie</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Documentation</a>
          <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Gallery</a>
          <div className="h-4 w-px bg-slate-800 mx-2"></div>
          <button className="text-sm font-semibold bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full transition-colors text-slate-200">
            Sign In
          </button>
        </nav>
      </div>
    </header>
  );
};
