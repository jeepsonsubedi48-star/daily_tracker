import React from 'react';
import { DailyReport, WeeklyReport } from '../types';

interface StatsViewProps {
    dailyReports?: DailyReport[];
    weeklyReports?: WeeklyReport[];
    isGenerating?: boolean;
    onGenerateWeekly?: () => void;
}

const StatsView: React.FC<StatsViewProps> = ({ dailyReports = [], weeklyReports = [], isGenerating = false, onGenerateWeekly }) => {
  // Mock data for the weekly chart visualization
  const weeklyData = [
    { day: 'M', full: 'Monday', value: 85 },
    { day: 'T', full: 'Tuesday', value: 65 },
    { day: 'W', full: 'Wednesday', value: 90 },
    { day: 'T', full: 'Thursday', value: 45 },
    { day: 'F', full: 'Friday', value: 100 },
    { day: 'S', full: 'Saturday', value: 55 },
    { day: 'S', full: 'Sunday', value: 30 },
  ];

  const currentWeeklyReport = weeklyReports && weeklyReports.length > 0 ? weeklyReports[0] : null;

  const renderDailyContent = (content: string) => {
    return content.split('\n').slice(1).map((line, i) => {
        if (!line.trim() || line.startsWith('#')) return null;
        
        // Handle Bold Formatting **text**
        const formattedLine = line.split(/(\*\*.*?\*\*)/).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-slate-800 dark:text-slate-200">{part.slice(2, -2)}</strong>;
            }
            return part;
        });

        const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*');
        const cleanLine = isBullet ? formattedLine.slice(1) : formattedLine; // Remove the bullet char if simplified processing

        return (
            <p key={i} className={`text-xs text-slate-600 dark:text-slate-400 mb-1 leading-relaxed ${isBullet ? 'pl-3 relative before:content-["•"] before:absolute before:left-0 before:text-slate-400' : ''}`}>
                {isBullet ? formattedLine : formattedLine}
            </p>
        );
    });
  };

  return (
    <div className="px-5 pt-2 pb-24 flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
        <section>
            <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Activity Chart</h2>
            </div>
            <div className="bg-white dark:bg-[#1e253e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-end justify-between h-48 gap-3">
                    {weeklyData.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                            <div className="w-full relative flex items-end justify-center h-full">
                                <div 
                                    className={`w-full max-w-[12px] rounded-full transition-all duration-1000 ease-out group-hover:scale-x-110 ${item.value >= 90 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    style={{ height: `${item.value}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold py-1 px-2 rounded shadow-lg transition-all transform scale-90 group-hover:scale-100 pointer-events-none whitespace-nowrap z-10">
                                        {item.value}%
                                    </div>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{item.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Weekly Report Section */}
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Report</h2>
                {!currentWeeklyReport && !isGenerating && onGenerateWeekly && (
                    <button onClick={onGenerateWeekly} className="text-xs font-bold text-primary hover:underline">
                        Generate Now
                    </button>
                )}
            </div>
            
            {isGenerating && !currentWeeklyReport && (
                 <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-center gap-3 animate-pulse">
                    <span className="material-symbols-outlined text-indigo-500 animate-spin">sync</span>
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Analyzing your week...</span>
                </div>
            )}

            {currentWeeklyReport ? (
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md mb-2 inline-block backdrop-blur-sm">{currentWeeklyReport.range}</span>
                            <h3 className="text-xl font-bold leading-tight mb-1">{currentWeeklyReport.title}</h3>
                        </div>
                        <div className="size-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                            <span className="text-2xl font-black">{currentWeeklyReport.rating}</span>
                        </div>
                    </div>
                    
                    <p className="mt-3 text-indigo-100 text-sm leading-relaxed relative z-10">
                        {currentWeeklyReport.insight}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                        <span className="text-xs font-medium text-indigo-200">Based on your task completion</span>
                        <button className="text-xs font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors">
                            View Details
                        </button>
                    </div>
                </div>
            ) : (!isGenerating && (
                <div className="bg-slate-50 dark:bg-[#1e253e] rounded-2xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 text-sm">No weekly report available yet. It will generate automatically on Mondays or you can generate it manually.</p>
                </div>
            ))}
        </section>

        {/* Daily Reports Section */}
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Reports</h2>
                <span className="text-xs font-medium text-slate-500">{dailyReports.length} reports</span>
            </div>
            
            {dailyReports.length === 0 ? (
                <div className="bg-slate-50 dark:bg-[#1e253e] rounded-2xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 text-sm">No daily reports yet. They are generated automatically at midnight.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {dailyReports.map((report) => (
                        <div key={report.id} className="bg-white dark:bg-[#1e253e] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/30 group">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">{report.headline || "Daily Summary"}</h3>
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500 font-bold">{report.date}</span>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none">
                                {renderDailyContent(report.content)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    </div>
  );
};

export default StatsView;