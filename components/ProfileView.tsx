import React, { useState, useRef } from 'react';

const ProfileView = () => {
    const [name, setName] = useState("Joseph.S");
    const [bio, setBio] = useState("Biography");
    const [avatar, setAvatar] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock history data acting as "Daily Life Activity" folders
    const history = [
        { date: 'Yesterday, Jan 29', progress: 85, status: 'Great day!' },
        { date: 'Wednesday, Jan 28', progress: 100, status: 'Perfect score 🔥' },
        { date: 'Tuesday, Jan 27', progress: 40, status: 'Rough start' },
        { date: 'Monday, Jan 26', progress: 65, status: 'Getting there' },
        { date: 'Sunday, Jan 25', progress: 20, status: 'Rest day' },
    ];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="px-5 pt-2 pb-24 flex flex-col gap-8 animate-in fade-in slide-in-from-right-8 duration-300">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center mt-4">
                <div 
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="size-32 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-4 border-white dark:border-[#1e253e] shadow-2xl transition-transform group-hover:scale-105">
                        {avatar ? (
                            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800">
                                <span className="material-symbols-outlined text-5xl mb-2">person_add</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                        <span className="material-symbols-outlined text-3xl">edit</span>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                <div className="mt-6 w-full max-w-xs mx-auto space-y-2">
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-2xl font-bold text-center bg-transparent border-b border-transparent focus:border-primary border-dashed hover:border-slate-300 dark:hover:border-slate-700 focus:ring-0 p-1 text-slate-900 dark:text-white w-full placeholder-slate-400 transition-all rounded-t-md"
                        placeholder="Your Name"
                    />
                    <input 
                        type="text" 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="text-sm text-center bg-transparent border-b border-transparent focus:border-primary border-dashed hover:border-slate-300 dark:hover:border-slate-700 focus:ring-0 p-1 text-slate-500 dark:text-slate-400 w-full placeholder-slate-500 transition-all rounded-t-md"
                        placeholder="Add a bio..."
                    />
                </div>
            </div>

            {/* Daily Activity Folders */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span>
                        Daily Activity Log
                    </h3>
                    <button className="text-xs font-bold text-primary hover:underline">View All</button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    {history.map((day, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#1e253e] p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5">
                            <div className="flex items-center gap-4">
                                {/* Folder Icon Styling */}
                                <div className="relative">
                                    <div className="size-12 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-200 dark:group-hover:bg-orange-500/20 transition-colors">
                                        <span className="material-symbols-outlined filled">folder</span>
                                    </div>
                                    {/* Connection line for timeline effect */}
                                    {idx !== history.length - 1 && (
                                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-100 dark:bg-slate-800 -z-10 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors"></div>
                                    )}
                                </div>
                                
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{day.date}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{day.status}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${day.progress >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                    {day.progress}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProfileView;