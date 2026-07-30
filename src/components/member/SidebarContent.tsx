"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, CreditCard, Settings, User, Activity, Zap, ShoppingBag, ClipboardList, Waves, Dumbbell, Trophy, Lock, BellRing } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';

const navItems = [
    { label: 'Dashboard', href: '/member', icon: LayoutDashboard },
    { label: 'Alerts & Bookings', href: '/member/alerts', icon: BellRing, showBadge: true },
    { label: 'My Workouts', href: '/member/plans', icon: ClipboardList, showLock: true },
    { label: 'Classes', href: '/member/schedule', icon: CalendarDays },
    { label: 'HYROX Training', href: '/member/hyrox', icon: Trophy },
    { label: 'Progress', href: '/member/progress', icon: Activity },
    { label: 'Store', href: '/member/store', icon: ShoppingBag },
    { label: 'Steam & Massage', href: '/member/steam-massage', icon: Waves },
    { label: 'Billing', href: '/member/billing', icon: CreditCard },
    { label: 'Profile', href: '/member/profile', icon: User },
    { label: 'Settings', href: '/member/settings', icon: Settings },
];

interface SidebarContentProps {
    onItemClick?: () => void;
    variant?: 'sidebar' | 'bottom-sheet';
}

export default function SidebarContent({ onItemClick, variant = 'sidebar' }: SidebarContentProps) {
    const pathname = usePathname();
    const [isWorkoutsLocked, setIsWorkoutsLocked] = useState(true);
    const [isHyroxLocked, setIsHyroxLocked] = useState(true);
    const [alertBadgeCount, setAlertBadgeCount] = useState(0);
    const { notifications } = useNotifications();

    useEffect(() => {
        const checkLock = () => {
            try {
                const ptRaw = localStorage.getItem('zenith_pt_status');
                const trialsRaw = localStorage.getItem('zenith_trainer_trials');
                const pt = ptRaw ? JSON.parse(ptRaw) : {};
                const trials = trialsRaw ? JSON.parse(trialsRaw) : {};

                const allDone = pt.status === 'paid' || !!pt.paymentCompleted;
                setIsWorkoutsLocked(!allDone);

                const isHyroxActive = localStorage.getItem('zenith_hyrox_membership') === 'active';
                setIsHyroxLocked(!isHyroxActive);

                // Alert badge = pending trials + unread member notifications
                const pendingCount = Object.values(trials).filter((t: any) => t.status === 'pending').length;
                const unreadMemberNotifs = notifications.filter(
                    n => (n.role === 'member' || n.role === 'all') && !n.isRead
                ).length;
                setAlertBadgeCount(pendingCount + unreadMemberNotifs);
            } catch (e) {
                setIsWorkoutsLocked(true);
                setIsHyroxLocked(true);
            }
        };

        checkLock();
        window.addEventListener('storage', checkLock);
        return () => window.removeEventListener('storage', checkLock);
    }, [notifications]);

    return (
        <div className={`flex flex-col h-full ${variant === 'bottom-sheet' ? 'bg-transparent' : 'bg-slate-50 dark:bg-background/40 backdrop-blur-md'}`}>
            {/* Logo Section */}
            {variant !== 'bottom-sheet' && (
                <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-white/10">
                    <Link href="/" className="flex items-center gap-3 group" onClick={onItemClick}>
                        <div className="relative w-8 h-8 rounded-lg bg-slate-900 dark:bg-gradient-to-br dark:from-charcoal dark:to-black flex items-center justify-center border border-white/10 group-hover:border-gold-glow/50 transition-colors shadow-soft dark:shadow-[0_0_15px_hsl(var(--gold)/0.1)]">
                            <Zap className="w-4 h-4 text-primary dark:text-gold-glow" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading font-black text-base tracking-tight leading-none text-foreground dark:text-white">
                                NEXUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">GYM</span>
                            </span>
                            <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest hidden sm:block">
                                Member Portal
                            </span>
                        </div>
                    </Link>
                </div>
            )}

            {/* Navigation Links */}
            <div className={`flex-1 overflow-y-auto space-y-2 ${variant === 'bottom-sheet' ? 'px-6 py-4' : 'px-4 py-6'}`}>
                {variant === 'bottom-sheet' ? (
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <span className="font-heading font-black text-lg tracking-wider text-foreground dark:text-white uppercase italic">
                                EXPLORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">NEXUS</span>
                            </span>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Quick navigation links</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                        Menu
                    </div>
                )}
                
                <div className={variant === 'bottom-sheet' ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : 'space-y-2'}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/member' && pathname.startsWith(`${item.href}/`));
                        const Icon = item.icon;
                        const showLock = ((item as any).showLock && isWorkoutsLocked) || (item.href === '/member/hyrox' && isHyroxLocked);
                        const showBadge = (item as any).showBadge && alertBadgeCount > 0;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={onItemClick}
                                className={`group flex items-center gap-3.5 transition-all duration-300 relative overflow-hidden ${
                                    variant === 'bottom-sheet'
                                        ? 'px-4 py-3.5 rounded-2xl'
                                        : 'px-3 py-3 rounded-xl'
                                } ${isActive
                                    ? 'bg-primary/10 text-primary dark:text-gold-glow font-bold'
                                    : 'text-slate-600 dark:text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-foreground'
                                }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className={`font-body text-sm tracking-widest font-bold flex-1 ${variant === 'bottom-sheet' ? 'uppercase' : 'normal-case'}`}>{item.label}</span>
                                {showBadge && (
                                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary dark:bg-gold-glow text-primary-foreground dark:text-black text-[10px] font-black animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.5)]">
                                        {alertBadgeCount > 9 ? '9+' : alertBadgeCount}
                                    </span>
                                )}
                                {showLock && !showBadge && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/50">
                                        <Lock className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Footer or Info */}
            <div className={`border-t border-slate-200 dark:border-primary/20 ${variant === 'bottom-sheet' ? 'p-6' : 'p-4'}`}>
                {variant === 'bottom-sheet' ? (
                    <button 
                        onClick={onItemClick}
                        className="w-full py-4 bg-primary/10 dark:bg-gold-glow/10 hover:bg-primary/20 dark:hover:bg-gold-glow/20 border border-primary/30 dark:border-gold-glow/30 rounded-2xl flex items-center justify-center gap-2 text-primary dark:text-gold-glow font-bold text-sm uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-black/10"
                    >
                        Close Menu
                    </button>
                ) : (
                    <div className="glass-card rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group">
                        {/* Premium Shine */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle,_hsl(var(--gold)/0.2),_transparent_70%)] rounded-full blur-xl pointer-events-none" />

                        <p className="text-xs text-muted-foreground">Active Plan</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                            <p className="text-sm font-bold text-foreground dark:text-white">Premium VIP</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Renews in 14 days</p>
                    </div>
                )}
            </div>
        </div>
    );
}
