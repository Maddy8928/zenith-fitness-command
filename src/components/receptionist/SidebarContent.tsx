"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarDays, ShoppingCart, Zap, CreditCard, ClipboardSignature, Settings, Waves } from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/receptionist', icon: LayoutDashboard },
    { label: 'Members', href: '/receptionist/members', icon: Users },
    { label: 'Classes', href: '/receptionist/classes', icon: CalendarDays },
    { label: 'Store (POS)', href: '/receptionist/store', icon: ShoppingCart },
    { label: 'Payments', href: '/receptionist/payments', icon: CreditCard },
    { label: 'Check-ins', href: '/receptionist/checkins', icon: ClipboardSignature },
    { label: 'Therapy Bookings', href: '/receptionist/bookings', icon: Waves },
    { label: 'Settings', href: '/receptionist/settings', icon: Settings },
];

interface SidebarContentProps {
    onItemClick?: () => void;
    variant?: 'sidebar' | 'bottom-sheet';
}

export default function SidebarContent({ onItemClick, variant = 'sidebar' }: SidebarContentProps) {
    const pathname = usePathname();

    return (
        <div className={`flex flex-col h-full ${variant === 'bottom-sheet' ? 'bg-transparent' : 'bg-slate-50 dark:bg-background/40 backdrop-blur-md'}`}>
            {/* Logo Section */}
            {variant !== 'bottom-sheet' && (
                <div className="h-20 flex items-center px-6 border-b border-primary/10 dark:border-primary/20">
                    <Link href="/" className="flex items-center gap-3 group" onClick={onItemClick}>
                        <div className="relative w-8 h-8 rounded-lg bg-slate-100 dark:bg-gradient-to-br dark:from-charcoal dark:to-black flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-gold-glow/50 transition-colors shadow-soft dark:shadow-[0_0_15px_hsl(var(--gold)/0.1)]">
                            <Zap className="w-4 h-4 text-primary dark:text-gold-glow" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading font-black text-base tracking-tight leading-none text-foreground dark:text-white">
                                NEXUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">GYM</span>
                            </span>
                            <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest hidden sm:block">
                                Front Desk
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
                                EXPLORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-neon-cyan">FRONT DESK</span>
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
                        const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/receptionist');
                        const Icon = item.icon;

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
                                    ? 'bg-primary/5 text-primary dark:text-gold-glow font-bold border border-primary/20 shadow-[0_0_15px_hsl(var(--gold)/0.1)]'
                                    : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground border border-transparent'
                                }`}
                            >
                                {/* Active Shine */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary dark:bg-gold-glow rounded-r-md shadow-[0_0_15px_hsl(var(--gold))]" />
                                )}
                                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className={`font-body text-sm tracking-widest font-bold flex-1 whitespace-nowrap truncate ${variant === 'bottom-sheet' ? 'uppercase' : 'normal-case'}`}>{item.label}</span>
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
                    <Link href="/receptionist/profile" onClick={onItemClick} className="rounded-xl border border-slate-200 dark:border-primary/10 bg-slate-100 dark:bg-charcoal/40 p-4 flex flex-col gap-1 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-gold-glow/30 transition-all cursor-pointer group">
                        <p className="text-xs text-muted-foreground group-hover:text-primary dark:group-hover:text-gold-glow transition-colors uppercase tracking-wider font-semibold">Logged in as</p>
                        <p className="text-sm font-bold text-foreground dark:text-white transition-colors">Receptionist</p>
                    </Link>
                )}
            </div>
        </div>
    );
}

