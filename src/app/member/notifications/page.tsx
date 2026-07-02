"use client";

import { useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import {
    Bell,
    Calendar,
    CreditCard,
    MessageSquare,
    Tag,
    CheckCircle2,
    Filter,
    MoreHorizontal,
    Trash2,
    Clock,
    Coffee
} from "lucide-react";

// Mock notification data
const initialNotifications = [
    {
        id: 1,
        title: "Upcoming Class Reminder",
        message: "Your HIIT Intensity class with Alex J. starts in 2 hours. Don't forget your water bottle!",
        time: "2 hours ago",
        type: "class",
        read: false,
        actionNeeded: true,
    },
    {
        id: 2,
        title: "Payment Successful",
        message: "Your monthly premium membership fee of ₹7,499 has been successfully processed.",
        time: "Yesterday, 10:30 AM",
        type: "billing",
        read: true,
        actionNeeded: false,
    },
    {
        id: 3,
        title: "New Achievement Unlocked!",
        message: "Congratulations! You've reached a 5-day workout streak. You've earned the 'Consistent Crusher' badge.",
        time: "Yesterday, 8:15 AM",
        type: "system",
        read: false,
        actionNeeded: false,
    },
    {
        id: 4,
        title: "Special Promotion",
        message: "Refer a friend this week and get 50% off your next month's billing. Share your unique code now.",
        time: "Oct 12, 2:00 PM",
        type: "promo",
        read: true,
        actionNeeded: true,
    },
    {
        id: 5,
        title: "Class Schedule Update",
        message: "The Vinyasa Flow class on Friday at 7:00 AM has been moved to Studio B. Instructor remains Sarah W.",
        time: "Oct 10, 4:45 PM",
        type: "class",
        read: true,
        actionNeeded: false,
    },
];

const getNotificationIcon = (type: string) => {
    switch (type) {
        case "class": return <Calendar className="w-5 h-5 text-blue-500" />;
        case "billing": return <CreditCard className="w-5 h-5 text-green-500" />;
        case "promo": return <Tag className="w-5 h-5 text-orange-500" />;
        case "system": return <Bell className="w-5 h-5 text-primary dark:text-gold-glow" />;
        case "cafe": return <Coffee className="w-5 h-5 text-amber-500" />;
        default: return <MessageSquare className="w-5 h-5 text-muted-foreground" />;
    }
};

const getNotificationBg = (type: string) => {
    switch (type) {
        case "class": return "bg-blue-500/10";
        case "billing": return "bg-green-500/10";
        case "promo": return "bg-orange-500/10";
        case "system": return "bg-primary/10 dark:bg-gold-glow/10";
        case "cafe": return "bg-amber-500/10";
        default: return "bg-black/5 dark:bg-white/5";
    }
};

export default function NotificationsPage() {
    const { notifications: allNotifications, markAsRead, removeNotification, markAllAsRead: markAllAsReadContext } = useNotifications();
    const [deletedMockIds, setDeletedMockIds] = useState<string[]>([]);
    const [filter, setFilter] = useState("all");

    const formattedMockNotifications = initialNotifications.map(n => ({
        id: `mock_${n.id}`,
        title: n.title,
        message: n.message,
        time: n.time,
        type: n.type,
        read: n.read,
        actionNeeded: n.actionNeeded
    }));

    const formattedContextNotifications = allNotifications
        .filter(n => n.role === 'member' || n.role === 'all')
        .map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: formatTimeDiff(n.timestamp),
            type: n.category.toLowerCase(),
            read: n.isRead,
            actionNeeded: !!n.actionUrl
        }));

    // Simple helper function to format timestamps for display
    function formatTimeDiff(date: Date): string {
        const diff = Date.now() - new Date(date).getTime();
        if (diff < 60_000) return 'Just now';
        if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
        if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(date));
    }

    const notifications = [
        ...formattedContextNotifications,
        ...formattedMockNotifications.filter(n => !deletedMockIds.includes(n.id))
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = () => {
        markAllAsReadContext();
    };

    const deleteNotification = (id: string) => {
        if (id.startsWith('mock_')) {
            setDeletedMockIds(prev => [...prev, id]);
        } else {
            removeNotification(id);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "unread") return !n.read;
        if (filter === "classes") return n.type === "class" || n.type === "workout" || n.type === "membership";
        if (filter === "billing") return n.type === "billing" || n.type === "payment";
        return true;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-amber-800 dark:text-gold-glow text-sm font-bold border border-primary/30">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Stay updated with your classes, billing, and gym announcements.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-primary/20 bg-slate-50/50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-primary/10 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 dark:text-foreground"
                    >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Mark all as read
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-2xl border border-slate-200 dark:border-primary/10 overflow-hidden bg-charcoal/20 dark:bg-black/20 flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar Filters */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-primary/10 p-6 flex flex-col gap-6">
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Filters</h3>
                        <button
                            onClick={() => setFilter("all")}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${filter === "all" ? 'bg-primary/10 text-amber-800 dark:text-gold-glow font-semibold' : 'text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-foreground'}`}
                        >
                            All Notifications
                            <span className="bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-md text-xs">{notifications.length}</span>
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${filter === "unread" ? 'bg-primary/10 text-amber-800 dark:text-gold-glow font-semibold' : 'text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-foreground'}`}
                        >
                            Unread
                            {unreadCount > 0 && <span className="bg-primary/20 text-amber-800 dark:text-gold-glow px-2 py-0.5 rounded-md text-xs font-bold">{unreadCount}</span>}
                        </button>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-primary/10 w-full"></div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</h3>
                        <button
                            onClick={() => setFilter("classes")}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${filter === "classes" ? 'bg-primary/10 text-amber-800 dark:text-gold-glow font-semibold' : 'text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-foreground'}`}
                        >
                            <Calendar className="w-4 h-4" />
                            Classes
                        </button>
                        <button
                            onClick={() => setFilter("billing")}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${filter === "billing" ? 'bg-primary/10 text-amber-800 dark:text-gold-glow font-semibold' : 'text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-foreground'}`}
                        >
                            <CreditCard className="w-4 h-4" />
                            Billing
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 p-0 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                            <Bell className="w-12 h-12 mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold text-foreground dark:text-white">All caught up!</h3>
                            <p className="text-sm">You don't have any notifications in this category.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-primary/5">
                            {filteredNotifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        if (!notif.read && !notif.id.startsWith('mock_')) {
                                            markAsRead(notif.id);
                                        }
                                    }}
                                    className={`p-6 group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] relative ${!notif.read ? 'bg-primary/[0.02] dark:bg-gold-glow/[0.02] cursor-pointer' : ''}`}
                                >
                                    {/* Unread Indicator */}
                                    {!notif.read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary dark:bg-gold-glow shadow-[0_0_10px_var(--gold)]" />
                                    )}

                                    <div className="flex gap-4">
                                        <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getNotificationBg(notif.type)}`}>
                                            {getNotificationIcon(notif.type)}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start gap-4">
                                                <h4 className={`text-base font-semibold ${!notif.read ? 'text-foreground dark:text-white' : 'text-foreground/80 dark:text-white/80'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {notif.time}
                                                </span>
                                            </div>

                                            <p className={`text-sm leading-relaxed ${!notif.read ? 'text-muted-foreground dark:text-gray-300' : 'text-muted-foreground/70'}`}>
                                                {notif.message}
                                            </p>

                                            {notif.actionNeeded && (
                                                <div className="pt-3">
                                                    <button className="text-sm font-semibold text-amber-800 dark:text-gold-glow hover:underline underline-offset-4">
                                                        View Details
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => deleteNotification(notif.id)}
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
