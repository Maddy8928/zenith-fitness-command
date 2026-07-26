"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Users, UserCheck, CreditCard, Settings, Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const managementModules: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Members', href: '/admin/members', icon: Users },
    { label: 'Staff', href: '/admin/staff', icon: UserCheck },
    { label: 'Finance', href: '/admin/finance', icon: CreditCard },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface SidebarContentProps {
    onItemClick?: () => void;
    variant?: 'sidebar' | 'bottom-sheet';
}

export default function SidebarContent({ onItemClick, variant = 'sidebar' }: SidebarContentProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const isReceptionist = user?.role === 'RECEPTIONIST';

    const isLinkActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = isLinkActive(item.href);
        const Icon = item.icon;

        return (
            <Link
                href={item.href}
                onClick={onItemClick}
                className={`group flex items-center gap-3.5 transition-all duration-300 relative overflow-hidden ${
                    variant === 'bottom-sheet'
                        ? 'px-4 py-3.5 rounded-2xl'
                        : 'px-3.5 py-3 rounded-2xl'
                } ${isActive
                    ? 'bg-primary/15 text-primary dark:text-gold-glow font-bold shadow-sm border border-primary/20 dark:border-gold-glow/20'
                    : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground border border-transparent'
                }`}
            >
                {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary dark:bg-gold-glow rounded-r-md shadow-[0_0_10px_var(--gold)]" />
                )}
                <Icon
                    className={`w-5 h-5 transition-transform duration-300 ${
                        isActive
                            ? 'scale-110 text-primary dark:text-gold-glow'
                            : 'group-hover:scale-110'
                    }`}
                />
                <span
                    className={`font-body text-sm tracking-wide font-bold flex-1 ${
                        variant === 'bottom-sheet' ? 'uppercase' : 'normal-case'
                    }`}
                >
                    {item.label}
                </span>
            </Link>
        );
    };

    return (
        <div
            className={`flex flex-col h-full ${
                variant === 'bottom-sheet'
                    ? 'bg-transparent'
                    : 'bg-slate-50 dark:bg-background/40 backdrop-blur-md'
            }`}
        >
            {/* Logo Section */}
            {variant !== 'bottom-sheet' && (
                <div className="h-20 flex-shrink-0 flex items-center px-6 border-b border-primary/5 dark:border-white/10">
                    <Link href="/" className="flex items-center gap-3 group" onClick={onItemClick}>
                        <div className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-gradient-to-br dark:from-charcoal dark:to-black flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-gold-glow/50 transition-colors shadow-soft dark:shadow-[0_0_15px_hsl(var(--gold)/0.15)]">
                            <Zap className="w-5 h-5 text-primary dark:text-gold-glow" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading font-black text-lg tracking-tight leading-none text-foreground dark:text-white">
                                FLEX<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">GYM</span>
                            </span>
                            <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest mt-0.5">
                                Executive Console
                            </span>
                        </div>
                    </Link>
                </div>
            )}

            {/* Navigation Links - Essential Management Modules */}
            <div
                className={`flex-1 overflow-y-auto ${
                    variant === 'bottom-sheet' ? 'px-6 py-4 space-y-4' : 'px-4 py-6 space-y-6'
                }`}
            >
                {variant === 'bottom-sheet' && (
                    <div className="mb-4 flex justify-between items-center">
                        <div>
                            <span className="font-heading font-black text-lg tracking-wider text-foreground dark:text-white uppercase italic">
                                EXECUTIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">CONSOLE</span>
                            </span>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                                Essential Management Modules
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    {variant !== 'bottom-sheet' && (
                        <div className="px-3 pb-2">
                            <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em]">
                                Management Modules
                            </p>
                        </div>
                    )}
                    {managementModules.map((item) => (
                        <NavLink key={item.label} item={item} />
                    ))}
                </div>
            </div>

            {/* Bottom Footer */}
            <div
                className={`flex-shrink-0 border-t border-primary/10 dark:border-primary/20 ${
                    variant === 'bottom-sheet' ? 'p-6' : 'p-4'
                }`}
            >
                {variant === 'bottom-sheet' ? (
                    <button
                        onClick={onItemClick}
                        className="w-full py-4 bg-primary/10 dark:bg-gold-glow/10 hover:bg-primary/20 dark:hover:bg-gold-glow/20 border border-primary/30 dark:border-gold-glow/30 rounded-2xl flex items-center justify-center gap-2 text-primary dark:text-gold-glow font-bold text-sm uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-black/10"
                    >
                        Close Menu
                    </button>
                ) : (
                    <div className="glass-card rounded-2xl p-4 flex flex-col gap-1.5 border border-primary/10">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Role Access
                            </p>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-xs font-heading font-bold text-foreground dark:text-white">
                            {isReceptionist ? 'Receptionist Portal' : 'Gym Owner · Admin'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Executive command level
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
