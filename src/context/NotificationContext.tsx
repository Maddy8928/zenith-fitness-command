'use client';

import React, {
    createContext, useContext, useState, useEffect,
    useCallback, useRef, ReactNode
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationCategory =
    | 'INVENTORY' | 'BILLING' | 'MEMBER' | 'STAFF'
    | 'SYSTEM' | 'PROMO' | 'STORE' | 'CAFE'
    | 'MEMBERSHIP' | 'PAYMENT' | 'WORKOUT' | 'DIET' | 'ANNOUNCEMENT';

export type NotificationType = NotificationCategory; // legacy alias
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationRole = 'admin' | 'store_manager' | 'member' | 'trainer' | 'receptionist' | 'cafe_staff' | 'all';

export interface Notification {
    id: string;
    userId?: string;
    role?: NotificationRole;
    category: NotificationCategory;
    type: NotificationCategory;
    title: string;
    message: string;
    priority: NotificationPriority;
    isRead: boolean;
    timestamp: Date;
    createdAt: Date;
    emailSent?: boolean;
    actionLabel?: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
}

export type AddNotificationPayload = {
    type?: NotificationCategory;
    category?: NotificationCategory;
    title: string;
    message: string;
    priority?: NotificationPriority;
    role?: NotificationRole;
    userId?: string;
    emailSent?: boolean;
    actionLabel?: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
};

export interface InventoryTriggerPayload {
    itemId: string; itemName: string; sku?: string;
    stock?: number; expiryDate?: string | null; batchNo?: string;
}
export interface BillingTriggerPayload {
    invoiceId: string; customerName: string; amount: number;
    department?: string; email?: string;
}
export interface MemberTriggerPayload {
    memberId: string; memberName: string; planName?: string;
    daysLeft?: number; amount?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    totalCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    addNotification: (payload: AddNotificationPayload) => void;
    updateNotificationMetadata: (id: string, metadata: Record<string, unknown>) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    triggerLowStock: (p: InventoryTriggerPayload) => void;
    triggerCriticalStock: (p: InventoryTriggerPayload) => void;
    triggerOutOfStock: (p: InventoryTriggerPayload) => void;
    triggerNearExpiry: (p: InventoryTriggerPayload) => void;
    triggerProductExpired: (p: InventoryTriggerPayload) => void;
    triggerAutoOrder: (p: InventoryTriggerPayload) => void;
    triggerOrderArrived: (p: InventoryTriggerPayload) => void;
    triggerSaleComplete: (p: BillingTriggerPayload) => void;
    triggerPendingBilling: (p: BillingTriggerPayload) => void;
    triggerRefund: (p: BillingTriggerPayload) => void;
    triggerDailySalesReport: (revenue: number, transactions: number) => void;
    triggerMembershipExpiry: (p: MemberTriggerPayload) => void;
    triggerPurchaseConfirmation: (p: MemberTriggerPayload) => void;
    triggerPromoOffer: (title: string, message: string, targetRole?: NotificationRole) => void;
    getByCategory: (category: NotificationCategory) => Notification[];
    getUnreadByCategory: (category: NotificationCategory) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const STORAGE_KEY = 'zenith_smart_notifications';
const LEGACY_KEY = 'zenith_notifications';
const BROADCAST_CHANNEL = 'zenith_notifications_sync';

const generateId = () => `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Omit<Notification, 'id' | 'createdAt'>[] = [
    {
        category: 'INVENTORY', type: 'INVENTORY',
        title: '⚡ Low Stock Alert',
        message: 'Titan Pre-Workout (SKU: NX-PRE-02) is running low — only 12 units remaining.',
        priority: 'high', isRead: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        emailSent: true, actionLabel: 'View Inventory', actionUrl: '/store-manager/inventory',
        role: 'store_manager',
    },
    {
        category: 'INVENTORY', type: 'INVENTORY',
        title: '⚠️ Product Expiring Soon',
        message: 'Titan Pre-Workout (Batch: B-2602) expires in 15 days. Consider clearance pricing.',
        priority: 'high', isRead: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        emailSent: true, actionLabel: 'View Inventory', actionUrl: '/store-manager/inventory',
        role: 'store_manager',
    },
    {
        category: 'BILLING', type: 'BILLING',
        title: '💳 Sale Completed',
        message: 'Invoice INV-2024-001 for Alex Thompson — ₹4,199 confirmed. Payment received.',
        priority: 'low', isRead: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        emailSent: true, actionLabel: 'View Invoice', actionUrl: '/store-manager/billing',
        role: 'store_manager',
    },
    {
        category: 'BILLING', type: 'BILLING',
        title: '⏳ Payment Pending',
        message: 'Invoice INV-2024-003 for David Garcia — ₹7,499 awaiting payment.',
        priority: 'medium', isRead: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        emailSent: false, actionLabel: 'View Invoice', actionUrl: '/store-manager/billing',
        role: 'store_manager',
    },
    {
        category: 'INVENTORY', type: 'INVENTORY',
        title: '🚫 Product Expired',
        message: 'Zenith BCAA Recovery (Batch: B-2509) has expired. Sales halted automatically.',
        priority: 'critical', isRead: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
        emailSent: true, actionLabel: 'View Inventory', actionUrl: '/store-manager/inventory',
        role: 'store_manager',
    },
    {
        category: 'SYSTEM', type: 'SYSTEM',
        title: '📊 Daily Sales Report Ready',
        message: "Today's revenue: ₹14,545 across 5 transactions. Store: ₹11,698 | Cafe: ₹2,847.",
        priority: 'low', isRead: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        emailSent: true, actionLabel: 'View Analytics', actionUrl: '/store-manager/analytics',
        role: 'store_manager',
    },
];

// ─── Provider ─────────────────────────────────────────────────────────────────

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const broadcastRef = useRef<BroadcastChannel | null>(null);
    const didInit = useRef(false);

    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;
        let initial: Notification[] = [];
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                initial = JSON.parse(saved).map((n: Notification) => ({
                    ...n, timestamp: new Date(n.timestamp), createdAt: new Date(n.createdAt || n.timestamp),
                }));
            } catch { /* fall through */ }
        }
        if (!initial.length) {
            const legacy = localStorage.getItem(LEGACY_KEY);
            if (legacy) {
                try {
                    initial = JSON.parse(legacy).map((n: Record<string, unknown>) => ({
                        id: n.id as string || generateId(),
                        category: (n.type as NotificationCategory) || 'SYSTEM',
                        type: (n.type as NotificationCategory) || 'SYSTEM',
                        title: n.title as string, message: n.message as string,
                        priority: 'medium' as NotificationPriority,
                        isRead: n.isRead as boolean,
                        timestamp: new Date(n.timestamp as string),
                        createdAt: new Date(n.timestamp as string),
                        role: 'store_manager' as NotificationRole,
                    }));
                } catch { /* fall through */ }
            }
        }
        if (!initial.length) {
            initial = SEED.map(n => ({ ...n, id: generateId(), createdAt: n.timestamp }));
        }
        setNotifications(initial);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            broadcastRef.current = new BroadcastChannel(BROADCAST_CHANNEL);
            broadcastRef.current.onmessage = (event) => {
                if (event.data?.type === 'SYNC') {
                    setNotifications(event.data.notifications.map((n: Notification) => ({
                        ...n, timestamp: new Date(n.timestamp), createdAt: new Date(n.createdAt),
                    })));
                }
            };
        } catch { /* SSR / unsupported */ }
        return () => { broadcastRef.current?.close(); };
    }, []);

    const persist = useCallback((updated: Notification[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            broadcastRef.current?.postMessage({ type: 'SYNC', notifications: updated });
        } catch { /* storage full */ }
    }, []);

    const addNotification = useCallback((payload: AddNotificationPayload) => {
        const category: NotificationCategory = payload.category || payload.type || 'SYSTEM';
        const newNotif: Notification = {
            id: generateId(), category, type: category,
            title: payload.title, message: payload.message,
            priority: payload.priority ?? 'medium', isRead: false,
            timestamp: new Date(), createdAt: new Date(),
            role: payload.role ?? 'store_manager', userId: payload.userId,
            emailSent: payload.emailSent ?? false,
            actionLabel: payload.actionLabel, actionUrl: payload.actionUrl,
            metadata: payload.metadata,
        };
        setNotifications(prev => { const u = [newNotif, ...prev].slice(0, 200); persist(u); return u; });
    }, [persist]);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => { const u = prev.map(n => n.id === id ? { ...n, isRead: true } : n); persist(u); return u; });
    }, [persist]);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => { const u = prev.map(n => ({ ...n, isRead: true })); persist(u); return u; });
    }, [persist]);

    const updateNotificationMetadata = useCallback((id: string, metadata: Record<string, unknown>) => {
        setNotifications(prev => {
            const u = prev.map(n => n.id === id ? { ...n, metadata: { ...n.metadata, ...metadata } } : n);
            persist(u);
            return u;
        });
    }, [persist]);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => { const u = prev.filter(n => n.id !== id); persist(u); return u; });
    }, [persist]);

    const clearAll = useCallback(() => { setNotifications([]); persist([]); }, [persist]);

    // ─── Inventory Triggers ───────────────────────────────────────────────────

    const triggerLowStock = useCallback((p: InventoryTriggerPayload) => {
        addNotification({
            category: 'INVENTORY', priority: 'high', emailSent: true,
            title: '⚡ Low Stock Alert',
            message: `${p.itemName} (${p.sku || p.itemId}) is running low — only ${p.stock} units remaining.`,
            actionLabel: 'View Inventory', actionUrl: '/store-manager/inventory',
            metadata: { itemId: p.itemId, stock: p.stock },
        });
    }, [addNotification]);

    const triggerCriticalStock = useCallback((p: InventoryTriggerPayload) => {
        addNotification({
            category: 'INVENTORY', priority: 'critical', emailSent: true,
            title: '🚨 Critical Stock Level',
            message: `${p.itemName} has only ${p.stock} unit(s) left. Auto-ordering initiated.`,
            actionLabel: 'View Inventory', actionUrl: '/store-manager/inventory',
            metadata: { itemId: p.itemId, stock: p.stock },
        });
    }, [addNotification]);

    const triggerOutOfStock = useCallback((p: InventoryTriggerPayload) => {
        addNotification({
            category: 'INVENTORY', priority: 'critical', emailSent: true,
            title: '❌ Out of Stock',
            message: `${p.itemName} is completely sold out! Supplier order placed automatically.`,
            actionLabel: 'View Inventory', actionUrl: '/store-manager/inventory',
            metadata: { itemId: p.itemId },
        });
    }, [addNotification]);

    const triggerNearExpiry = useCallback((p: InventoryTriggerPayload) => {
        const days = p.expiryDate
            ? Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / 86_400_000) : '?';
        addNotification({
            category: 'INVENTORY', priority: 'high', emailSent: true,
            title: '⚠️ Product Expiring Soon',
            message: `${p.itemName} (Batch: ${p.batchNo || 'N/A'}) expires in ${days} day(s). Consider clearance pricing.`,
            actionLabel: 'View Inventory', actionUrl: '/store-manager/inventory',
            metadata: { itemId: p.itemId, expiryDate: p.expiryDate, batchNo: p.batchNo },
        });
    }, [addNotification]);

    const triggerProductExpired = useCallback((p: InventoryTriggerPayload) => {
        addNotification({
            category: 'INVENTORY', priority: 'critical', emailSent: true,
            title: '🚫 Product Expired',
            message: `URGENT: ${p.itemName} (Batch: ${p.batchNo || 'N/A'}) has expired. Sales halted automatically.`,
            actionLabel: 'View Inventory', actionUrl: '/store-manager/inventory',
            metadata: { itemId: p.itemId, batchNo: p.batchNo, expiryDate: p.expiryDate },
        });
    }, [addNotification]);

    const triggerAutoOrder = useCallback((p: InventoryTriggerPayload) => {
        addNotification({
            category: 'INVENTORY', priority: 'medium', emailSent: false,
            title: '🔄 Automated Order Placed',
            message: `${p.itemName} hit critical levels (${p.stock} units). Auto order for 100 units placed.`,
            actionLabel: 'View Inventory', actionUrl: '/store-manager/inventory',
            metadata: { itemId: p.itemId, stock: p.stock },
        });
    }, [addNotification]);

    const triggerOrderArrived = useCallback((p: InventoryTriggerPayload) => {
        addNotification({
            category: 'INVENTORY', priority: 'low', emailSent: false,
            title: '✅ Supplier Delivery Arrived',
            message: `100 units of ${p.itemName} received and stock replenished.`,
            actionLabel: 'View Inventory', actionUrl: '/store-manager/inventory',
            metadata: { itemId: p.itemId },
        });
    }, [addNotification]);

    // ─── Billing Triggers ─────────────────────────────────────────────────────

    const triggerSaleComplete = useCallback((p: BillingTriggerPayload) => {
        addNotification({
            category: 'BILLING', priority: 'low', emailSent: true,
            title: '💳 Sale Completed',
            message: `Invoice ${p.invoiceId} for ${p.customerName} — ₹${p.amount.toLocaleString('en-IN')} confirmed.`,
            actionLabel: 'View Invoice', actionUrl: '/store-manager/billing',
            metadata: { invoiceId: p.invoiceId, amount: p.amount, department: p.department },
        });
    }, [addNotification]);

    const triggerPendingBilling = useCallback((p: BillingTriggerPayload) => {
        addNotification({
            category: 'BILLING', priority: 'medium', emailSent: false,
            title: '⏳ Payment Pending',
            message: `Invoice ${p.invoiceId} for ${p.customerName} — ₹${p.amount.toLocaleString('en-IN')} awaiting payment.`,
            actionLabel: 'View Invoice', actionUrl: '/store-manager/billing',
            metadata: { invoiceId: p.invoiceId, amount: p.amount, email: p.email },
        });
    }, [addNotification]);

    const triggerRefund = useCallback((p: BillingTriggerPayload) => {
        addNotification({
            category: 'BILLING', priority: 'medium', emailSent: true,
            title: '↩️ Refund Processed',
            message: `Refund of ₹${p.amount.toLocaleString('en-IN')} issued for Invoice ${p.invoiceId} (${p.customerName}).`,
            actionLabel: 'View Invoice', actionUrl: '/store-manager/billing',
            metadata: { invoiceId: p.invoiceId, amount: p.amount },
        });
    }, [addNotification]);

    const triggerDailySalesReport = useCallback((revenue: number, transactions: number) => {
        addNotification({
            category: 'SYSTEM', priority: 'low', emailSent: true,
            title: '📊 Daily Sales Report Ready',
            message: `Today's summary: ₹${revenue.toLocaleString('en-IN')} revenue across ${transactions} transactions.`,
            actionLabel: 'View Analytics', actionUrl: '/store-manager/analytics',
            metadata: { revenue, transactions, generatedAt: new Date().toISOString() },
        });
    }, [addNotification]);

    // ─── Member Triggers ──────────────────────────────────────────────────────

    const triggerMembershipExpiry = useCallback((p: MemberTriggerPayload) => {
        addNotification({
            category: 'MEMBER', priority: 'medium', emailSent: true,
            title: '🔔 Membership Expiring Soon',
            message: `${p.memberName}'s ${p.planName || 'membership'} expires in ${p.daysLeft} day(s).`,
            role: 'admin', userId: p.memberId,
            metadata: { memberId: p.memberId, planName: p.planName, daysLeft: p.daysLeft },
        });
    }, [addNotification]);

    const triggerPurchaseConfirmation = useCallback((p: MemberTriggerPayload) => {
        addNotification({
            category: 'MEMBER', priority: 'low', emailSent: true,
            title: '🛍️ Purchase Confirmed',
            message: `${p.memberName} purchased ${p.planName || 'an item'} for ₹${(p.amount || 0).toLocaleString('en-IN')}. Receipt emailed.`,
            role: 'member', userId: p.memberId,
            metadata: { memberId: p.memberId, amount: p.amount },
        });
    }, [addNotification]);

    const triggerPromoOffer = useCallback((title: string, message: string, targetRole: NotificationRole = 'member') => {
        addNotification({
            category: 'PROMO', priority: 'medium', emailSent: true,
            title: `🎁 ${title}`, message, role: targetRole,
        });
    }, [addNotification]);

    // ─── Derived ──────────────────────────────────────────────────────────────

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const totalCount = notifications.length;

    const getByCategory = useCallback((category: NotificationCategory) =>
        notifications.filter(n => n.category === category), [notifications]);

    const getUnreadByCategory = useCallback((category: NotificationCategory) =>
        notifications.filter(n => n.category === category && !n.isRead), [notifications]);

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount, totalCount,
            markAsRead, markAllAsRead, addNotification, updateNotificationMetadata, removeNotification, clearAll,
            triggerLowStock, triggerCriticalStock, triggerOutOfStock,
            triggerNearExpiry, triggerProductExpired, triggerAutoOrder, triggerOrderArrived,
            triggerSaleComplete, triggerPendingBilling, triggerRefund, triggerDailySalesReport,
            triggerMembershipExpiry, triggerPurchaseConfirmation, triggerPromoOffer,
            getByCategory, getUnreadByCategory,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};

