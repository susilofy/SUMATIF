import React from 'react';
import { School, BookOpen, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, isAdminLoggedIn }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo & School info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-800 text-sm sm:text-base leading-tight tracking-tight">
                SD NEGERI 3 LOLOAN TIMUR
              </h1>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                CBT Sumatif
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Matematika • Kelas V
              </span>
              <span>•</span>
              <span className="truncate max-w-[150px] sm:max-w-none">Tes Kemampuan Akademik</span>
            </div>
          </div>
        </div>

        {/* Right action */}
        <div className="flex items-center gap-2">
          <button
            id="btn-header-admin"
            onClick={onOpenAdmin}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs border ${
              isAdminLoggedIn
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Masuk ke Panel Guru / Administrator"
          >
            <ShieldCheck className="w-4 h-4 text-current" />
            <span className="hidden sm:inline">
              {isAdminLoggedIn ? 'Panel Guru (Aktif)' : 'Panel Guru'}
            </span>
            <span className="sm:hidden">Guru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
