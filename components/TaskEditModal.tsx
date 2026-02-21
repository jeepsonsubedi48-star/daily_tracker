import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { RINGTONE_PRESETS } from '../constants';

interface TaskEditModalProps {
    task: Task;
    onSave: (updatedTask: Task) => void;
    onClose: () => void;
    onPreviewSound: (id: string, customData?: string) => void;
    categories: string[];
    onAddCategory: (category: string) => void;
    categoryColors: Record<string, string>;
}

// --- Wheel Picker Component ---
const WheelColumn: React.FC<{
    options: (string | number)[];
    selectedValue: string | number;
    onChange: (val: string | number) => void;
    label?: string;
}> = ({ options, selectedValue, onChange, label }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            const selectedIdx = options.findIndex(o => o === selectedValue);
            if (selectedIdx !== -1) {
                const itemHeight = 40; // Approximate height of each item
                containerRef.current.scrollTop = selectedIdx * itemHeight - (containerRef.current.clientHeight / 2) + (itemHeight / 2);
            }
        }
    }, []); 

    return (
        <div className="flex flex-col items-center h-full relative">
            {label && <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</span>}
            <div 
                ref={containerRef}
                className="w-full flex-1 overflow-y-auto custom-scrollbar snap-y snap-mandatory relative py-[60px]"
                style={{ scrollBehavior: 'smooth' }}
            >
                {options.map((option) => {
                     const isSelected = option === selectedValue;
                     return (
                        <div 
                            key={option} 
                            onClick={(e) => { e.stopPropagation(); onChange(option); }}
                            className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-all duration-200 ${isSelected ? 'text-primary font-bold text-xl scale-110' : 'text-slate-400 text-sm hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            {typeof option === 'number' ? option.toString().padStart(2, '0') : option}
                        </div>
                     );
                })}
            </div>
            {/* Selection Highlight Bar Overlay */}
            <div className="absolute top-[50%] left-0 right-0 h-[40px] -translate-y-[50%] pointer-events-none border-y border-primary/10 bg-primary/5 rounded-lg mt-3"></div>
        </div>
    );
};

