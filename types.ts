export type Category = string;

export interface Task {
    id: string;
    title: string;
    time: string;
    completed: boolean;
    category: Category;
    completedAt?: string;
    hasAlarm?: boolean;
    ringtoneId?: string; // Specific ringtone ID for this task
    customRingtone?: string; // Specific custom base64 audio for this task
    duration?: string; // e.g. "30 min", "1 hr"
}

export enum NavTab {
    TODAY = 'Today',
    STATS = 'Stats',
    PROFILE = 'Profile'
}

export interface DailyReport {
    id: string;
    date: string;
    content: string;
    headline?: string;
}

export interface WeeklyReport {
    id: string;
    range: string;
    title: string;
    insight: string;
    rating: string;
    date: string;
}