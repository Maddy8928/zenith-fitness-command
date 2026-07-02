'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FeedbackRole = 'Receptionist' | 'Trainer' | 'Cafe' | 'Facility';
export type Sentiment = 'Positive' | 'Neutral' | 'Negative';
export type Priority = 'Normal' | 'Urgent';

export interface FeedbackEntry {
    id: string;
    member: string;
    target: string;
    role: FeedbackRole;
    rating: number;
    comment: string;
    date: string;
    sentiment: Sentiment;
    priority: Priority;
    avatar?: string;
}

interface FeedbackContextType {
    feedback: FeedbackEntry[];
    isLoading: boolean;
    addFeedback: (entry: Omit<FeedbackEntry, 'id' | 'date' | 'sentiment' | 'priority' | 'avatar'>) => Promise<void>;
    refreshFeedback: () => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// Initial Mock Data (used if localStorage is empty)
const INITIAL_FEEDBACK: FeedbackEntry[] = [
    {
        id: 'fb-001',
        member: 'Alex Thompson',
        target: 'Sarah Wilson',
        role: 'Receptionist',
        rating: 5,
        comment: 'Sarah was incredibly helpful with my membership upgrade. Fast and professional!',
        date: 'Today, 10:45 AM',
        sentiment: 'Positive',
        priority: 'Normal',
        avatar: 'AT'
    },
    {
        id: 'fb-002',
        member: 'Jessica Miller',
        target: 'Alex Johnson',
        role: 'Trainer',
        rating: 4,
        comment: 'Great leg day session! Alex really pushed me, though the gym was a bit crowded during our peak hour.',
        date: 'Today, 08:30 AM',
        sentiment: 'Positive',
        priority: 'Normal',
        avatar: 'JM'
    },
    {
        id: 'fb-003',
        member: 'David Garcia',
        target: 'Michael Brown',
        role: 'Receptionist',
        rating: 2,
        comment: 'Waited almost 10 minutes at the front desk before anyone noticed me. Not great experience.',
        date: 'Yesterday',
        sentiment: 'Negative',
        priority: 'Urgent',
        avatar: 'DG'
    },
    {
        id: 'fb-006',
        member: 'Sophia Chen',
        target: 'Bjorn Refreshment',
        role: 'Cafe',
        rating: 5,
        comment: 'The Viking Whey shake is amazing! Bjorn also gave me some great tips on post-workout nutrition.',
        date: '3 hours ago',
        sentiment: 'Positive',
        priority: 'Normal',
        avatar: 'SC'
    },
    {
        id: 'fb-007',
        member: 'Marcus Thorne',
        target: 'Cafe Team',
        role: 'Cafe',
        rating: 2,
        comment: 'Wait time for a simple espresso was over 15 minutes. The cafe area was also quite messy.',
        date: 'Yesterday',
        sentiment: 'Negative',
        priority: 'Urgent',
        avatar: 'MT'
    }
];

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
    const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadFeedback = () => {
        const saved = localStorage.getItem('zenith_feedback');
        if (saved) {
            try {
                setFeedback(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse feedback data');
                setFeedback(INITIAL_FEEDBACK);
            }
        } else {
            setFeedback(INITIAL_FEEDBACK);
            localStorage.setItem('zenith_feedback', JSON.stringify(INITIAL_FEEDBACK));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadFeedback();

        // Real-time synchronization across tabs/windows
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'zenith_feedback') {
                loadFeedback();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const addFeedback = async (entry: Omit<FeedbackEntry, 'id' | 'date' | 'sentiment' | 'priority' | 'avatar'>) => {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newEntry: FeedbackEntry = {
            ...entry,
            id: `fb-${Math.random().toString(36).substr(2, 9)}`,
            date: 'Just now',
            sentiment: entry.rating >= 4 ? 'Positive' : entry.rating === 3 ? 'Neutral' : 'Negative',
            priority: entry.rating <= 2 ? 'Urgent' : 'Normal',
            avatar: entry.member.split(' ').map(n => n[0]).join('').toUpperCase()
        };

        const updated = [newEntry, ...feedback];
        setFeedback(updated);
        localStorage.setItem('zenith_feedback', JSON.stringify(updated));
        setIsLoading(false);
    };

    const refreshFeedback = async () => {
        setIsLoading(true);
        // Simulate database fetch
        await new Promise(resolve => setTimeout(resolve, 800));
        loadFeedback();
    };

    return (
        <FeedbackContext.Provider value={{ feedback, isLoading, addFeedback, refreshFeedback }}>
            {children}
        </FeedbackContext.Provider>
    );
};

export const useFeedback = () => {
    const context = useContext(FeedbackContext);
    if (context === undefined) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
};