const CustomTimePicker: React.FC<{
    label: string;
    value: string;
    onChange: (val: string) => void;
}> = ({ label, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse current value (HH:mm 24h)
    const parseTime = (val: string) => {
        if (!val) return { h: 12, m: 0, ampm: 'AM' as const };
        let [h, m] = val.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        if (h === 0) h = 12;
        return { h, m, ampm: ampm as 'AM' | 'PM' };
    };

    const { h, m, ampm } = parseTime(value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateTime = (newH: number, newM: number, newAmpm: 'AM' | 'PM') => {
        let hour = newH;
        if (newAmpm === 'PM' && hour < 12) hour += 12;
        if (newAmpm === 'AM' && hour === 12) hour = 0;
        onChange(`${hour.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
        <div className="relative" ref={containerRef}>
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">{label}</label>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-slate-50 dark:bg-[#151926] rounded-2xl px-4 py-3 text-left flex items-center justify-between border-2 transition-all shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${isOpen ? 'border-primary ring-2 ring-primary/20 bg-white dark:bg-[#1e253e]' : 'border-transparent'}`}
            >
                <div className="flex flex-col">
                    <div className={`text-xl font-bold leading-none flex items-baseline gap-1 ${value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {value ? (
                            <>
                                <span>{h}:{m.toString().padStart(2, '0')}</span>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{ampm}</span>
                            </>
                        ) : (
                            <span>--:--</span>
                        )}
                    </div>
                </div>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`}>schedule</span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-[280px] animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex gap-2 h-48 relative">
                        {/* Wheel Columns */}
                        <div className="flex-1">
                            <WheelColumn 
                                label="HR" 
                                options={hours} 
                                selectedValue={h} 
                                onChange={(val) => updateTime(val as number, m, ampm)} 
                            />
                        </div>
                        <div className="w-px bg-slate-100 dark:bg-slate-800 my-4"></div>
                        <div className="flex-1">
                             <WheelColumn 
                                label="MIN" 
                                options={minutes} 
                                selectedValue={m} 
                                onChange={(val) => updateTime(h, val as number, ampm)} 
                            />
                        </div>
                        <div className="w-px bg-slate-100 dark:bg-slate-800 my-4"></div>
                        <div className="flex-1">
                            <WheelColumn 
                                label="A/P" 
                                options={['AM', 'PM']} 
                                selectedValue={ampm} 
                                onChange={(val) => updateTime(h, m, val as 'AM' | 'PM')} 
                            />
                        </div>
                    </div>
                    <div className="mt-2 text-center">
                         <button type="button" onClick={() => setIsOpen(false)} className="text-xs font-bold text-primary hover:underline">Done</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helpers for time calculation ---
const to24h = (timeStr: string): string | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s?(AM|PM|am|pm)?/i);
    if (!match) return null;
    let [_, h, m, modifier] = match;
    let hour = parseInt(h, 10);
    const minute = parseInt(m, 10);
    if (modifier) {
        if (modifier.toUpperCase() === 'PM' && hour < 12) hour += 12;
        if (modifier.toUpperCase() === 'AM' && hour === 12) hour = 0;
    }
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const format12h = (time24: string): string => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const getMinutesFromMidnight = (time24: string): number => {
    const [h, m] = time24.split(':').map(Number);
    return h * 60 + m;
};

const minutesTo24h = (minutes: number): string => {
    let m = minutes % (24 * 60);
    if (m < 0) m += 24 * 60;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
};

const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, onSave, onClose, onPreviewSound, categories, onAddCategory, categoryColors }) => {
    const [title, setTitle] = useState(task.title);
    
    // Time & Duration State
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [durationMinutes, setDurationMinutes] = useState<number>(0);
    
    const [category, setCategory] = useState(task.category);
    const [hasAlarm, setHasAlarm] = useState(task.hasAlarm || false);
    const [ringtoneId, setRingtoneId] = useState<string>(task.ringtoneId || 'default');
    const [customRingtone, setCustomRingtone] = useState<string | undefined>(task.customRingtone);
    
    // Ringtone UI State
    const [isRingtoneExpanded, setIsRingtoneExpanded] = useState(false);
    const [ringtoneTab, setRingtoneTab] = useState<'presets' | 'custom'>('presets');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Parsing
    useEffect(() => {
        const times = task.time.split('-').map(t => t.trim());
        const start24 = to24h(times[0]);
        
        if (start24) {
            setStartTime(start24);
            
            if (times[1]) {
                const end24 = to24h(times[1]);
                if (end24) {
                    setEndTime(end24);
                    let startMins = getMinutesFromMidnight(start24);
                    let endMins = getMinutesFromMidnight(end24);
                    if (endMins < startMins) endMins += 24 * 60;
                    setDurationMinutes(endMins - startMins);
                }
            } else if (task.duration) {
                 const dMatch = task.duration.match(/(\d+)/);
                 if (dMatch) {
                    const mins = parseInt(dMatch[1]);
                    setDurationMinutes(mins);
                    const startMins = getMinutesFromMidnight(start24);
                    setEndTime(minutesTo24h(startMins + mins));
                 }
            }
        } else {
             const now = new Date();
             const minutes = now.getMinutes();
             const remainder = 30 - (minutes % 30);
             now.setMinutes(minutes + remainder);
             const h = now.getHours();
             const m = now.getMinutes();
             setStartTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
    }, [task.time, task.duration]);

    const handleStartTimeChange = (newStart: string) => {
        setStartTime(newStart);
        if (durationMinutes > 0) {
            const startMins = getMinutesFromMidnight(newStart);
            setEndTime(minutesTo24h(startMins + durationMinutes));
        } else if (endTime) {
            let startMins = getMinutesFromMidnight(newStart);
            let endMins = getMinutesFromMidnight(endTime);
            if (endMins < startMins) endMins += 24 * 60;
            setDurationMinutes(endMins - startMins);
        }
    };

    const handleEndTimeChange = (newEnd: string) => {
        setEndTime(newEnd);
        if (startTime) {
            let startMins = getMinutesFromMidnight(startTime);
            let endMins = getMinutesFromMidnight(newEnd);
            if (endMins < startMins) endMins += 24 * 60;
            setDurationMinutes(endMins - startMins);
        }
    };

    const handleDurationChange = (totalMinutes: number) => {
        const safeMinutes = Math.max(0, totalMinutes);
        setDurationMinutes(safeMinutes);
        if (startTime) {
            const startMins = getMinutesFromMidnight(startTime);
            setEndTime(minutesTo24h(startMins + safeMinutes));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        let timeStr = format12h(startTime);
        if (endTime && durationMinutes > 0) {
            timeStr = `${format12h(startTime)} - ${format12h(endTime)}`;
        }
        
        let durationStr = undefined;
        if (durationMinutes > 0) {
            const hrs = Math.floor(durationMinutes / 60);
            const mins = durationMinutes % 60;
            if (hrs > 0 && mins > 0) durationStr = `${hrs}h ${mins}m`;
            else if (hrs > 0) durationStr = `${hrs}h`;
            else durationStr = `${mins}m`;
        }

        onSave({
            ...task,
            title,
            time: timeStr,
            duration: durationStr,
            category,
            hasAlarm,
            ringtoneId: ringtoneId === 'default' ? undefined : ringtoneId,
            customRingtone
        });
        
        if (category && !categories.includes(category)) {
            onAddCategory(category);
        }

        onClose();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setCustomRingtone(result);
                setRingtoneId('custom');
                onPreviewSound('custom', result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getRingtoneLabel = () => {
        if (ringtoneId === 'default') return 'Default Sound';
        if (ringtoneId === 'custom') return 'Custom Recording';
        const preset = RINGTONE_PRESETS.find(p => p.id === ringtoneId);
        return preset ? preset.label : 'Unknown';
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="bg-white dark:bg-[#1e253e] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl pointer-events-auto transform transition-all animate-in slide-in-from-bottom duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Edit Task</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Update your schedule</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6 pb-20">
                    {/* Title Input */}
                    <div className="group">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Task Title</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                placeholder="What needs to be done?"
                                className="w-full bg-slate-50 dark:bg-[#151926] border-none rounded-2xl px-5 py-4 text-lg font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 transition-all shadow-sm" 
                                required 
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined pointer-events-none">edit</span>
                        </div>
                    </div>

                    {/* Time Pickers */}
                    <div className="space-y-3">
                         <div className="grid grid-cols-2 gap-3">
                            <CustomTimePicker label="Start Time" value={startTime} onChange={handleStartTimeChange} />
                            <CustomTimePicker label="End Time" value={endTime} onChange={handleEndTimeChange} />
                         </div>
                    </div>

                    {/* Duration Picker */}
                    <div className="bg-slate-50 dark:bg-[#151926] rounded-2xl p-4 flex items-center justify-between border-2 border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-slate-200 dark:hover:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">timer</span>
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Duration</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             {/* Hours */}
                             <div className="flex flex-col items-center">
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        min="0" 
                                        max="23"
                                        value={Math.floor(durationMinutes / 60)} 
                                        onChange={(e) => {
                                            const h = parseInt(e.target.value) || 0;
                                            const m = durationMinutes % 60;
                                            handleDurationChange(h * 60 + m);
                                        }}
                                        className="w-16 bg-white dark:bg-[#1e253e] border-none rounded-xl text-center font-bold text-xl py-2 shadow-sm focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 mt-1">HR</span>
                             </div>
                             <span className="text-xl font-bold text-slate-300 mb-4">:</span>
                             {/* Minutes */}
                             <div className="flex flex-col items-center">
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        min="0" 
                                        max="59"
                                        value={durationMinutes % 60} 
                                        onChange={(e) => {
                                            const m = parseInt(e.target.value) || 0;
                                            const h = Math.floor(durationMinutes / 60);
                                            handleDurationChange(h * 60 + m);
                                        }}
                                        className="w-16 bg-white dark:bg-[#1e253e] border-none rounded-xl text-center font-bold text-xl py-2 shadow-sm focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 mt-1">MIN</span>
                             </div>
                        </div>
                    </div>
                    
                    {/* Categories */}
                    <div>
                        <div className="flex items-center justify-between mb-2 ml-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                            <span className="text-[10px] font-bold text-primary cursor-pointer hover:underline" onClick={() => document.getElementById('cat-input')?.focus()}>+ NEW</span>
                        </div>
                        
                        <div className="relative mb-3">
                             <input 
                                id="cat-input"
                                type="text" 
                                list="modal-categories" 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                placeholder="Select or type..."
                                className="w-full bg-slate-50 dark:bg-[#151926] border-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 transition-all shadow-sm" 
                            />
                            <datalist id="modal-categories">
                                {categories.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>

                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                            {categories.slice(0, 20).map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${category === cat ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    <span className={`size-2 rounded-full ${category === cat ? 'bg-white' : ''}`} style={{ backgroundColor: category === cat ? undefined : (categoryColors[cat] || '#808080') }}></span>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Refined Collapsible Ringtone Selection */}
                    <div className="bg-slate-50 dark:bg-[#151926] rounded-2xl border border-slate-200 dark:border-slate-800/50 overflow-hidden shadow-sm transition-all duration-300">
                        <div 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                            onClick={() => {
                                if (!hasAlarm) {
                                    setHasAlarm(true);
                                    setIsRingtoneExpanded(true);
                                } else {
                                    setIsRingtoneExpanded(!isRingtoneExpanded);
                                }
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${hasAlarm ? 'bg-primary text-white shadow-lg shadow-primary/30 rotate-0' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 -rotate-12'}`}>
                                    <span className="material-symbols-outlined">notifications</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Task Reminder</p>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        {hasAlarm ? getRingtoneLabel() : 'Notifications off'}
                                    </p>
                                </div>
                            </div>
                            
                            <div 
                                onClick={(e) => { e.stopPropagation(); setHasAlarm(!hasAlarm); if(!hasAlarm) setIsRingtoneExpanded(true); }} 
                                className={`w-12 h-7 rounded-full transition-colors relative shadow-inner cursor-pointer ${hasAlarm ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 bottom-1 size-5 bg-white rounded-full shadow-sm transition-all duration-300 ${hasAlarm ? 'translate-x-6' : 'translate-x-1'}`}></div>
                            </div>
                        </div>

                        {hasAlarm && isRingtoneExpanded && (
                            <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-[#1e253e] animate-in slide-in-from-top-2 fade-in duration-200">
                                {/* Segmented Control for Tabs */}
                                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 relative">
                                    <button 
                                        type="button"
                                        onClick={() => setRingtoneTab('presets')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all z-10 ${ringtoneTab === 'presets' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
                                    >
                                        Presets
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setRingtoneTab('custom')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all z-10 ${ringtoneTab === 'custom' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
                                    >
                                        Custom
                                    </button>
                                    <div 
                                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-[#151926] rounded-lg shadow-sm transition-all duration-300 ease-out ${ringtoneTab === 'presets' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
                                    ></div>
                                </div>

                                {ringtoneTab === 'presets' ? (
                                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1">
                                        <div 
                                            onClick={() => { setRingtoneId('default'); onPreviewSound('default'); }} 
                                            className={`col-span-2 flex items-center justify-between p-3 rounded-xl cursor-pointer border-2 transition-all ${ringtoneId === 'default' ? 'bg-primary/5 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined">check_circle</span>
                                                <span className="text-xs font-bold">System Default</span>
                                            </div>
                                            {ringtoneId === 'default' && <span className="material-symbols-outlined text-lg animate-pulse">volume_up</span>}
                                        </div>
                                        {RINGTONE_PRESETS.map(preset => (
                                            <div 
                                                key={preset.id} 
                                                onClick={() => { setRingtoneId(preset.id); onPreviewSound(preset.id); }} 
                                                className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all relative overflow-hidden ${ringtoneId === preset.id ? 'bg-primary/5 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200'}`}
                                            >
                                                <span className="material-symbols-outlined text-lg opacity-70 z-10">{preset.icon}</span>
                                                <span className="text-xs font-bold truncate z-10">{preset.label}</span>
                                                {ringtoneId === preset.id && <div className="absolute inset-0 bg-primary/5 z-0"></div>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3 p-1">
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                                                <span className="material-symbols-outlined text-2xl">upload_file</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Upload MP3/Audio</p>
                                            <p className="text-[10px] text-slate-500">Max size 5MB</p>
                                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
                                        </div>
                                        
                                        {customRingtone && (
                                            <div 
                                                onClick={() => { setRingtoneId('custom'); onPreviewSound('custom', customRingtone); }} 
                                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer ${ringtoneId === 'custom' ? 'bg-primary/5 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-sm">mic</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold">Custom Recording</p>
                                                        <p className="text-[9px] opacity-70">Tap to preview</p>
                                                    </div>
                                                </div>
                                                <span className="material-symbols-outlined text-xl">play_circle</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white font-display font-bold text-lg py-4 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">save</span>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TaskEditModal;