// ─── Shared utilities ─────────────────────────────────────────────────────────

export const formatTimestamp = (date: Date): string => {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
};

export const getPriorityConfig = (priority: NotificationPriority) => {
    switch (priority) {
        case 'critical': return { color: 'rose',   border: 'border-l-rose-500',   badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',   dot: 'bg-rose-500' };
        case 'high':     return { color: 'orange', border: 'border-l-orange-500', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-500' };
        case 'medium':   return { color: 'amber',  border: 'border-l-amber-500',  badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',  dot: 'bg-amber-400' };
        case 'low':      return { color: 'slate',  border: 'border-l-slate-600',  badge: 'bg-slate-700/60 text-slate-400 border-slate-600',     dot: 'bg-slate-500' };
    }
};

export const getCategoryConfig = (category: NotificationCategory) => {
    switch (category) {
        case 'INVENTORY': return { label: 'Inventory', emoji: '📦', color: 'indigo' };
        case 'BILLING':   return { label: 'Billing',   emoji: '💳', color: 'emerald' };
        case 'MEMBER':    return { label: 'Member',    emoji: '👤', color: 'purple' };
        case 'STAFF':     return { label: 'Staff',     emoji: '👥', color: 'blue' };
        case 'SYSTEM':    return { label: 'System',    emoji: '⚙️', color: 'slate' };
        case 'PROMO':     return { label: 'Promo',     emoji: '🎁', color: 'pink' };
        case 'STORE':     return { label: 'Store',     emoji: '🏪', color: 'indigo' };
        case 'CAFE':      return { label: 'Cafe',      emoji: '☕', color: 'amber' };
        case 'MEMBERSHIP': return { label: 'Membership', emoji: '🪪', color: 'purple' };
        default:          return { label: category,    emoji: '🔔', color: 'slate' };
    }
};
