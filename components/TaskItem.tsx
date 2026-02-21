import React, { useState } from 'react';
import { Task } from '../types';
import { getCategoryIcon } from '../constants';

interface TaskItemProps {
    task: Task;
    categoryColor: string;
    onToggle: (id: string) => void;
    onTimeUpdate: (id: string, time: string) => void;
    onToggleAlarm?: (id: string) => void;
    onEdit?: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, categoryColor, onToggle, onTimeUpdate, onToggleAlarm, onEdit }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            onClick={() => onToggle(task.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative flex items-start gap-4 p-5 bg-white dark:bg-[#1e253e] rounded-3xl border transition-all duration-300 ease-out group cursor-pointer select-none
            ${task.completed 
                ? 'border-transparent bg-opacity-60 dark:bg-opacity-40' 
                : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5'
            }`}
            style={{
                borderColor: (!task.completed && isHovered) ? `${categoryColor}50` : undefined
            }}
        >
            {/* Left: Custom Checkbox */}
            <div className="pt-1 shrink-0">
                <div className="relative flex items-center justify-center size-8">
                   <input 
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggle(task.id)}
                        onClick={(e) => e.stopPropagation()} 
                        className={`peer appearance-none size-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ease-out
                        ${task.completed 
                            ? 'bg-slate-500 border-slate-500 dark:bg-slate-600 dark:border-slate-600' 
                            : 'border-slate-300 dark:border-slate-600 hover:border-primary bg-transparent'
                        }`}
                        style={{ borderColor: (!task.completed && isHovered) ? categoryColor : undefined }}
                    />
                    <span className="material-symbols-outlined absolute text-white pointer-events-none text-base scale-0 peer-checked:scale-100 transition-transform duration-300 font-bold">
                        check
                    </span>
                </div>
            </div>

            {/* Right: Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                
                {/* Header: Category & Edit */}
                <div className="flex items-center justify-between">
                     <span 
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-colors duration-300"
                        style={{ 
                            color: task.completed ? '#94a3b8' : categoryColor,
                            backgroundColor: task.completed ? '#f1f5f9' : `${categoryColor}15`,
                            borderColor: task.completed ? 'transparent' : `${categoryColor}20`
                        }}
                     >
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: task.completed ? '#cbd5e1' : categoryColor }}></span>
                        {task.category}
                    </span>

                    {/* Edit Button (visible on hover) */}
                    {onEdit && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                            className={`size-8 rounded-full flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}
                            style={{ backgroundColor: isHovered ? `${categoryColor}10` : 'transparent', color: categoryColor }}
                        >
                            <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                    )}
                </div>

                {/* Title */}
                <h3 className={`text-lg font-bold text-slate-900 dark:text-white leading-snug transition-all duration-300 ${task.completed ? 'line-through text-slate-400 dark:text-slate-500 decoration-2 decoration-slate-300 dark:decoration-slate-600' : ''}`}>
                    {task.title}
                </h3>

                {/* Footer: Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-y-2 mt-1">
                    
                    {/* Time & Alarm */}
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        {/* Time */}
                        <div className="flex items-center gap-1.5" title="Scheduled Time">
                            <span className="material-symbols-outlined text-[18px] opacity-70">schedule</span>
                            <span className={`text-xs font-bold whitespace-nowrap ${task.completed ? 'opacity-70' : ''}`}>
                                {task.time}
                            </span>
                        </div>

                        {/* Alarm Icon */}
                        {task.hasAlarm && (
                            <div className={`flex items-center justify-center ml-1 size-6 rounded-full ${task.completed ? 'bg-transparent text-slate-300' : 'bg-primary/10 text-primary'}`} title="Alarm set">
                                <span className="material-symbols-outlined text-[16px] filled">notifications</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;