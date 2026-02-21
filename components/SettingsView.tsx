import React, { useState, useRef } from 'react';
import { Task, DailyReport } from '../types';
import { RINGTONE_PRESETS } from '../constants';

interface SettingsViewProps {
    tasks: Task[];
    onClose: () => void;
    onAddTask: (task: Omit<Task, 'id'>) => void;
    onRemoveTask: (id: string) => void;
    onClearCompleted: () => void;
    onClearAllTasks: () => void;
    onResetTasks: () => void;
    currentTheme: 'light' | 'dark' | 'system';
    onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
    customRingtone: string | null;
    onRingtoneChange: (ringtone: string | null) => void;
    activeRingtoneId: string;
    onActiveRingtoneChange: (id: string) => void;
    onPreviewSound: (id: string) => void;
    vibrationEnabled: boolean;
    onVibrationChange: (enabled: boolean) => void;
    categories: string[];
    onAddCategory: (category: string) => void;
    onRemoveCategory: (category: string) => void;
    onEditCategory: (oldName: string, newName: string) => void;
    categoryColors: Record<string, string>;
    onUpdateCategoryColor: (category: string, newColor: string) => void;
    onGenerateReport: () => void;
    isGeneratingReport: boolean;
    reports: DailyReport[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    tasks, onClose, onAddTask, onRemoveTask, onClearCompleted, onClearAllTasks, onResetTasks,
    currentTheme, onThemeChange, 
    customRingtone, onRingtoneChange,
    activeRingtoneId, onActiveRingtoneChange, onPreviewSound,
    vibrationEnabled, onVibrationChange,
    categories, onAddCategory, onRemoveCategory, onEditCategory,
    categoryColors, onUpdateCategoryColor,
    onGenerateReport, isGeneratingReport, reports
}) => {
    const [isRingtoneSelectorOpen, setIsRingtoneSelectorOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Form state
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTimeVal, setNewTaskTimeVal] = useState('');
    const [newTaskAmpm, setNewTaskAmpm] = useState('AM');
    const [newTaskCategory, setNewTaskCategory] = useState<string>('Study');
    const [hasAlarm, setHasAlarm] = useState(false);
    
    const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle || !newTaskTimeVal) return;
        
        let timeStr = newTaskTimeVal.trim();
        // Simple auto-formatting: 0930 -> 09:30
        if (/^\d{3,4}$/.test(timeStr)) {
             if (timeStr.length === 3) timeStr = timeStr.charAt(0) + ":" + timeStr.slice(1);
             else timeStr = timeStr.slice(0,2) + ":" + timeStr.slice(2);
        }

        const fullTime = `${timeStr} ${newTaskAmpm}`;
        
        onAddTask({
            title: newTaskTitle,
            time: fullTime,
            category: newTaskCategory,
            completed: false,
            hasAlarm: hasAlarm
        });

        if (newTaskCategory && !categories.includes(newTaskCategory)) {
            onAddCategory(newTaskCategory);
        }

        setNewTaskTitle('');
        setNewTaskTimeVal('');
        setHasAlarm(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onRingtoneChange(reader.result as string);
                onActiveRingtoneChange('custom');
                setIsRingtoneSelectorOpen(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const latestReport = reports[0];

    return (
        <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-background-dark flex flex-col animate-in slide-in-from-right duration-300">
            <header className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#1a1f35]/50 backdrop-blur-md sticky top-0 z-10">
                <button onClick={onClose} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex-1">Settings & Tools</h2>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 pb-24">
                
                {/* Theme Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">palette</span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => onThemeChange('light')} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${currentTheme === 'light' ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                            <div className="w-full aspect-[4/3] bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400">light_mode</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Light</span>
                        </button>
                        <button onClick={() => onThemeChange('dark')} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${currentTheme === 'dark' ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                            <div className="w-full aspect-[4/3] bg-[#1a1f35] rounded-lg shadow-sm border border-slate-700 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400">dark_mode</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Dark</span>
                        </button>
                        <button onClick={() => onThemeChange('system')} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${currentTheme === 'system' ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                            <div className="w-full aspect-[4/3] bg-gradient-to-br from-white to-[#1a1f35] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-500">settings_brightness</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">System</span>
                        </button>
                    </div>
                </section>

                {/* AI Report Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">smart_toy</span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily AI Scan</h3>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 size-32 bg-white/10 rounded-full blur-3xl"></div>
                        
                        {!latestReport && !isGeneratingReport && (
                            <div className="text-center py-4 relative z-10">
                                <p className="mb-4 text-indigo-100">Get an instant analysis of your day.</p>
                                <button onClick={onGenerateReport} className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto">
                                    <span className="material-symbols-outlined">analytics</span>
                                    Scan Full Day
                                </button>
                            </div>
                        )}

                        {isGeneratingReport && (
                            <div className="flex flex-col items-center justify-center py-8 relative z-10">
                                <span className="material-symbols-outlined text-4xl animate-spin mb-3">sync</span>
                                <p className="font-medium animate-pulse">Analyzing your routine...</p>
                            </div>
                        )}

                        {latestReport && !isGeneratingReport && (
                            <div className="animate-in fade-in zoom-in duration-500 relative z-10">
                                <h3 className="text-lg font-bold mb-2 text-white">{latestReport.headline || "Daily Report"}</h3>
                                <div className="prose prose-invert prose-sm max-w-none line-clamp-4">
                                     {latestReport.content.split('\n').slice(1).map((line, i) => <p key={i} className="mb-1 text-indigo-50 text-xs">{line}</p>)}
                                </div>
                                <button onClick={onGenerateReport} className="mt-4 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                                    Refresh Report
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Manage Routine Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">edit_note</span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manage Routine</h3>
                    </div>

                    <form onSubmit={handleAddSubmit} className="bg-white dark:bg-[#1e253e] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Add New List Item</p>
                        <input type="text" placeholder="Task Title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" required />
                        
                        <div className="flex gap-2 relative items-stretch">
                            {/* Improved Time Input Group */}
                            <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-shadow">
                                <input 
                                    type="text" 
                                    placeholder="e.g. 09:30" 
                                    value={newTaskTimeVal} 
                                    onChange={(e) => setNewTaskTimeVal(e.target.value)} 
                                    className="w-full bg-transparent border-none px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-0 outline-none placeholder-slate-400" 
                                    required 
                                />
                                <div className="h-5 w-px bg-slate-200 dark:bg-slate-700"></div>
                                <select
                                    value={newTaskAmpm}
                                    onChange={(e) => setNewTaskAmpm(e.target.value)}
                                    className="bg-transparent border-none py-1 pl-2 pr-7 text-xs font-bold text-slate-600 dark:text-slate-400 focus:ring-0 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-[right_0.25rem_center]"
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>

                            <div className="relative w-1/3 min-w-[80px]">
                                <input type="text" list="category-options" placeholder="Category" value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                                <datalist id="category-options">{categories.map(cat => <option key={cat} value={cat} />)}</datalist>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><span className="material-symbols-outlined text-sm">expand_more</span></div>
                            </div>
                            <button type="button" onClick={() => setHasAlarm(!hasAlarm)} className={`flex items-center justify-center px-3 rounded-lg border transition-colors ${hasAlarm ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-400'}`}><span className="material-symbols-outlined text-xl">{hasAlarm ? 'notifications_active' : 'notifications'}</span></button>
                        </div>

                        <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity">Add to Routine</button>
                    </form>

                    <div className="bg-white dark:bg-[#1e253e] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Lists ({tasks.length})</p>
                             {completedCount > 0 && (
                                <button onClick={onClearCompleted} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">delete_sweep</span> Clear Completed
                                </button>
                             )}
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <div className="min-w-0 flex items-center gap-2">
                                        <div className="size-2 rounded-full" style={{ backgroundColor: categoryColors[task.category] }}></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{task.title}</p>
                                            <p className="text-xs text-slate-500 truncate">{task.time} • {task.category}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => onRemoveTask(task.id)} className="size-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                        {!showClearAllConfirm ? (
                            <>
                            <button onClick={onResetTasks} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">restart_alt</span> Reset Default
                            </button>
                            <button onClick={() => setShowClearAllConfirm(true)} className="flex-1 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">delete_forever</span> Clear All
                            </button>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20">
                                <p className="text-center text-xs font-bold text-red-600 dark:text-red-400 mb-1">Are you sure? This cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowClearAllConfirm(false)} className="flex-1 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                                    <button onClick={() => { onClearAllTasks(); setShowClearAllConfirm(false); }} className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">warning</span> Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            {/* Ringtone selector overlay */}
            {isRingtoneSelectorOpen && (
                <div className="absolute inset-0 z-[60] bg-slate-50 dark:bg-background-dark flex flex-col animate-in slide-in-from-bottom duration-300">
                     <header className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#1a1f35]/50 backdrop-blur-md sticky top-0 z-10">
                        <button onClick={() => setIsRingtoneSelectorOpen(false)} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-2">
                            <span className="material-symbols-outlined">arrow_downward</span>
                        </button>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex-1">Select Ringtone</h2>
                    </header>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2 pb-24">
                        <div className="p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => fileInputRef.current?.click()}>
                             <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><span className="material-symbols-outlined">music_note</span></div>
                                <div><p className="text-sm font-bold text-slate-900 dark:text-white">Custom MP3</p></div>
                             </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
                        {RINGTONE_PRESETS.map((preset) => (
                            <div key={preset.id} className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${activeRingtoneId === preset.id ? 'bg-primary/10 border-primary' : 'bg-white dark:bg-[#1e253e] border-slate-200 dark:border-slate-700'}`} onClick={() => onActiveRingtoneChange(preset.id)}>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><span className="material-symbols-outlined">{preset.icon}</span></div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{preset.label}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <button onClick={(e) => { e.stopPropagation(); onPreviewSound(preset.id); }} className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white"><span className="material-symbols-outlined text-xl">play_arrow</span></button>
                                     {activeRingtoneId === preset.id && <span className="material-symbols-outlined text-primary">check_circle</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;