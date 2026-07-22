"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, Flame, Users, Bell, Menu } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface BottomNavProps {
    onMoreClick?: () => void;
}

export default function TrainerBottomNav({ onMoreClick }: BottomNavProps = {}) {
    const pathname = usePathname();
    const [unreadTrainerCount, setUnreadTrainerCount] = useState(0);
    const { notifications } = useNotifications();

    useEffect(() => {
        const trainerNotifications = notifications.filter(
            n => n.role === 'trainer'
        );
        const unreadCount = trainerNotifications.filter(n => !n.isRead).length;
        setUnreadTrainerCount(unreadCount);
    }, [notifications]);

    const items = [
        { label: 'Dashboard', href: '/trainer', icon: LayoutDashboard },
        { label: 'Workouts', href: '/trainer/workout-plans', icon: Dumbbell },
        { label: 'Diets', href: '/trainer/diet-plans', icon: Flame },
        { label: 'Alerts', href: '/trainer/member-alerts', icon: Bell, showBadge: true },
        { label: 'More', href: '#', icon: Menu, isMore: true },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 lg:hidden flex justify-around items-center z-40 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
            {items.map((item) => {
                if (item.isMore) {
                    return (
                        <button
                            key={item.label}
                            onClick={onMoreClick}
                            className="flex flex-col items-center justify-center flex-1 h-full py-2 relative transition-all duration-300 text-slate-500 dark:text-muted-foreground hover:text-slate-350 hover:text-foreground"
                        >
                            <Menu className="w-5 h-5" />
                            <span className="text-[10px] font-semibold tracking-wider mt-1">{item.label}</span>
                        </button>
                    );
                }

                const isActive = pathname === item.href || (item.href !== '/trainer' && pathname.startsWith(item.href));
                const Icon = item.icon;
                const showBadge = item.showBadge && unreadTrainerCount > 0;

                return (
                    <Link
                        key={item.label}
                        href={item.href || '#'}
                        className={`flex flex-col items-center justify-center flex-1 h-full py-2 relative transition-all duration-300 ${
                            isActive
                                ? 'text-cyan-400 scale-105 font-bold'
                                : 'text-slate-500 dark:text-muted-foreground hover:text-slate-300 hover:text-foreground'
                        }`}
                    >
                        <div className="relative">
                            <Icon className="w-5 h-5" />
                            {showBadge && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-black text-slate-950 border-2 border-slate-900">
                                    {unreadTrainerCount > 9 ? '9+' : unreadTrainerCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-semibold tracking-wider mt-1">{item.label}</span>
                        {isActive && (
                            <div className="absolute bottom-1 w-5 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
