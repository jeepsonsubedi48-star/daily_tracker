import React from 'react';
import { NavTab } from '../types';

interface BottomNavProps {
    activeTab: NavTab;
    onTabChange: (tab: NavTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: NavTab.TODAY, icon: 'home', label: 'Today' },
        { id: NavTab.STATS, icon: 'leaderboard', label: 'Stats' },
        { id: NavTab.PROFILE, icon: 'person', label: 'Profile' },
    ];

    return (
        <div className="absolute bottom-0 w-full z-20 pointer-events-none px-0 pb-0">
             {/* Gradient fade at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none" />

            <nav className="relative bg-white/80 dark:bg-[#151926]/85 backdrop-blur-xl border-t border-white/20 dark:border-white/5 shadow-glass dark:shadow-glass-dark px-10 py-3 flex justify-between items-center pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button 
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className="flex flex-col items-center gap-1 cursor-pointer group relative p-2"
                        >
                            <div className={`transition-all duration-300 transform ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:scale-105'}`}>
                                <span className={`material-symbols-outlined text-[26px] transition-colors duration-300 ${isActive ? 'text-primary drop-shadow-sm font-semibold fill-1' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                                    {item.icon}
                                </span>
                            </div>
                            <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'text-primary opacity-100 translate-y-0' : 'text-slate-400 opacity-0 -translate-y-2 h-0 overflow-hidden group-hover:opacity-70 group-hover:h-auto group-hover:translate-y-0'}`}>
                                {item.label}
                            </span>
                            
                            {/* Active Indicator Dot */}
                            {isActive && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;