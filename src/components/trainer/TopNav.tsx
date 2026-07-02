"use client";

import * as React from 'react';
import Link from 'next/link';
import { Bell, Search, Menu, UserCircle, LogOut, CheckCheck, CreditCard, Dumbbell, Flame, Megaphone, Clock, Sparkles } from "lucide-react";
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

export default function TrainerTopNav({ onMenuTrigger }: TopNavProps = {}) {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    // Filter notifications for trainer role
    const trainerNotifications = notifications.filter(
        n => n.role === 'trainer'
    );
    const unreadTrainerCount = trainerNotifications.filter(n => !n.isRead).length;

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

    const handleMarkAllRead = () => {
        trainerNotifications.forEach(n => {
            if (!n.isRead) markAsRead(n.id);
        });
    };

    return (
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-900 bg-background/50 backdrop-blur-xl relative z-20">
            {/* Left side - Search */}
            <div className="flex items-center gap-4 flex-1">
                
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-full w-64 md:w-80 group hover:border-slate-300 dark:hover:border-neon-cyan/30 transition-colors focus-within:border-accent/50 dark:focus-within:border-neon-cyan/50 focus-within:ring-1 focus-within:ring-accent/50 dark:focus-within:ring-neon-cyan/50">
                    <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-accent dark:group-focus-within:text-neon-cyan transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/75"
                    />
                </div>
            </div>

            {/* Right side - Actions & Profile */}
            <div className="flex items-center gap-3 sm:gap-5">
                <ThemeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground outline-none">
                            <Bell className="w-5 h-5" />
                            {unreadTrainerCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-background">
                                    {unreadTrainerCount}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 border-slate-200 dark:border-slate-800 bg-background/95 backdrop-blur-xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-900">
                            <DropdownMenuLabel className="font-semibold text-lg p-0">Trainer Notifications</DropdownMenuLabel>
                            {unreadTrainerCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-xs text-cyan-600 dark:text-neon-cyan hover:bg-accent/10 dark:hover:bg-accent/10 border border-transparent"
                                    onClick={handleMarkAllRead}
                                >
                                    <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
                                </Button>
                            )}
                        </div>

                        <ScrollArea className="h-[400px]">
                            {trainerNotifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                                    <Bell className="w-8 h-8 mb-3 opacity-20" />
                                    <p>No new notifications</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {trainerNotifications.map((notification) => (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            className={`flex gap-3 p-4 cursor-pointer focus:bg-black/5 dark:focus:bg-white/5 items-start ${!notification.isRead ? 'bg-accent/5 dark:bg-accent/10' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                markAsRead(notification.id);
                                            }}
                                        >
                                            <div className="mt-0.5 p-2 rounded-full bg-background border border-accent/10 dark:border-accent/20 flex-shrink-0">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 rounded-full bg-accent dark:bg-neon-cyan mt-1.5 ml-2 flex-shrink-0"></span>
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

                        <div className="p-2 border-t border-slate-200 dark:border-slate-900">
                            <Link href="#" className="block w-full">
                                <Button variant="ghost" className="w-full text-sm font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-foreground transition-colors">
                                    View Notification Center
                                </Button>
                            </Link>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-px bg-slate-200 dark:bg-accent/10 hidden sm:block"></div>

                <div className="flex items-center gap-3 group pl-2 sm:pl-0">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-foreground group-hover:text-cyan-600 dark:group-hover:text-neon-cyan transition-colors">{user?.name || 'Coach'}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Coach</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden">
                        <UserCircle className="w-6 h-6 text-accent dark:text-neon-cyan" />
                    </div>
                </div>

                <div className="h-8 w-px bg-accent/10 dark:bg-accent/20 hidden sm:block"></div>

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
