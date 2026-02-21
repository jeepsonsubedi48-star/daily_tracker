import React from 'react';
import { Task } from '../types';

interface AlarmOverlayProps {
    task: Task | null;
    onStop: () => void;
}

const AlarmOverlay: React.FC<AlarmOverlayProps> = ({ task, onStop }) => {
    if (!task) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            {/* Pulsing Circles Animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
                <div className="size-64 rounded-full bg-red-500/20 animate-ping absolute top-0 left-0" style={{ animationDuration: '2s' }}></div>
                <div className="size-64 rounded-full bg-red-500/20 animate-ping absolute top-0 left-0" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                <div className="size-64 rounded-full bg-red-500/10 animate-pulse absolute top-0 left-0"></div>
            </div>

            <div className="flex flex-col items-center text-center space-y-8 z-10 max-w-sm w-full">
                <div className="bg-white dark:bg-[#1a1f35] p-4 rounded-full shadow-2xl shadow-red-500/20 animate-bounce">
                    <span className="material-symbols-outlined text-6xl text-red-500">notifications_active</span>
                </div>

                <div className="space-y-2">
                    <h2 className="text-white text-3xl font-black tracking-tight uppercase">Time's Up!</h2>
                    <p className="text-slate-300 text-lg font-medium">It's time for:</p>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm mt-2">
                        <p className="text-2xl font-bold text-white">{task.title}</p>
                        <p className="text-red-400 font-bold uppercase text-sm tracking-wider mt-1">{task.category}</p>
                    </div>
                </div>

                <button 
                    onClick={onStop}
                    className="w-full bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-xl py-5 rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3 group"
                >
                    <span className="material-symbols-outlined text-3xl group-hover:animate-spin">stop_circle</span>
                    Stop Alarm
                </button>
            </div>
        </div>
    );
};

export default AlarmOverlay;