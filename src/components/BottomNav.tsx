import React from 'react';
import {
  Home,
  Sparkles,
  Receipt,
  CreditCard,
  Rocket,
  Brain,
  StickyNote,
  CheckSquare,
  Calendar,
} from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Hoy', icon: Home },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'chat', label: 'JARVIS', icon: Sparkles, hero: true },
    { id: 'projects', label: 'Proyectos', icon: Rocket },
    { id: 'transactions', label: 'Dinero', icon: Receipt },
  ];

  return (
    <div className="fixed bottom-2 left-2 right-2 sm:bottom-4 z-40 max-w-md mx-auto pointer-events-none">
      <nav className="pointer-events-auto bg-[#0F172A]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.75)] px-3 py-1.5 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          if (item.hero) {
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className="group relative flex flex-col items-center justify-center -translate-y-2.5 px-2 focus:outline-none"
                id={`tab-nav-${item.id}`}
                aria-label={item.label}
              >
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white shadow-[0_4px_25px_rgba(37,99,235,0.7)] scale-105 ring-2 ring-blue-400/50'
                      : 'bg-gradient-to-tr from-slate-800 via-blue-950 to-slate-900 text-blue-300 border border-blue-500/50 hover:scale-105 shadow-lg'
                  }`}
                >
                  <Icon className="w-6 h-6 animate-pulse-slow text-white" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-wider uppercase transition-colors ${
                    isActive ? 'text-blue-300' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              id={`tab-nav-${item.id}`}
              aria-label={item.label}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-blue-600/20 text-blue-400 shadow-sm' : 'hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span
                className={`text-[11px] tracking-tight whitespace-nowrap transition-colors ${
                  isActive ? 'font-bold text-white' : 'font-medium text-slate-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-0.5 animate-fade-in shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
