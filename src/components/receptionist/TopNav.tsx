"use client";

import Link from 'next/link';
import { Bell, Search, LogOut, CreditCard, Dumbbell, Megaphone, Clock, CheckCheck, Flame, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, NotificationType } from '@/context/NotificationContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import SidebarContent from './SidebarContent';

interface TopNavProps {
    onMenuTrigger?: () => void;
}

export default function TopNav({ onMenuTrigger }: TopNavProps = {}) {
    const { logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useNotifications();

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'MEMBERSHIP': return <Clock className="w-4 h-4 text-rose-500" />;
            case 'PAYMENT': return <CreditCard className="w-4 h-4 text-amber-500" />;
            case 'WORKOUT': return <Dumbbell className="w-4 h-4 text-emerald-500" />;
            case 'DIET': return <Flame className="w-4 h-4 text-orange-500" />;
            case 'ANNOUNCEMENT': return <Megaphone className="w-4 h-4 text-indigo-500" />;
            default: return <Bell className="w-4 h-4 text-slate-500" />;
        }
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
    };

    // Simulate real-time notification testing
    useEffect(() => {
        const timer = setTimeout(() => {
            addNotification({
                type: 'ANNOUNCEMENT',
                title: 'New Member Sign-up',
                message: 'A new member just completed registration at the front desk kiosk.',
            });
        }, 15000); // Trigger after 15s to demonstrate real-time push

        return () => clearTimeout(timer);
    }, [addNotification]);

    return (
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 bg-background/50 backdrop-blur-md border-b border-slate-200 dark:border-primary/20 sticky top-0 z-40">
            {/* Left Side - Search Bar */}
            <div className="flex items-center gap-4 flex-1">

                <div className="relative w-full max-w-md group hidden md:block">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary dark:group-focus-within:text-gold-glow transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search members..."
                        className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-primary/20 rounded-2xl py-2 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 dark:focus:border-gold-glow/50 focus:ring-1 focus:ring-primary/50 dark:focus:ring-gold-glow/50 transition-all placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground outline-none">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 border-slate-200 dark:border-primary/20 bg-background/95 backdrop-blur-xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-primary/10">
                            <DropdownMenuLabel className="font-semibold text-lg p-0">System Notifications</DropdownMenuLabel>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-xs text-amber-800 dark:text-gold-glow hover:bg-primary/10 dark:hover:bg-gold-glow/10 border border-transparent"
                                    onClick={markAllAsRead}
                                >
                                    <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
                                </Button>
                            )}
                        </div>

                        <ScrollArea className="h-[400px]">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                                    <Bell className="w-8 h-8 mb-3 opacity-20" />
                                    <p>No new notifications</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((notification) => (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            className={`flex gap-3 p-4 cursor-pointer focus:bg-black/5 dark:focus:bg-white/5 items-start ${!notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                markAsRead(notification.id);
                                            }}
                                        >
                                            <div className="mt-0.5 p-2 rounded-full bg-background border border-primary/10 dark:border-primary/20 flex-shrink-0">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 rounded-full bg-primary dark:bg-gold-glow mt-1.5 ml-2 flex-shrink-0"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium">
                                                    {formatTime(notification.timestamp)}
                                                </p>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        <div className="p-2 border-t border-slate-200 dark:border-primary/10">
                            <Link href="#" className="block w-full">
                                <Button variant="ghost" className="w-full text-sm font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-foreground transition-colors">
                                    View Notification Center
                                </Button>
                            </Link>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-6 bg-border dark:bg-white/10" />

                <ThemeToggle />

                <div className="w-px h-6 bg-border dark:bg-white/10" />

                <button 
                    onClick={logout} 
                    className="p-2 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                    title="Sign Out"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
