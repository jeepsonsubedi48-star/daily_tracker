import React, { useState, useEffect, useRef } from 'react';
import TaskItem from './components/TaskItem';
import ProgressBar from './components/ProgressBar';
import BottomNav from './components/BottomNav';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import ChatView from './components/ChatView';
import AlarmOverlay from './components/AlarmOverlay';
import TaskEditModal from './components/TaskEditModal';
import { Task, NavTab, DailyReport, WeeklyReport } from './types';
import { GoogleGenAI } from "@google/genai";
import { RINGTONE_PRESETS, PREDEFINED_CATEGORIES, DEFAULT_CATEGORY_COLORS } from './constants';

const INITIAL_TASKS: Task[] = [
    { id: '1', title: 'Wake up', time: '05:30 AM', completed: true, category: 'Health', completedAt: '05:30 AM', hasAlarm: true, ringtoneId: 'gentle_chime' },
    { id: '2', title: 'Freshen up', time: '05:30 - 06:00 AM', completed: true, category: 'Health', completedAt: '05:55 AM', duration: '30m' },
    { id: '3', title: 'Morning study', time: '06:00 AM - 06:37 AM', completed: true, category: 'Study', completedAt: '06:37 AM', hasAlarm: true, ringtoneId: 'horizontal', duration: '37m' },
    { id: '4', title: 'Breakfast', time: '06:30 - 06:50 AM', completed: true, category: 'Food', completedAt: '06:45 AM' },
    { id: '5', title: 'Travel to college', time: '06:50 - 07:20 AM', completed: false, category: 'Travel', duration: '30m' },
    { id: '6', title: 'First class', time: '07:30 - 09:00 AM', completed: false, category: 'Study', duration: '1h 30m' },
    { id: '7', title: 'Break', time: '09:00 - 09:30 AM', completed: false, category: 'Leisure' },
    { id: '8', title: 'Second class', time: '09:30 - 11:00 AM', completed: false, category: 'Study' },
    { id: '9', title: 'Rest', time: '11:00 - 12:00 PM', completed: false, category: 'Health' },
    { id: '10', title: 'Lunch', time: '12:00 - 01:00 PM', completed: false, category: 'Food' },
    { id: '11', title: 'Self-study', time: '01:00 - 03:00 PM', completed: false, category: 'Study' },
    { id: '12', title: 'Free time', time: '03:00 - 04:30 PM', completed: false, category: 'Leisure' },
    { id: '13', title: 'Homework', time: '04:30 - 06:00 PM', completed: false, category: 'Study' },
    { id: '14', title: 'Relax', time: '06:00 - 07:00 PM', completed: false, category: 'Leisure' },
    { id: '15', title: 'Dinner', time: '07:00 - 08:00 PM', completed: false, category: 'Food' },
    { id: '16', title: 'Planning', time: '08:00 - 09:30 PM', completed: false, category: 'Work' },
    { id: '17', title: 'Sleep', time: '10:00 PM', completed: false, category: 'Health' },
];

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [activeTab, setActiveTab] = useState<NavTab>(NavTab.TODAY);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
    
    // Alarm States
    const [activeRingtoneId, setActiveRingtoneId] = useState<string>('classic_beep');
    const [customRingtone, setCustomRingtone] = useState<string | null>(null);
    const [isRinging, setIsRinging] = useState(false);
    const [ringingTask, setRingingTask] = useState<Task | null>(null);
    const [lastAlarmMinute, setLastAlarmMinute] = useState<string | null>(null);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);

    // Category States
    const [categories, setCategories] = useState<string[]>(PREDEFINED_CATEGORIES);
    const [categoryColors, setCategoryColors] = useState<Record<string, string>>(DEFAULT_CATEGORY_COLORS);
    
    // Report States
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
    const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
    const [lastAutoReportDate, setLastAutoReportDate] = useState<string | null>(null);
    const [lastWeeklyReportDate, setLastWeeklyReportDate] = useState<string | null>(null);

    // Refs for audio and vibration
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const loopIntervalRef = useRef<number | null>(null);
    const vibrationIntervalRef = useRef<number | null>(null);

    // --- Persistence Logic ---
    useEffect(() => {
        // Load data from local storage on mount
        const loadState = () => {
            const savedTasks = localStorage.getItem('daytracker_tasks');
            if (savedTasks) setTasks(JSON.parse(savedTasks));

            const savedReports = localStorage.getItem('daytracker_reports');
            if (savedReports) setDailyReports(JSON.parse(savedReports));

            const savedWeeklyReports = localStorage.getItem('daytracker_weekly_reports');
            if (savedWeeklyReports) setWeeklyReports(JSON.parse(savedWeeklyReports));

            const savedCategories = localStorage.getItem('daytracker_categories');
            if (savedCategories) setCategories(JSON.parse(savedCategories));

            const savedColors = localStorage.getItem('daytracker_colors');
            if (savedColors) setCategoryColors(JSON.parse(savedColors));
            
            const savedTheme = localStorage.getItem('daytracker_theme');
            if (savedTheme) setTheme(savedTheme as 'light' | 'dark' | 'system');

            const savedReportDate = localStorage.getItem('daytracker_last_report_date');
            if (savedReportDate) setLastAutoReportDate(savedReportDate);

            const savedWeeklyDate = localStorage.getItem('daytracker_last_weekly_date');
            if (savedWeeklyDate) setLastWeeklyReportDate(savedWeeklyDate);
        };
        loadState();
    }, []);

    // Save data when it changes
    useEffect(() => {
        localStorage.setItem('daytracker_tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('daytracker_reports', JSON.stringify(dailyReports));
    }, [dailyReports]);

    useEffect(() => {
        localStorage.setItem('daytracker_weekly_reports', JSON.stringify(weeklyReports));
    }, [weeklyReports]);

    useEffect(() => {
        localStorage.setItem('daytracker_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('daytracker_colors', JSON.stringify(categoryColors));
    }, [categoryColors]);

    useEffect(() => {
        localStorage.setItem('daytracker_theme', theme);
    }, [theme]);

    useEffect(() => {
        if (lastAutoReportDate) {
            localStorage.setItem('daytracker_last_report_date', lastAutoReportDate);
        }
    }, [lastAutoReportDate]);

    useEffect(() => {
        if (lastWeeklyReportDate) {
            localStorage.setItem('daytracker_last_weekly_date', lastWeeklyReportDate);
        }
    }, [lastWeeklyReportDate]);

    // Handle Theme Change Application
    useEffect(() => {
        const root = window.document.documentElement;
        const applyTheme = (t: 'light' | 'dark' | 'system') => {
            let effectiveTheme = t;
            if (t === 'system') {
                effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            
            if (effectiveTheme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };
        applyTheme(theme);
    }, [theme]);

    // Request notification permission and check alarms & automatic reports
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        const checkAlarmsAndReports = () => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            const currentMinuteStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            // --- Alarm Check ---
            if (!isRinging && lastAlarmMinute !== currentMinuteStr) {
                 const matchedTask = tasks.find(task => {
                    if (task.hasAlarm && !task.completed) {
                        const normalizedTaskTime = task.time.replace(/\s+/g, ' ').trim();
                        return normalizedTaskTime.startsWith(currentTime);
                    }
                    return false;
                });

                if (matchedTask) {
                    setLastAlarmMinute(currentMinuteStr);
                    triggerAlarm(matchedTask);
                }
            }

            // --- Automatic Midnight Daily Report Check ---
            if (now.getHours() === 0 && now.getMinutes() <= 5) {
                const todayStr = now.toDateString();
                if (lastAutoReportDate !== todayStr) {
                    setLastAutoReportDate(todayStr);
                    handleGenerateReport(true);
                }
            }

            // --- Automatic Weekly Report Check (Sundays at 23:55 or Mondays at 00:00) ---
            // Let's check on Monday 00:00 for the past week
            if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() <= 5) {
                const weekStr = `Week-${now.getFullYear()}-${getWeekNumber(now)}`;
                if (lastWeeklyReportDate !== weekStr) {
                    setLastWeeklyReportDate(weekStr);
                    handleGenerateWeeklyReport(true);
                }
            }
        };

        const intervalId = setInterval(checkAlarmsAndReports, 5000); // Check every 5 seconds
        return () => clearInterval(intervalId);
    }, [tasks, isRinging, lastAlarmMinute, lastAutoReportDate, lastWeeklyReportDate]);

    function getWeekNumber(d: Date) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
        return weekNo;
    }

    // --- Report Generation Logic ---
    const handleGenerateReport = async (isAuto = false) => {
        if (isGeneratingReport) return;
        setIsGeneratingReport(true);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const completedCount = tasks.filter(t => t.completed).length;
            const totalCount = tasks.length;
            const remainingCount = totalCount - completedCount;
            const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
            const dateStr = new Date().toDateString();
            const currentTime = new Date().toLocaleTimeString();

            // Separate Health-related tasks for focused analysis
            const healthTasks = tasks.filter(t => 
                ['Health', 'Sleep', 'Gym', 'Food', 'Exercise', 'Meditation'].includes(t.category)
            );
            const workTasks = tasks.filter(t => 
                ['Work', 'Study', 'Meeting', 'Focus'].includes(t.category)
            );

            const contextData = {
                date: dateStr,
                time: currentTime,
                stats: { 
                    completed: completedCount, 
                    total: totalCount, 
                    remaining: remainingCount,
                    rate: `${completionRate}%` 
                },
                healthData: healthTasks.map(t => ({ title: t.title, completed: t.completed, time: t.time })),
                workData: workTasks.map(t => ({ title: t.title, completed: t.completed, time: t.time })),
                allTasks: tasks.map(t => ({
                    title: t.title,
                    category: t.category,
                    completed: t.completed,
                }))
            };

            const prompt = `
                Act as an elite High-Performance Health & Productivity Coach (like Andrew Huberman meets David Goggins). 
                
                **Objective:** 
                Rigorously analyze the user's daily data below to provide a "Daily Scan Report" focused on Health Conditions, Biology, and Output.

                **User Data:** 
                ${JSON.stringify(contextData)}

                **Requirements:**
                1. **Headline:** A punchy, 3-7 word summary line starting with '#'.
                2. **Health Bio-Audit:** Analyze sleep timing, meal consistency, and exercise. Did they miss critical health protocols?
                3. **Focus Metric:** Analyze the work/study completion.
                4. **The Verdict:** Be brutally honest but constructive.
                
                **Formatting:**
                - Use Markdown.
                - Include specific scores: "**Bio-Score: X/10**" and "**Focus-Score: X/10**".
                - Use bullet points for "Wins" and "Critical Misses".
                - End with a single "Prescription for Tomorrow".
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            const text = response.text || "Report generation failed.";
            const headline = text.split('\n')[0].replace('#', '').trim();
            
            const newReport: DailyReport = {
                id: Date.now().toString(),
                date: dateStr,
                content: text,
                headline: headline.length < 60 ? headline : "Daily Bio-Audit"
            };

            setDailyReports(prev => [newReport, ...prev]);

        } catch (error) {
            console.error("Report generation error:", error);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleGenerateWeeklyReport = async (isAuto = false) => {
        if (isGeneratingWeekly) return;
        setIsGeneratingWeekly(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Gather last 7 days reports + current tasks context
            const reportContext = dailyReports.slice(0, 7).map(r => `[${r.date}] Headline: ${r.headline}\nContent Excerpt: ${r.content.substring(0, 150)}...`).join('\n\n');
            const currentStats = {
                totalTasks: tasks.length,
                completed: tasks.filter(t => t.completed).length,
                categories: categories
            };

            const prompt = `
                Act as a Chief of Staff reviewing the user's weekly performance. 

                **Context:**
                Daily Summaries from this week:
                ${reportContext || "No daily summaries available for this week yet."}
                
                Current Day Snapshot: ${JSON.stringify(currentStats)}
                
                **Goal:**
                Generate a Weekly Executive Summary JSON.

                **Analysis Logic:**
                - **Rating:** Be strict. 'A' is for near-perfect health and work execution. 'C' is for average. 'F' is for neglect.
                - **Deep Insight:** Look for patterns. Is sleep suffering for work? Is laziness creeping in? Mention specific health trends (e.g., "Sleep consistency remains your biggest biological bottleneck").
                - **Title:** A powerful 3-5 word theme for the week.

                **Output JSON Structure:**
                {
                    "range": "e.g., Feb 10 - Feb 16",
                    "title": "Theme of the Week",
                    "insight": "Detailed 2-3 sentence psychological and biological analysis of the week.",
                    "rating": "Grade (A+, A, B, C, F)"
                }
                Return ONLY the JSON.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            const jsonStr = response.text;
            if (jsonStr) {
                const data = JSON.parse(jsonStr);
                const newWeeklyReport: WeeklyReport = {
                    id: Date.now().toString(),
                    date: new Date().toDateString(),
                    range: data.range || "This Week",
                    title: data.title || "Weekly Overview",
                    insight: data.insight || "Keep pushing forward!",
                    rating: data.rating || "B"
                };
                setWeeklyReports(prev => [newWeeklyReport, ...prev]);
            }

        } catch (error) {
            console.error("Weekly report generation error:", error);
        } finally {
            setIsGeneratingWeekly(false);
        }
    };

    const triggerAlarm = (task: Task) => {
        setIsRinging(true);
        setRingingTask(task);

        if (Notification.permission === 'granted') {
            new Notification(`ALARM: ${task.title}`, {
                body: `It's time for ${task.category}!`,
                icon: '/icon.png'
            });
        }

        if (vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
            const pattern = [500, 250, 500, 250, 500, 250];
            navigator.vibrate(pattern);
            vibrationIntervalRef.current = window.setInterval(() => {
                navigator.vibrate(pattern);
            }, 2500);
        }

        const ringtoneToPlay = task.ringtoneId || activeRingtoneId;
        const customDataToPlay = (task.ringtoneId === 'custom' && task.customRingtone) 
            ? task.customRingtone 
            : customRingtone;

        playAlarmSound(ringtoneToPlay, false, customDataToPlay);
    };

    const playAlarmSound = (ringtoneId: string, oneShot = false, specificCustomData?: string | null) => {
        // Clear any previous loop interval if we are starting a fresh sound or loop
        if (!oneShot && loopIntervalRef.current) {
            clearInterval(loopIntervalRef.current);
            loopIntervalRef.current = null;
        }

        const dataToPlay = specificCustomData;

        if (ringtoneId === 'custom' && dataToPlay) {
            if (!audioRef.current) {
                audioRef.current = new Audio(dataToPlay);
            } else {
                audioRef.current.src = dataToPlay;
            }
            audioRef.current.loop = !oneShot;
            audioRef.current.volume = 1.0;
            audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        } else {
            try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (!audioContextRef.current) {
                    audioContextRef.current = new AudioContext();
                }
                const ctx = audioContextRef.current;
                
                if (ctx.state === 'suspended') ctx.resume().catch(e => console.error(e));
                
                const t = ctx.currentTime;
                // Create master gain for overall volume
                const masterGain = ctx.createGain();
                masterGain.connect(ctx.destination);
                masterGain.gain.value = 0.6; // High volume as requested

                // Helper to generate oscillator sounds
                const playOsc = (type: OscillatorType, freq: number, startTime: number, duration: number, vol = 1.0) => {
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, startTime);
                    osc.connect(g);
                    g.connect(masterGain);
                    g.gain.setValueAtTime(vol, startTime);
                    g.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                    osc.start(startTime);
                    osc.stop(startTime + duration);
                };

                switch (ringtoneId) {
                    case 'classic_beep':
                        playOsc('square', 880, t, 0.1, 0.8);
                        playOsc('square', 880, t + 0.15, 0.1, 0.8);
                        playOsc('square', 880, t + 0.3, 0.1, 0.8);
                        break;
                    case 'basic_bell':
                        playOsc('sine', 600, t, 0.8, 0.8);
                        playOsc('sine', 450, t + 0.2, 1.2, 0.6);
                        break;
                    case 'loud_siren':
                         const oscSiren = ctx.createOscillator();
                         const gSiren = ctx.createGain();
                         oscSiren.type = 'sawtooth';
                         oscSiren.frequency.setValueAtTime(500, t);
                         oscSiren.frequency.linearRampToValueAtTime(1000, t + 0.5);
                         oscSiren.frequency.linearRampToValueAtTime(500, t + 1.0);
                         oscSiren.connect(gSiren);
                         gSiren.connect(masterGain);
                         gSiren.gain.value = 0.6;
                         oscSiren.start(t);
                         oscSiren.stop(t + 1.0);
                         break;
                    case 'horizontal':
                        const oscH = ctx.createOscillator();
                        const gH = ctx.createGain();
                        oscH.connect(gH);
                        gH.connect(masterGain);
                        oscH.type = 'sine';
                        oscH.frequency.setValueAtTime(300, t);
                        oscH.frequency.exponentialRampToValueAtTime(1500, t + 0.4);
                        gH.gain.setValueAtTime(0.5, t);
                        gH.gain.linearRampToValueAtTime(0, t + 0.4);
                        oscH.start(t);
                        oscH.stop(t + 0.4);
                        break;
                     case 'digital_pulse':
                        for(let i=0; i<6; i++) {
                            playOsc('square', 1500, t + i*0.08, 0.04, 0.4);
                        }
                        break;
                     case 'cosmic_drop':
                        const oscC = ctx.createOscillator();
                        const gC = ctx.createGain();
                        oscC.connect(gC);
                        gC.connect(masterGain);
                        oscC.frequency.setValueAtTime(2000, t);
                        oscC.frequency.exponentialRampToValueAtTime(100, t + 0.8);
                        gC.gain.setValueAtTime(0.5, t);
                        gC.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
                        oscC.start(t);
                        oscC.stop(t + 0.8);
                        break;
                     case 'arcade_up':
                        playOsc('square', 440, t, 0.1, 0.5);
                        playOsc('square', 554, t + 0.1, 0.1, 0.5);
                        playOsc('square', 659, t + 0.2, 0.1, 0.5);
                        playOsc('square', 880, t + 0.3, 0.2, 0.5);
                        break;
                    case 'radar_ping':
                        playOsc('sine', 1200, t, 0.05, 0.8);
                        playOsc('sine', 1200, t + 0.1, 0.4, 0.3); // Echo
                        break;
                    case 'gentle_chime':
                         playOsc('triangle', 523.25, t, 1.5, 0.4);
                         playOsc('triangle', 659.25, t + 0.2, 1.5, 0.4);
                         playOsc('triangle', 783.99, t + 0.4, 1.5, 0.4);
                         break;
                    case 'industrial_buzz':
                        const buzzOsc = ctx.createOscillator();
                        buzzOsc.type = 'sawtooth';
                        buzzOsc.frequency.setValueAtTime(100, t);
                        const buzzGain = ctx.createGain();
                        buzzGain.gain.setValueAtTime(0.8, t);
                        buzzGain.gain.linearRampToValueAtTime(0, t+0.4);
                        buzzOsc.connect(buzzGain);
                        buzzGain.connect(masterGain);
                        buzzOsc.start(t);
                        buzzOsc.stop(t+0.4);
                        break;
                    case 'phone_ring':
                         const pOsc1 = ctx.createOscillator();
                         const pOsc2 = ctx.createOscillator();
                         pOsc1.frequency.value = 800;
                         pOsc2.frequency.value = 1000;
                         const pGain = ctx.createGain();
                         const lfo = ctx.createOscillator();
                         lfo.frequency.value = 15;
                         const lfoGain = ctx.createGain();
                         lfoGain.gain.value = 0.5;
                         lfo.connect(lfoGain);
                         lfoGain.connect(pGain.gain);
                         pOsc1.connect(pGain);
                         pOsc2.connect(pGain);
                         pGain.connect(masterGain);
                         lfo.start(t); pOsc1.start(t); pOsc2.start(t);
                         lfo.stop(t+1.0); pOsc1.stop(t+1.0); pOsc2.stop(t+1.0);
                        break;
                     case 'zap_laser':
                        const zOsc = ctx.createOscillator();
                        const zGain = ctx.createGain();
                        zOsc.type = 'sawtooth';
                        zOsc.frequency.setValueAtTime(800, t);
                        zOsc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
                        zOsc.connect(zGain);
                        zGain.connect(masterGain);
                        zGain.gain.setValueAtTime(0.5, t);
                        zGain.gain.linearRampToValueAtTime(0, t+0.3);
                        zOsc.start(t);
                        zOsc.stop(t+0.3);
                        break;
                     case 'deep_gong':
                        playOsc('sine', 200, t, 2.0, 0.8);
                        playOsc('sine', 400, t, 1.5, 0.3);
                        break;
                     case 'alert_alarm':
                        playOsc('square', 800, t, 0.25, 0.6);
                        playOsc('square', 600, t+0.25, 0.25, 0.6);
                        playOsc('square', 800, t+0.5, 0.25, 0.6);
                        playOsc('square', 600, t+0.75, 0.25, 0.6);
                        break;
                     case 'victory_tune':
                        playOsc('square', 523, t, 0.1, 0.6);
                        playOsc('square', 523, t+0.12, 0.1, 0.6);
                        playOsc('square', 523, t+0.24, 0.1, 0.6);
                        playOsc('square', 659, t+0.36, 0.4, 0.6);
                        break;
                    default:
                        // Default beep
                        playOsc('square', 880, t, 0.1, 0.5);
                        playOsc('square', 1760, t + 0.1, 0.1, 0.5);
                        break;
                }

                if (!oneShot) {
                    loopIntervalRef.current = window.setInterval(() => {
                        // Re-trigger the logic
                        playAlarmSound(ringtoneId, true, specificCustomData); 
                    }, 2000);
                }
            } catch (e) {
                console.error("Web Audio API Error:", e);
            }
        }
    };

    const stopAlarm = () => {
        setIsRinging(false);
        setRingingTask(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (loopIntervalRef.current) {
            clearInterval(loopIntervalRef.current);
            loopIntervalRef.current = null;
        }
        if (vibrationIntervalRef.current) {
            clearInterval(vibrationIntervalRef.current);
            vibrationIntervalRef.current = null;
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(0);
        }
    };

    const handleToggleTask = (id: string) => {
        setTasks(prevTasks => 
            prevTasks.map(task => {
                if (task.id === id) {
                    const newCompleted = !task.completed;
                    let newCompletedAt = task.completedAt;
                    if (newCompleted && !newCompletedAt) {
                        newCompletedAt = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    }
                    return { ...task, completed: newCompleted, completedAt: newCompletedAt };
                }
                return task;
            })
        );
    };

    const handleTaskTimeUpdate = (id: string, time: string) => {
        setTasks(prevTasks => prevTasks.map(task => task.id === id ? { ...task, completedAt: time } : task));
    };

    const handleToggleAlarm = (id: string) => {
        setTasks(prevTasks => prevTasks.map(task => task.id === id ? { ...task, hasAlarm: !task.hasAlarm } : task));
    };

    const handleAddTask = (newTask: Omit<Task, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setTasks(prev => [...prev, { ...newTask, id }]);
    };

    const handleRemoveTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const handleClearCompleted = () => {
        setTasks(prev => prev.filter(t => !t.completed));
    };

    const handleClearAllTasks = () => {
        setTasks([]);
    };
    
    const handleResetTasks = () => {
        if (window.confirm("This will reset your schedule to the default template. Any custom tasks will be lost. Continue?")) {
            setTasks(INITIAL_TASKS);
        }
    };

    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleAddCategory = (newCategory: string) => {
        const trimmed = newCategory.trim();
        if (trimmed && !categories.includes(trimmed)) {
            setCategories(prev => [...prev, trimmed].sort());
            // Assign a random color if not exists
            if (!categoryColors[trimmed]) {
                const colors = ['#a855f7', '#3b82f6', '#f97316', '#eab308', '#6366f1', '#10b981', '#ec4899'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                setCategoryColors(prev => ({...prev, [trimmed]: randomColor}));
            }
        }
    };

    const handleRemoveCategory = (categoryToRemove: string) => {
        setCategories(prev => prev.filter(c => c !== categoryToRemove));
    };

    const handleEditCategory = (oldName: string, newName: string) => {
        const trimmedNew = newName.trim();
        if (!trimmedNew || oldName === trimmedNew) return;
        if (categories.includes(trimmedNew)) {
            alert('Category already exists!');
            return;
        }
        setCategories(prev => prev.map(c => c === oldName ? trimmedNew : c).sort());
        setCategoryColors(prev => {
            const { [oldName]: oldColor, ...rest } = prev;
            return { ...rest, [trimmedNew]: oldColor || '#64748b' };
        });
        setTasks(prev => prev.map(t => t.category === oldName ? { ...t, category: trimmedNew } : t));
    };

    const handleUpdateCategoryColor = (category: string, newColor: string) => {
        setCategoryColors(prev => ({ ...prev, [category]: newColor }));
    };

    const completedTasksCount = tasks.filter(t => t.completed).length;
    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const getHeaderContent = () => {
        switch(activeTab) {
            case NavTab.STATS: return { title: 'Your Insights', subtitle: 'Track your productivity trends.' };
            case NavTab.PROFILE: return { title: 'My Profile', subtitle: 'Manage your personal details.' };
            case NavTab.TODAY: default: return { title: todayDate, subtitle: 'Stay consistent with your routine.' };
        }
    };

    const headerContent = getHeaderContent();

    const renderContent = () => {
        switch(activeTab) {
            case NavTab.STATS:
                return (
                    <StatsView 
                        dailyReports={dailyReports} 
                        weeklyReports={weeklyReports}
                        isGenerating={isGeneratingReport || isGeneratingWeekly}
                        onGenerateWeekly={() => handleGenerateWeeklyReport(false)}
                    />
                );
            case NavTab.PROFILE:
                return <ProfileView />;
            case NavTab.TODAY:
            default:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <ProgressBar totalTasks={tasks.length} completedTasks={completedTasksCount} />
                        <section className="px-5 pt-6 pb-28 flex flex-col gap-4">
                            {tasks.map((task, index) => (
                                <div key={task.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>
                                    <TaskItem 
                                        task={task} 
                                        categoryColor={categoryColors[task.category] || '#64748b'}
                                        onToggle={handleToggleTask}
                                        onTimeUpdate={handleTaskTimeUpdate}
                                        onToggleAlarm={handleToggleAlarm}
                                        onEdit={setEditingTask}
                                    />
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <div className="text-center py-10 opacity-50">
                                    <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                                    <p>No tasks for today. Add some in settings!</p>
                                </div>
                            )}
                        </section>
                    </div>
                );
        }
    };

    return (
        <div className="relative flex h-screen max-w-md mx-auto flex-col bg-slate-50 dark:bg-background-dark overflow-hidden shadow-2xl transition-colors duration-500">
             {/* Decorative Ambient Background */}
            <div className="fixed inset-0 -z-10 bg-background-light dark:bg-background-dark overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 dark:bg-primary/10 rounded-full blur-[80px] opacity-60 animate-pulse" style={{ animationDuration: '4s' }}/>
                <div className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[60px] opacity-60 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}/>
                <div className="absolute -bottom-32 left-10 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[80px] opacity-50 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}/>
            </div>

            <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-30 bg-white/70 dark:bg-[#0B0D15]/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5 transition-all duration-300">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-[#1a1f35] shadow-sm text-primary transition-colors border border-slate-100 dark:border-slate-800">
                    <span className="material-symbols-outlined text-xl">calendar_today</span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold font-display leading-tight tracking-tight flex-1 text-center transition-colors">
                    {activeTab === NavTab.STATS ? 'Statistics' : (activeTab === NavTab.PROFILE ? 'Profile' : 'Daily Tracker')}
                </h2>
                <div className="flex items-center justify-end gap-2">
                    {/* Beautiful AI Assistant Logo Button */}
                    <button 
                        onClick={() => setIsChatOpen(true)} 
                        className="size-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-110 transition-all duration-300 group"
                    >
                        <span className="material-symbols-outlined text-white text-xl group-hover:rotate-12 transition-transform">
                            smart_toy
                        </span>
                    </button>
                    
                    <button onClick={() => setIsSettingsOpen(true)} className="flex size-10 cursor-pointer items-center justify-center rounded-2xl bg-white dark:bg-[#1a1f35] text-slate-900 dark:text-white shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined text-xl">settings</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                <section className="px-5 pt-4 pb-2">
                    <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-extrabold font-display leading-tight transition-colors">
                        {headerContent.title}
                    </h1>
                    <p className="text-slate-500 dark:text-[#929bc9] text-sm font-medium mt-1 transition-colors">
                        {headerContent.subtitle}
                    </p>
                </section>
                {renderContent()}
            </div>

            {activeTab === NavTab.TODAY && (
                <div className="absolute bottom-[100px] right-6 z-40 animate-in zoom-in duration-300">
                    <button onClick={() => setIsSettingsOpen(true)} className="bg-primary text-white size-14 rounded-full shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-all active:scale-95 hover:bg-primary-glow ring-4 ring-white dark:ring-[#0B0D15]">
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </button>
                </div>
            )}

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

            {isSettingsOpen && (
                <SettingsView 
                    tasks={tasks}
                    onClose={() => setIsSettingsOpen(false)}
                    onAddTask={handleAddTask}
                    onRemoveTask={handleRemoveTask}
                    onClearCompleted={handleClearCompleted}
                    onClearAllTasks={handleClearAllTasks}
                    onResetTasks={handleResetTasks}
                    currentTheme={theme}
                    onThemeChange={setTheme}
                    customRingtone={customRingtone}
                    onRingtoneChange={setCustomRingtone}
                    activeRingtoneId={activeRingtoneId}
                    onActiveRingtoneChange={setActiveRingtoneId}
                    onPreviewSound={(id) => playAlarmSound(id, true, customRingtone)}
                    vibrationEnabled={vibrationEnabled}
                    onVibrationChange={setVibrationEnabled}
                    categories={categories}
                    onAddCategory={handleAddCategory}
                    onRemoveCategory={handleRemoveCategory}
                    onEditCategory={handleEditCategory}
                    categoryColors={categoryColors}
                    onUpdateCategoryColor={handleUpdateCategoryColor}
                    onGenerateReport={() => handleGenerateReport(false)}
                    isGeneratingReport={isGeneratingReport}
                    reports={dailyReports}
                />
            )}

            {isChatOpen && (
                <ChatView 
                    onClose={() => setIsChatOpen(false)} 
                    tasks={tasks}
                    reports={dailyReports}
                />
            )}
            
            {isRinging && <AlarmOverlay task={ringingTask} onStop={stopAlarm} />}
            {editingTask && (
                <TaskEditModal 
                    task={editingTask}
                    onSave={handleUpdateTask}
                    onClose={() => setEditingTask(null)}
                    onPreviewSound={(id, customData) => playAlarmSound(id, true, customData)}
                    categories={categories}
                    onAddCategory={handleAddCategory}
                    categoryColors={categoryColors}
                />
            )}
        </div>
    );
};

export default App;