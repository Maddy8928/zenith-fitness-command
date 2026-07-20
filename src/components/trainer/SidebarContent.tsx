"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    LayoutDashboard,
    Dumbbell,
    Flame,
    Users,
    MessageSquare,
    Waves,
    Clock,
    Trophy,
    ShoppingCart,
    Zap,
    Bell,
    Lock,
    Megaphone,
    UserX,
    UserCheck,
    Settings2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import {
    getTrainerCapacity,
    setTrainerCapacity,
    CAPACITY_PRESETS,
    type TrainerCapacity,
    CAPACITY_STORAGE_KEY,
} from '@/lib/trainer-capacity-store';


const navItems = [
    { label: 'Dashboard', href: '/trainer', icon: LayoutDashboard },
    { label: 'Workout Plans', href: '/trainer/workout-plans', icon: Dumbbell },
    { label: 'Diet Plans', href: '/trainer/diet-plans', icon: Flame },
    { label: 'My Members', href: '/trainer/members', icon: Users },
    { label: 'Trainer Capacity', href: '/trainer/capacity', icon: UserCheck },
    { label: 'Member Alerts & Trial Bookings', href: '/trainer/member-alerts', icon: Bell },
    { label: 'Messages', href: '/trainer/messages', icon: MessageSquare },
    { label: 'Wellness Bookings', href: '/trainer/members/bookings', icon: Waves },
    { label: 'Attendance', href: '/trainer/attendance', icon: Clock },
    { label: 'HYROX Management', href: '/trainer/hyrox', icon: Trophy },
    { label: 'Store (POS)', href: '/trainer/store', icon: ShoppingCart },
];


interface SidebarContentProps {
    onItemClick?: () => void;
    variant?: 'sidebar' | 'bottom-sheet';
}

export default function SidebarContent({ onItemClick, variant = 'sidebar' }: SidebarContentProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const { notifications, addNotification } = useNotifications();

    // Capacity State inside Sidebar
    const SELF_TRAINER_ID = 'marcus-johnson';
    const [capacity, setCapacityState] = useState<TrainerCapacity>(() => {
        if (typeof window === 'undefined') return { maxClients: 10, currentClients: 8, slotsOpen: false };
        return getTrainerCapacity(SELF_TRAINER_ID);
    });
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const updateCapacity = useCallback((data: Partial<TrainerCapacity>) => {
        const updated = setTrainerCapacity(SELF_TRAINER_ID, data);
        setCapacityState(updated);
    }, []);

    // Sync capacity from localStorage
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === CAPACITY_STORAGE_KEY) {
                setCapacityState(getTrainerCapacity(SELF_TRAINER_ID));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const availableSlots = Math.max(0, capacity.maxClients - capacity.currentClients);
    const atCapacity = capacity.currentClients >= capacity.maxClients;
    const fillPercent = Math.min(100, (capacity.currentClients / Math.max(1, capacity.maxClients)) * 100);

    const handleSetMaxClients = (val: number) => {
        updateCapacity({ maxClients: val });
    };

    const handleOpenSlots = () => {
        if (atCapacity) { toast.error('You are at full capacity. Free a slot first.'); return; }
        if (capacity.slotsOpen) { toast.info('Open Slots already broadcasted.'); return; }
        setIsBroadcasting(true);
        setTimeout(() => setIsBroadcasting(false), 2000);
        const now = new Date().toISOString();
        updateCapacity({ slotsOpen: true, openSlotsTimestamp: now });
        addNotification({
            role: 'member',
            category: 'ANNOUNCEMENT',
            priority: 'high',
            title: '🟢 Personal Training Slots Available!',
            message: `${user?.name || 'Your trainer'} has opened personal training slots — ${availableSlots} spot${availableSlots !== 1 ? 's' : ''} remaining! Book your trial session now.`,
            metadata: {
                type: 'SLOTS_OPEN',
                trainerId: SELF_TRAINER_ID,
                trainerName: user?.name || 'Your Trainer',
                slotsAvailable: availableSlots,
                timestamp: now,
            }
        });
        toast.success('Open Slots broadcast sent to all members!', {
            description: `${availableSlots} slot${availableSlots !== 1 ? 's' : ''} advertised.`
        });
    };

    const handleCloseSlots = () => {
        updateCapacity({ slotsOpen: false, openSlotsTimestamp: undefined });
        toast.info('Open Slots listing closed.');
    };

    const trainerNotifications = notifications.filter(
        n => n.role === 'trainer'
    );
    const unreadTrainerCount = trainerNotifications.filter(n => !n.isRead).length;

    return (
        <div className={`flex flex-col h-full ${variant === 'bottom-sheet' ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-950 backdrop-blur-md'}`}>
            {/* Logo Section */}
            {variant !== 'bottom-sheet' && (
                <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-900">
                    <Link href="/" className="flex items-center gap-3 group" onClick={onItemClick}>
                        <div className="relative w-8 h-8 rounded-lg bg-slate-100 dark:bg-gradient-to-br dark:from-slate-900 dark:to-black flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-neon-cyan/50 transition-colors shadow-soft dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                            <Zap className="w-4 h-4 text-accent dark:text-neon-cyan" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading font-black text-base tracking-tight leading-none text-foreground dark:text-white">
                                FLEX<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">GYM</span>
                            </span>
                            <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest hidden sm:block mt-1">
                                Trainer Panel
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
                                EXPLORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">TRAINER</span>
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
                        const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/trainer');
                        const Icon = item.icon;

                        return (
                            <div key={item.label} className="w-full">
                                <Link
                                    href={item.href}
                                    onClick={onItemClick}
                                    className={`group flex items-center gap-3.5 transition-all duration-300 relative overflow-hidden ${
                                        variant === 'bottom-sheet'
                                            ? 'px-4 py-3.5 rounded-2xl'
                                            : 'px-3 py-3 rounded-xl'
                                    } ${isActive
                                        ? 'bg-accent/15 text-accent dark:text-neon-cyan dark:bg-accent/15 font-bold'
                                        : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                                    }`}
                                >
                                    {/* Active Shine */}
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent dark:bg-neon-cyan rounded-r-md shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                    )}
                                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span className={`font-body text-sm tracking-widest font-bold flex-1 ${variant === 'bottom-sheet' ? 'uppercase' : 'normal-case'}`}>{item.label}</span>
                                    {item.label === 'Member Alerts & Trial Bookings' && unreadTrainerCount > 0 && (
                                        <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-cyan-900/20 animate-pulse relative z-10 shrink-0">
                                            {unreadTrainerCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Footer or Info */}
            <div className={`border-t border-slate-200 dark:border-slate-900 ${variant === 'bottom-sheet' ? 'p-6' : 'p-4'}`}>
                {variant === 'bottom-sheet' ? (
                    <button 
                        onClick={onItemClick}
                        className="w-full py-4 bg-accent/10 dark:bg-neon-cyan/10 hover:bg-accent/20 dark:hover:bg-neon-cyan/20 border border-accent/30 dark:border-neon-cyan/30 rounded-2xl flex items-center justify-center gap-2 text-accent dark:text-neon-cyan font-bold text-sm uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-black/10"
                    >
                        Close Menu
                    </button>
                ) : (
                    <div className="glass-card rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 p-4 flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Logged in as</p>
                        <p className="text-sm font-bold text-foreground dark:text-white">{user?.name || 'Trainer'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

