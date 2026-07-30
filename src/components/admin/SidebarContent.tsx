"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Users, 
    CreditCard, 
    Settings, 
    Zap, 
    Briefcase, 
    ShieldCheck, 
    ChevronRight 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    description: string;
    isActive: (pathname: string) => boolean;
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        description: 'Overview & Analytics',
        isActive: (pathname: string) => pathname === '/admin',
    },
    {
        label: 'Members',
        href: '/admin/members',
        icon: Users,
        description: 'Directory & Attendance',
        isActive: (pathname: string) =>
            pathname === '/admin/members' ||
            pathname.startsWith('/admin/members/') ||
            pathname.startsWith('/admin/classes') ||
            pathname.startsWith('/admin/attendance'),
    },
    {
        label: 'Staff',
        href: '/admin/trainers',
        icon: Briefcase,
        description: 'Trainers & Reception',
        isActive: (pathname: string) =>
            pathname === '/admin/trainers' ||
            pathname.startsWith('/admin/trainers/') ||
            pathname.startsWith('/admin/performance'),
    },
    {
        label: 'Finance',
        href: '/admin/payments',
        icon: CreditCard,
        description: 'Revenue & Payments',
        isActive: (pathname: string) =>
            pathname === '/admin/payments' ||
            pathname.startsWith('/admin/payments/') ||
            pathname.startsWith('/admin/reports'),
    },
    {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'System Preferences',
        isActive: (pathname: string) =>
            pathname === '/admin/settings' ||
            pathname.startsWith('/admin/settings/'),
    },
];

interface SidebarContentProps {
    onItemClick?: () => void;
    variant?: 'sidebar' | 'bottom-sheet';
}

export default function SidebarContent({ onItemClick, variant = 'sidebar' }: SidebarContentProps) {
    const pathname = usePathname();
    const { user } = useAuth();

    const isReceptionist = user?.role === 'RECEPTIONIST';

    return (
        <div className={`flex flex-col h-full ${variant === 'bottom-sheet' ? 'bg-transparent' : 'bg-slate-50 dark:bg-background/40 backdrop-blur-md'}`}>
            {/* Logo Section */}
            {variant !== 'bottom-sheet' && (
                <div className="h-20 flex items-center px-6 border-b border-primary/5 dark:border-white/10">
                    <Link href="/admin" className="flex items-center gap-3 group" onClick={onItemClick}>
                        <div className="relative w-8 h-8 rounded-lg bg-slate-100 dark:bg-gradient-to-br dark:from-charcoal dark:to-black flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-gold-glow/50 transition-colors shadow-soft dark:shadow-[0_0_15px_hsl(var(--gold)/0.1)]">
                            <Zap className="w-4 h-4 text-primary dark:text-gold-glow" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading font-black text-base tracking-tight leading-none text-foreground dark:text-white">
                                NEXUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">GYM</span>
                            </span>
                            <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest hidden sm:block">
                                Management Console
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
                                MANAGEMENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">CONSOLE</span>
                            </span>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Role-Based Admin Modules</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-md bg-primary/10 dark:bg-gold-glow/10 text-primary dark:text-gold-glow font-bold tracking-wider">
                            {isReceptionist ? 'RECEPTIONIST' : 'ADMIN'}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between px-2 mb-3">
                        <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
                            Management Modules
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 dark:bg-gold-glow/10 text-primary dark:text-gold-glow font-bold tracking-wider uppercase">
                            {isReceptionist ? 'RECEPTION' : 'ADMIN'}
                        </span>
                    </div>
                )}
                
                <div className={variant === 'bottom-sheet' ? 'grid grid-cols-1 md:grid-cols-2 gap-2.5' : 'space-y-1.5'}>
                    {navItems.map((item) => {
                        const active = item.isActive(pathname);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={onItemClick}
                                className={`group flex items-center gap-3.5 transition-all duration-300 relative overflow-hidden ${
                                    variant === 'bottom-sheet'
                                        ? 'px-4 py-3.5 rounded-2xl border border-transparent'
                                        : 'px-3.5 py-3 rounded-xl'
                                } ${active
                                    ? 'bg-primary/10 text-primary dark:text-gold-glow font-bold dark:border-gold-glow/20 shadow-sm'
                                    : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                                }`}
                            >
                                {/* Active Shine */}
                                {active && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary dark:bg-gold-glow rounded-r-md shadow-[0_0_10px_var(--gold)]" />
                                )}
                                <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
                                    active 
                                        ? 'bg-primary/15 dark:bg-gold-glow/15 text-primary dark:text-gold-glow' 
                                        : 'bg-black/5 dark:bg-white/5 text-muted-foreground group-hover:text-foreground group-hover:bg-black/10 dark:group-hover:bg-white/10'
                                }`}>
                                    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className={`font-body text-sm tracking-wide font-bold ${variant === 'bottom-sheet' ? 'uppercase' : 'normal-case'}`}>
                                        {item.label}
                                    </span>
                                    {variant !== 'bottom-sheet' && item.description && (
                                        <span className={`text-[11px] truncate font-medium transition-colors ${
                                            active
                                                ? 'text-primary/80 dark:text-gold-glow/70'
                                                : 'text-muted-foreground/70 group-hover:text-muted-foreground'
                                        }`}>
                                            {item.description}
                                        </span>
                                    )}
                                </div>
                                {active && variant !== 'bottom-sheet' && (
                                    <ChevronRight className="w-4 h-4 text-primary dark:text-gold-glow opacity-80 flex-shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Footer or Info */}
            <div className={`border-t border-primary/10 dark:border-primary/20 ${variant === 'bottom-sheet' ? 'p-6' : 'p-4'}`}>
                {variant === 'bottom-sheet' ? (
                    <button 
                        onClick={onItemClick}
                        className="w-full py-4 bg-primary/10 dark:bg-gold-glow/10 hover:bg-primary/20 dark:hover:bg-gold-glow/20 border border-primary/30 dark:border-gold-glow/30 rounded-2xl flex items-center justify-center gap-2 text-primary dark:text-gold-glow font-bold text-sm uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-black/10"
                    >
                        Close Menu
                    </button>
                ) : (
                    <div className="glass-card rounded-xl p-3.5 flex flex-col gap-2 border border-primary/10 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Console Status</span>
                            <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5 pt-1 border-t border-primary/5 dark:border-white/5">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-gold-glow/10 flex items-center justify-center text-primary dark:text-gold-glow flex-shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-foreground dark:text-white leading-tight truncate">
                                    {user?.name || (isReceptionist ? 'Reception Desk' : 'System Administrator')}
                                </span>
                                <span className="text-[10px] text-muted-foreground capitalize truncate">
                                    {isReceptionist ? 'Receptionist' : 'Management Role'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

