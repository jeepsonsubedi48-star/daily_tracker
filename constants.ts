export const RINGTONE_PRESETS: { id: string; label: string; icon: string }[] = [
    { id: 'classic_beep', label: 'Classic Beep', icon: 'notifications' },
    { id: 'basic_bell', label: 'Basic Bell', icon: 'notifications_active' },
    { id: 'loud_siren', label: 'Loud Siren', icon: 'emergency' },
    { id: 'horizontal', label: 'Horizontal', icon: 'graphic_eq' },
    { id: 'digital_pulse', label: 'Digital Pulse', icon: 'watch' },
    { id: 'cosmic_drop', label: 'Cosmic Drop', icon: 'rocket_launch' },
    { id: 'arcade_up', label: 'Arcade Power Up', icon: 'videogame_asset' },
    { id: 'radar_ping', label: 'Radar Ping', icon: 'radar' },
    { id: 'gentle_chime', label: 'Gentle Chime', icon: 'wind_power' },
    { id: 'industrial_buzz', label: 'Industrial Buzz', icon: 'factory' },
    { id: 'phone_ring', label: 'Old Phone', icon: 'call' },
    { id: 'zap_laser', label: 'Laser Zap', icon: 'flash_on' },
    { id: 'deep_gong', label: 'Deep Gong', icon: 'circle' },
    { id: 'alert_alarm', label: 'Red Alert', icon: 'warning' },
    { id: 'victory_tune', label: 'Victory', icon: 'emoji_events' },
];

export const PREDEFINED_CATEGORIES: string[] = [
    'Work', 'Meeting', 'Email', 'Planning', 'Brainstorming', 'Coding', 'Writing', 'Research', 
    'Gym', 'Workout', 'Yoga', 'Running', 'Meditation', 'Sleep', 'Nap', 'Health',
    'Study', 'Reading', 'Lecture', 'Assignment', 'Homework', 'Review', 'Flashcards', 
    'Cleaning', 'Laundry', 'Cooking', 'Dishes', 'Groceries', 'Gardening', 'Chores',
    'TV', 'Movie', 'Gaming', 'Social', 'Friends', 'Family', 'Music', 'Podcast', 'Leisure',
    'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Coffee', 'Tea', 'Food',
    'Commute', 'Driving', 'Bus', 'Train', 'Travel',
    'Shopping', 'Errands', 'Appointments'
];

export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
    'Health': '#a855f7', // purple-500
    'Study': '#3b82f6', // blue-500
    'Food': '#f97316', // orange-500
    'Travel': '#eab308', // yellow-500
    'Work': '#6366f1', // indigo-500
    'Leisure': '#10b981', // emerald-500
    'Shopping': '#ec4899', // pink-500
    'Social': '#ec4899',
    'Errands': '#ec4899',
    'Meeting': '#6366f1',
    'Gym': '#a855f7',
    'Sleep': '#a855f7'
};

export const getCategoryIcon = (category: string): string => {
    const normalized = category.toLowerCase().trim();
    if (['health', 'fitness', 'gym', 'yoga', 'meditation', 'mindfulness', 'sleep'].some(c => normalized.includes(c))) return 'favorite';
    if (['study', 'school', 'class', 'lecture', 'reading', 'learning', 'coding', 'homework'].some(c => normalized.includes(c))) return 'school';
    if (['food', 'breakfast', 'lunch', 'dinner', 'cooking', 'snack', 'drink'].some(c => normalized.includes(c))) return 'restaurant';
    if (['travel', 'commute', 'bus', 'train', 'drive', 'flight', 'transport'].some(c => normalized.includes(c))) return 'directions_bus';
    if (['work', 'meeting', 'office', 'planning', 'email', 'finance', 'business'].some(c => normalized.includes(c))) return 'work';
    if (['leisure', 'relax', 'game', 'gaming', 'music', 'movie', 'tv', 'social', 'party'].some(c => normalized.includes(c))) return 'weekend';
    if (['shopping', 'errands', 'chores', 'cleaning', 'laundry', 'groceries'].some(c => normalized.includes(c))) return 'shopping_cart';
    return 'label';
};