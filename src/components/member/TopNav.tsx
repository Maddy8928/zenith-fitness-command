"use client";

import * as React from 'react';
import Link from 'next/link';
import { Bell, Search, Menu, UserCircle, CreditCard, Dumbbell, Megaphone, Clock, CheckCheck, Flame, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
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
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import SidebarContent from './SidebarContent';

interface TopNavProps {
    onMenuTrigger?: () => void;
}

export default function MemberTopNav({ onMenuTrigger }: TopNavProps = {}) {
    const { user, logout } = useAuth();
    const { notifications: allNotifications, markAsRead, markAllAsRead } = useNotifications();
    const notifications = allNotifications.filter(n => n.role === 'member' || n.role === 'all');
    const unreadCount = notifications.filter(n => !n.isRead).length;

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

    return (
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-primary/20 bg-background/50 backdrop-blur-xl relative z-20">
            {/* Left side - Search */}
            <div className="flex items-center gap-4 flex-1">
                
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-primary/20 rounded-full w-64 md:w-80 group hover:border-slate-300 dark:hover:border-gold-glow/30 transition-colors focus-within:border-primary/50 dark:focus-within:border-gold-glow/50 focus-within:ring-1 focus-within:ring-primary/50 dark:focus-within:ring-gold-glow/50">
                    <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary dark:group-focus-within:text-gold-glow transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/70"
                    />
                </div>
            </div>

            {/* Right side - Actions & Profile */}
            <div className="flex items-center gap-3 sm:gap-5">
                <ThemeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative p-2 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors hover:text-foreground outline-none">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-background">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 border-slate-200 dark:border-primary/20 bg-background/95 backdrop-blur-xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-primary/10">
                            <DropdownMenuLabel className="font-semibold text-lg p-0">Notifications</DropdownMenuLabel>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-xs text-amber-800 dark:text-gold-glow hover:bg-primary/10 dark:hover:bg-gold-glow/10"
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
                                    <p>You're all caught up!</p>
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
                                                {notification.metadata?.type === 'TRIAL_RESCHEDULED' && (
                                                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                                                        <Link href="/member/alerts">
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 hover:bg-amber-500/30">
                                                                Action Needed: Accept / Decline →
                                                            </span>
                                                        </Link>
                                                    </div>
                                                )}
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
                            <Link href="/member/notifications" className="block w-full">
                                <Button variant="ghost" className="w-full text-sm font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-foreground transition-colors">
                                    View Full History
                                </Button>
                            </Link>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-px bg-slate-200 dark:bg-primary/20 hidden sm:block"></div>

                <div className="flex items-center gap-3 group pl-2 sm:pl-0">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-foreground group-hover:text-amber-800 dark:group-hover:text-gold-glow transition-colors">{user?.name || 'Alex Johnson'}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Member</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center overflow-hidden">
                        <UserCircle className="w-6 h-6 text-primary dark:text-gold-glow" />
                    </div>
                </div>

                <div className="h-8 w-px bg-primary/10 dark:bg-primary/20 hidden sm:block"></div>

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
