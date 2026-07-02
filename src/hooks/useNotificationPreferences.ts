'use client';

import { useState, useCallback, useEffect } from 'react';
import type { NotificationCategory } from '@/context/NotificationContext';

export interface NotificationPreferences {
    // Thresholds
    lowStockThreshold: number;
    expiryWarningDays: number;
    // Channel toggles
    emailEnabled: boolean;
    smsEnabled: boolean;  // future
    pushEnabled: boolean; // future
    // Category toggles
    enabledCategories: Record<NotificationCategory, boolean>;
    // Schedule
    dailyReportEnabled: boolean;
    dailyReportTime: string; // "HH:MM"
    promoAlertsEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
    lowStockThreshold: 15,
    expiryWarningDays: 30,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    enabledCategories: {
        INVENTORY: true,
        BILLING: true,
        MEMBER: true,
        STAFF: true,
        SYSTEM: true,
        PROMO: true,
        STORE: true,
        CAFE: true,
        MEMBERSHIP: true,
        PAYMENT: true,
        WORKOUT: true,
        DIET: true,
        ANNOUNCEMENT: true,
    },
    dailyReportEnabled: true,
    dailyReportTime: '09:00',
    promoAlertsEnabled: true,
};

const STORAGE_KEY = 'zenith_notification_prefs';

export function useNotificationPreferences() {
    const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setPrefs(prev => ({
                    ...prev,
                    ...parsed,
                    enabledCategories: {
                        ...prev.enabledCategories,
                        ...(parsed.enabledCategories || {}),
                    },
                }));
            }
        } catch { /* corrupted storage */ }
        setLoaded(true);
    }, []);

    const updatePrefs = useCallback((updates: Partial<NotificationPreferences>) => {
        setPrefs(prev => {
            const next = { ...prev, ...updates };
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage full */ }
            return next;
        });
    }, []);

    const toggleCategory = useCallback((category: NotificationCategory) => {
        setPrefs(prev => {
            const next = {
                ...prev,
                enabledCategories: {
                    ...prev.enabledCategories,
                    [category]: !prev.enabledCategories[category],
                },
            };
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage full */ }
            return next;
        });
    }, []);

    const resetToDefaults = useCallback(() => {
        setPrefs(DEFAULT_PREFERENCES);
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }, []);

    return { prefs, updatePrefs, toggleCategory, resetToDefaults, loaded };
}
