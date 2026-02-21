import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Task, DailyReport } from '../types';

interface ChatViewProps {
    onClose: () => void;
    tasks: Task[];
    reports: DailyReport[];
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const ChatView: React.FC<ChatViewProps> = ({ onClose, tasks, reports }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', role: 'model', text: 'Hello! I am your personal productivity AI. I see your schedule for today. How can I help you optimize it?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input;
        setInput('');
        
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const taskContext = tasks.map(t => `${t.time}: ${t.title} (${t.category}) - ${t.completed ? 'Done' : 'Pending'}`).join('\n');
            const reportContext = reports.slice(0, 1).map(r => `Latest Report: ${r.headline}\n${r.content}`).join('\n');
            
            // System instruction injected with real-time context
            const systemPrompt = `
                You are a sophisticated, high-energy productivity coach AI for the 'My Day' app.
                
                CURRENT USER CONTEXT:
                Today's Schedule:
                ${taskContext || "No tasks scheduled yet."}

                Recent Insights:
                ${reportContext || "No recent reports."}

                Role:
                - Analyze the user's schedule gaps and completed tasks.
                - Be motivating but concise.
                - If they ask "What should I do?", look at their pending tasks.
                - Use emojis.
                - Keep responses under 3 sentences unless asked for a plan.
            `;

            const history = messages
                .filter(m => m.id !== 'init')
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            const chat = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: systemPrompt,
                },
                history: history
            });

            const result = await chat.sendMessageStream({ message: userText });
            
            const modelMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);

            let fullText = '';
            for await (const chunk of result) {
                const text = chunk.text;
                if (text) {
                    fullText += text;
                    setMessages(prev => 
                        prev.map(msg => msg.id === modelMsgId ? { ...msg, text: fullText } : msg)
                    );
                }
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm having a bit of trouble connecting to the neural network. Let's try that again! 🔌" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#0B0D15] flex flex-col animate-in slide-in-from-right duration-300 font-body">
            {/* Header */}
            <header className="relative shrink-0 pt-10 pb-6 px-6 overflow-hidden border-b border-white/5 bg-[#0B0D15]/80 backdrop-blur-xl z-20">
                {/* Background Gradient Mesh */}
                <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-900/20 via-[#0B0D15] to-[#0B0D15] pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                     <div className="flex items-center gap-3 mb-1">
                        <div className="relative size-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
                            <span className="absolute -top-1 -right-1 flex size-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-3 bg-green-500 border-2 border-[#0B0D15]"></span>
                            </span>
                        </div>
                        <h2 className="text-lg font-bold font-display text-white tracking-wide">AI Assistant</h2>
                     </div>
                     <p className="text-slate-400 text-xs font-medium">Online and ready to help</p>
                </div>

                <button 
                    onClick={onClose}
                    className="absolute top-8 left-6 size-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 transition-colors z-20 backdrop-blur-sm"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 bg-gradient-to-b from-[#0B0D15] to-[#0F111A]">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex items-end gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Avatar */}
                            <div className={`size-8 rounded-full flex shrink-0 items-center justify-center shadow-lg border border-white/5 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white'}`}>
                                <span className="material-symbols-outlined text-[16px]">{msg.role === 'user' ? 'person' : 'smart_toy'}</span>
                            </div>

                            {/* Bubble */}
                            <div 
                                className={`rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm transition-all ${
                                    msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-500/10' 
                                        : 'bg-[#1e253e] text-slate-100 border border-white/5 rounded-bl-sm shadow-md'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start w-full">
                         <div className="flex items-end gap-3">
                             <div className="size-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg border border-white/5">
                                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                            </div>
                            <div className="bg-[#1e253e] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-4 shadow-md flex items-center gap-1.5">
                                <span className="size-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="size-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="size-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 pb-8 pt-2 bg-[#0F111A]">
                <form 
                    onSubmit={handleSend}
                    className="relative flex items-center gap-2 bg-[#1A1D2D] rounded-full p-1.5 pl-6 border border-white/5 shadow-xl shadow-black/20 focus-within:border-indigo-500/50 focus-within:bg-[#202435] transition-all group"
                >
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for advice..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-white text-[15px] placeholder-slate-500 font-medium h-10"
                        disabled={isLoading}
                    />
                    
                    <button 
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white size-10 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 active:scale-95 hover:scale-105"
                    >
                         {isLoading ? (
                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                            <span className="material-symbols-outlined text-[20px] ml-0.5">arrow_upward</span>
                         )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatView;