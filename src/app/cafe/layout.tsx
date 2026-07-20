'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationProvider, useNotifications, formatTimestamp, getPriorityConfig, getCategoryConfig } from '@/context/NotificationContext';
import {
    LayoutDashboard, Coffee, Settings, Bell, LogOut, Users, 
    CheckCheck, Receipt, BarChart3, BellOff, ShoppingBag,
    Mail, X, ArrowRight, BellRing, Utensils, Package, Truck, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter as useNextRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';

// ─── Enhanced Notification Bell ───────────────────────────────────────────────

type BellTab = 'all' | 'CAFE' | 'BILLING' | 'SYSTEM';

const SmartNotificationBell = () => {
    const router = useNextRouter();
    const { notifications, unreadCount, markAsRead, markAllAsRead, getByCategory } = useNotifications();
    const [bellTab, setBellTab] = useState<BellTab>('all');
    const [open, setOpen] = useState(false);

    const displayed = bellTab === 'all' ? notifications : getByCategory(bellTab as any);
    const preview = displayed.slice(0, 15);

    const bellTabs: { key: BellTab; label: string; emoji: string }[] = [
        { key: 'all', label: 'All', emoji: '🔔' },
        { key: 'CAFE', label: 'Cafe', emoji: '☕' },
        { key: 'BILLING', label: 'Sales', emoji: '💳' },
        { key: 'SYSTEM', label: 'System', emoji: '⚙️' },
    ];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="relative p-2.5 rounded-full hover:bg-white/5 transition-colors group">
                    <Bell className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-slate-950 shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-96 p-0 bg-slate-900 border-white/10 shadow-2xl mr-4 rounded-2xl overflow-hidden" align="end" sideOffset={8}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-indigo-400" />
                        <h3 className="font-black text-white text-sm uppercase tracking-wider">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px] px-1.5 py-0">
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={() => markAllAsRead()}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold uppercase tracking-widest transition-colors">
                            <CheckCheck className="w-3 h-3" /> Mark all
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-black/10">
                    {bellTabs.map(t => (
                        <button key={t.key} onClick={() => setBellTab(t.key)}
                            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                bellTab === t.key
                                    ? 'text-indigo-300 border-b-2 border-indigo-500'
                                    : 'text-slate-500 hover:text-slate-300'
                            }`}>
                            {t.emoji} {t.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <ScrollArea className="h-[360px]">
                    {preview.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                            <BellOff className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-xs font-bold">No notifications</p>
                        </div>
                    ) : preview.map((n) => {
                        const pc = getPriorityConfig(n.priority);
                        return (
                            <div key={n.id}
                                className={`px-4 py-3.5 border-b border-white/[0.04] border-l-2 ${pc?.border} flex gap-3 hover:bg-white/[0.02] transition-colors group cursor-default`}>
                                <div className={`w-9 h-9 rounded-xl ${pc?.badge} flex items-center justify-center text-xs shrink-0 group-hover:scale-110 transition-transform`}>
                                    {getCategoryConfig(n.category).emoji}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`text-[10px] font-black uppercase tracking-tighter text-${pc?.color || 'slate'}-400`}>{n.priority}</span>
                                        <span className="text-[9px] text-slate-500 font-bold">{formatTimestamp(n.timestamp)}</span>
                                    </div>
                                    <p className="text-xs font-bold text-white mb-0.5">{n.title}</p>
                                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{n.message}</p>
                                </div>
                            </div>
                        );
                    })}
                </ScrollArea>

                <div className="p-3 bg-black/40 border-t border-white/5">
                    <button onClick={() => { router.push('/cafe/notifications'); setOpen(false); }}
                        className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                        View All Notifications <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

// ─── Top Bar ──────────────────────────────────────────────────────────────────

const CafeTopBar = ({ onMenuTrigger }: { onMenuTrigger?: () => void }) => {
    const { user, logout } = useAuth();
    return (
        <header className="h-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-3xl flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-wide">CAFE <span className="text-indigo-400 not-italic">COMMAND</span></h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Live Kitchen & Sales Management</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <SmartNotificationBell />
                <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        {user?.name?.charAt(0) || 'C'}
                    </div>
                    <div className="hidden md:block mr-2">
                        <p className="text-sm font-bold text-white leading-none">{user?.name || 'Cafe Staff'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.role?.replace('_', ' ') || 'CAFE WORKER'}</p>
                    </div>
                    <button onClick={logout}
                        className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all flex items-center justify-center active:scale-95 shadow-lg shadow-rose-950/20" title="Sign Out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function CafeLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isLoading } = useAuth();

    React.useEffect(() => {
        if (!isLoading && !user) { router.push('/login'); }
        else if (!isLoading && user && user.role !== 'CAFE_WORKER' && user.role !== 'ADMIN') { router.push('/member'); }
    }, [user, isLoading, router]);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/cafe' },
        { name: 'Analytics', icon: BarChart3, path: '/cafe/analytics' },
        { name: 'Menu', icon: Utensils, path: '/cafe/menu' },
        { name: 'Inventory', icon: Package, path: '/cafe/inventory' },
        { name: 'Procurement', icon: Truck, path: '/cafe/procurement' },
        { name: 'Orders', icon: ShoppingBag, path: '/cafe/orders' },
        { name: 'Billing', icon: Receipt, path: '/cafe/billing' },
        { name: 'Customers', icon: Users, path: '/cafe/customers' },
        { name: 'Settings', icon: Settings, path: '/cafe/settings' },
    ];

    if (isLoading || !user) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black italic">
            LOADING CAFE COMMAND...
        </div>
    );

    return (
        <NotificationProvider>
            <LayoutInner pathname={pathname} router={router} user={user} logout={logout} navItems={navItems}>
                {children}
            </LayoutInner>
        </NotificationProvider>
    );
}

function LayoutInner({
    children, pathname, router, user, logout, navItems
}: {
    children: React.ReactNode;
    pathname: string;
    router: ReturnType<typeof useRouter>;
    user: any;
    logout: () => void;
    navItems: { name: string; icon: any; path: string; showBadge?: boolean }[];
}) {
    const { unreadCount } = useNotifications();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isBottomMenuOpen, setIsBottomMenuOpen] = useState(false);

    const bottomNavItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/cafe' },
        { name: 'Menu', icon: Utensils, path: '/cafe/menu' },
        { name: 'Inventory', icon: Package, path: '/cafe/inventory' },
        { name: 'Orders', icon: ShoppingBag, path: '/cafe/orders' },
        { name: 'More', icon: Menu, path: '#', isMore: true },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
            {/* Ambient background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen" />
            </div>

            {/* Sidebar */}
            <aside className="w-72 bg-black/40 backdrop-blur-2xl border-r border-white/5 hidden lg:flex flex-col relative z-20">
                <div className="h-20 flex items-center px-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                            <Coffee className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white uppercase italic">
                            Flex<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Cafe</span>
                        </span>
                    </div>
                </div>

                <div className="p-4 flex-1 space-y-1 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path !== '/cafe' && pathname.startsWith(item.path));
                        return (
                            <button key={item.name} onClick={() => router.push(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/5 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]'
                                        : 'hover:bg-white/[0.02] border border-transparent'
                                }`}>
                                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                    {item.name}
                                </span>
                                {item.showBadge && unreadCount > 0 && (
                                    <span className="ml-auto min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5 shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div layoutId="activeNavIndicator"
                                        className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/5">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all group">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-wide">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                <CafeTopBar onMenuTrigger={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto custom-scrollbar pb-20 lg:pb-0">
                    {children}
                </main>
                
                {/* Bottom Nav on Mobile */}
                <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-lg border-t border-white/5 lg:hidden flex justify-around items-center z-40 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                    {bottomNavItems.map((item) => {
                        if (item.isMore) {
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => setIsBottomMenuOpen(true)}
                                    className="flex flex-col items-center justify-center flex-1 h-full py-2 relative transition-all duration-350 text-slate-500 hover:text-slate-355"
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-[10px] font-semibold tracking-wider mt-1">{item.name}</span>
                                </button>
                            );
                        }
                        const isActive = pathname === item.path || (item.path !== '/cafe' && pathname.startsWith(item.path));
                        return (
                            <button
                                key={item.name}
                                onClick={() => router.push(item.path)}
                                className={`flex flex-col items-center justify-center flex-1 h-full py-2 relative transition-all duration-350 ${
                                    isActive
                                        ? 'text-indigo-400 scale-105 font-bold'
                                        : 'text-slate-500 hover:text-slate-355'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-[10px] font-semibold tracking-wider mt-1">{item.name}</span>
                                {isActive && (
                                    <div className="absolute bottom-1 w-5 h-0.5 bg-indigo-400 rounded-full shadow-[0_0_8px_#6366f1]" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Left Sidebar Drawer (Top Nav Hamburger) */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-72 bg-slate-950 border-r border-white/5 text-slate-50">
                    <div className="sr-only">
                        <SheetTitle>Menu</SheetTitle>
                        <SheetDescription>Navigation links for the cafe portal</SheetDescription>
                    </div>
                    <div className="flex flex-col h-full bg-black/40 backdrop-blur-2xl">
                        <div className="h-20 flex items-center px-8 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                                    <Coffee className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xl font-black tracking-tight text-white uppercase italic">
                                    Flex<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Cafe</span>
                                </span>
                            </div>
                        </div>

                        <div className="p-4 flex-1 space-y-1 mt-4 overflow-y-auto">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path || (item.path !== '/cafe' && pathname.startsWith(item.path));
                                return (
                                    <button key={item.name} onClick={() => { router.push(item.path); setIsMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                                            isActive
                                                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/5 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]'
                                                : 'hover:bg-white/[0.02] border border-transparent'
                                        }`}>
                                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                        <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {item.name}
                                        </span>
                                        {item.showBadge && unreadCount > 0 && (
                                            <span className="ml-auto min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5 shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                        {isActive && (
                                            <motion.div layoutId="activeNavIndicatorMobile"
                                                className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-4 border-t border-white/5">
                            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all group">
                                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-bold tracking-wide">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Bottom Sheet Drawer (Bottom Nav More Button) */}
            <Sheet open={isBottomMenuOpen} onOpenChange={setIsBottomMenuOpen}>
                <SheetContent side="bottom" className="p-0 rounded-t-[2rem] border-t border-white/5 bg-slate-950 text-slate-50 max-h-[85vh] overflow-hidden flex flex-col">
                    <div className="sr-only">
                        <SheetTitle>Explore Menu</SheetTitle>
                        <SheetDescription>Bottom sheet navigation links for the cafe portal</SheetDescription>
                    </div>
                    <div className="flex flex-col h-full bg-black/40 backdrop-blur-2xl">
                        <div className="px-6 pt-6 pb-4 flex justify-between items-center">
                            <div>
                                <span className="font-heading font-black text-lg tracking-wider text-white uppercase italic">
                                    EXPLORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CAFE</span>
                                </span>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Quick navigation links</p>
                            </div>
                        </div>

                        <div className="p-6 flex-1 space-y-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path || (item.path !== '/cafe' && pathname.startsWith(item.path));
                                return (
                                    <button key={item.name} onClick={() => { router.push(item.path); setIsBottomMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                                            isActive
                                                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/5 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] text-white font-bold'
                                                : 'hover:bg-white/[0.02] border border-transparent text-slate-400 hover:text-white'
                                        }`}>
                                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                        <span className="text-sm font-bold tracking-widest uppercase">
                                            {item.name}
                                        </span>
                                        {item.showBadge && unreadCount > 0 && (
                                            <span className="ml-auto min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5 shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-6 border-t border-white/5">
                            <button 
                                onClick={() => setIsBottomMenuOpen(false)}
                                className="w-full py-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-black/10"
                            >
                                Close Menu
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

