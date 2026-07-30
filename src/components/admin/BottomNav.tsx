"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Briefcase, Menu } from 'lucide-react';

interface BottomNavProps {
    onMoreClick?: () => void;
}

export default function AdminBottomNav({ onMoreClick }: BottomNavProps = {}) {
    const pathname = usePathname();

    const items = [
        {
            label: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
            isActive: (path: string) => path === '/admin',
        },
        {
            label: 'Members',
            href: '/admin/members',
            icon: Users,
            isActive: (path: string) =>
                path === '/admin/members' ||
                path.startsWith('/admin/members/') ||
                path.startsWith('/admin/classes') ||
                path.startsWith('/admin/attendance'),
        },
        {
            label: 'Staff',
            href: '/admin/trainers',
            icon: Briefcase,
            isActive: (path: string) =>
                path === '/admin/trainers' ||
                path.startsWith('/admin/trainers/') ||
                path.startsWith('/admin/performance'),
        },
        {
            label: 'Finance',
            href: '/admin/payments',
            icon: CreditCard,
            isActive: (path: string) =>
                path === '/admin/payments' ||
                path.startsWith('/admin/payments/') ||
                path.startsWith('/admin/reports'),
        },
        {
            label: 'More',
            href: '#',
            icon: Menu,
            isMore: true,
        },
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
                            <span className="text-[10px] font-semibold tracking-wider mt-1">{item.label}</span>
                        </button>
                    );
                }

                const active = item.isActive ? item.isActive(pathname) : false;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.label}
                        href={item.href || '#'}
                        className={`flex flex-col items-center justify-center flex-1 h-full py-2 relative transition-all duration-300 ${
                            active
                                ? 'text-primary dark:text-gold-glow scale-105 font-bold'
                                : 'text-slate-500 dark:text-muted-foreground hover:text-slate-800 dark:hover:text-foreground'
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-semibold tracking-wider mt-1">{item.label}</span>
                        {active && (
                            <div className="absolute bottom-1 w-5 h-0.5 bg-primary dark:bg-gold-glow rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}

