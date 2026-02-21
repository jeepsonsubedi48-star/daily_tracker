import React from 'react';

interface ProgressBarProps {
    totalTasks: number;
    completedTasks: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalTasks, completedTasks }) => {
    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <section className="px-5 pt-4">
            <div className="bg-gradient-to-br from-primary to-blue-600 dark:from-[#1a1f35] dark:to-[#161b30] rounded-2xl p-5 shadow-lg shadow-blue-900/10 dark:shadow-none border border-blue-500/10 dark:border-slate-800 relative overflow-hidden group">
                
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/15 transition-colors duration-500"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/10 dark:bg-blue-500/5 rounded-full blur-xl"></div>

                <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-white dark:text-white text-base font-semibold leading-none tracking-tight">
                                Daily Progress
                            </p>
                            <p className="text-blue-100/80 dark:text-[#929bc9] text-xs font-medium mt-1.5">
                                You have completed {completedTasks} out of {totalTasks} tasks
                            </p>
                        </div>
                        <div className="text-right">
                             <span className="text-2xl font-bold text-white tracking-tight">
                                {percentage}%
                            </span>
                        </div>
                    </div>

                    <div className="rounded-full bg-black/20 dark:bg-[#0d101c] h-3 overflow-hidden backdrop-blur-sm">
                        <div 
                            className="h-full rounded-full bg-white dark:bg-primary shadow-[0_0_10px_rgba(255,255,255,0.5)] dark:shadow-none transition-all duration-700 ease-out" 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProgressBar;