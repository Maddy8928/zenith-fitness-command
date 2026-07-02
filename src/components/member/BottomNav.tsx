"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BellRing, ClipboardList, CreditCard, Lock, Menu } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface BottomNavProps {
    onMoreClick?: () => void;
}

export default function MemberBottomNav({ onMoreClick }: BottomNavProps = {}) {
    const pathname = usePathname();
    const [isWorkoutsLocked, setIsWorkoutsLocked] = useState(true);
    const [alertBadgeCount, setAlertBadgeCount] = useState(0);
    const { notifications } = useNotifications();

    useEffect(() => {
        const checkLock = () => {
            try {
                const ptRaw = localStorage.getItem('zenith_pt_status');
                const trialsRaw = localStorage.getItem('zenith_trainer_trials');
                const pt = ptRaw ? JSON.parse(ptRaw) : {};
                const trials = trialsRaw ? JSON.parse(trialsRaw) : {};

                const trialCompleted = pt.trialCompleted ||
                    Object.values(trials).some((t: any) => t.status === 'approved' || t.status === 'completed');
                const trainerSelected = pt.trainerSelected || !!localStorage.getItem('zenith_preferred_trainer_id');
                const paymentCompleted = !!pt.paymentCompleted || pt.status === 'paid';
                const trainerApproved = !!pt.trainerApproved || pt.status === 'paid';
                const allDone = pt.status === 'paid' || !!pt.paymentCompleted;
                setIsWorkoutsLocked(!allDone);

                const pendingCount = Object.values(trials).filter((t: any) => t.status === 'pending').length;
                const unreadMemberNotifs = notifications.filter(
                    n => (n.role === 'member' || n.role === 'all') && !n.isRead
                ).length;
                setAlertBadgeCount(pendingCount + unreadMemberNotifs);
            } catch (e) {
                setIsWorkoutsLocked(true);
            }
        };

        checkLock();
        window.addEventListener('storage', checkLock);
        return () => window.removeEventListener('storage', checkLock);
    }, [notifications]);

    const items = [
        { label: 'Dashboard', href: '/member', icon: LayoutDashboard },
        { label: 'Alerts', href: '/member/alerts', icon: BellRing, showBadge: true },
        { label: 'Workouts', href: '/member/plans', icon: ClipboardList, showLock: true },
        { label: 'Billing', href: '/member/billing', icon: CreditCard },
        { label: 'More', href: '#', icon: Menu, isMore: true },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-white/10 lg:hidden flex justify-around items-center z-40 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
            {items.map((item) => {
                if (item.isMore) {
                    return (
                        <button
                            key={item.label}
                            onClick={onMoreClick}
                            className="flex flex-col items-center justify-center flex-1 h-full py-2 relative transition-all duration-300 text-slate-500 dark:text-muted-foreground hover:text-slate-800 dark:hover:text-foreground"
                        >
                            <Menu className="w-5 h-5" />
                            <span className="text-[10px] font-bold tracking-wider mt-1">{item.label}</span>
                        </button>
                    );
                }

                const isActive = pathname === item.href || (item.href !== '/member' && pathname.startsWith(item.href));
                const Icon = item.icon;
                const showLock = item.showLock && isWorkoutsLocked;
                const showBadge = item.showBadge && alertBadgeCount > 0;

                return (
                    <Link
                        key={item.label}
                        href={item.href || '#'}
                        className={`flex flex-col items-center justify-center flex-1 h-full py-2 relative transition-all duration-300 ${
                            isActive
                                ? 'text-primary dark:text-gold-glow scale-105'
                                : 'text-slate-500 dark:text-muted-foreground hover:text-slate-800 dark:hover:text-foreground'
                        }`}
                    >
                        <div className="relative">
                            <Icon className="w-5 h-5" />
                            {showBadge && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white border-2 border-white dark:border-slate-950">
                                    {alertBadgeCount > 9 ? '9+' : alertBadgeCount}
                                </span>
                            )}
                            {showLock && (
                                <div className="absolute -bottom-1 -right-1.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-0.5 flex items-center justify-center">
                                    <Lock className="w-2 h-2 text-slate-500" />
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-bold tracking-wider mt-1">{item.label}</span>
                        {isActive && (
                            <div className="absolute bottom-1 w-5 h-0.5 bg-primary dark:bg-gold-glow rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
