"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, CreditCard, Settings } from 'lucide-react';

interface BottomNavProps {
    onMoreClick?: () => void;
}

export default function AdminBottomNav({ onMoreClick }: BottomNavProps = {}) {
    const pathname = usePathname();

    const items = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Members', href: '/admin/members', icon: Users },
        { label: 'Staff', href: '/admin/staff', icon: UserCheck },
        { label: 'Finance', href: '/admin/finance', icon: CreditCard },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    const isLinkActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 lg:hidden flex justify-around items-center z-40 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
            {items.map((item) => {
                const isActive = isLinkActive(item.href);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex flex-col items-center justify-center flex-1 h-full py-2 relative transition-all duration-300 ${
                            isActive
                                ? 'text-primary dark:text-gold-glow scale-105 font-bold'
                                : 'text-slate-500 dark:text-muted-foreground hover:text-slate-800 dark:hover:text-foreground'
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-semibold tracking-wider mt-1">{item.label}</span>
                        {isActive && (
                            <div className="absolute bottom-1 w-5 h-0.5 bg-primary dark:bg-gold-glow rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
