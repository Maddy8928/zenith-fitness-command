/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ZENITH FITNESS — Notification MongoDB Schema (Reference File)
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop this into your Node.js/Express backend when ready.
 * Install: npm install mongoose
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Enums ─────────────────────────────────────────────────────────────────────

const NOTIFICATION_CATEGORIES = [
    'INVENTORY', 'BILLING', 'MEMBER', 'STAFF',
    'SYSTEM', 'PROMO', 'STORE', 'CAFE',
    'MEMBERSHIP', 'PAYMENT', 'WORKOUT', 'DIET', 'ANNOUNCEMENT',
] as const;

const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

const NOTIFICATION_ROLES = [
    'admin', 'store_manager', 'member', 'trainer',
    'receptionist', 'cafe_staff', 'all',
] as const;

// ─── TypeScript Interface (for backend) ────────────────────────────────────────

export interface INotification {
    _id?: string;
    userId?: string;            // Target user (null = broadcast)
    role?: typeof NOTIFICATION_ROLES[number];
    category: typeof NOTIFICATION_CATEGORIES[number];
    type: typeof NOTIFICATION_CATEGORIES[number];  // alias for category
    title: string;
    message: string;
    priority: typeof NOTIFICATION_PRIORITIES[number];
    isRead: boolean;
    createdAt: Date;
    updatedAt?: Date;
    emailSent?: boolean;
    smsSent?: boolean;
    pushSent?: boolean;
    actionLabel?: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
    expiresAt?: Date;           // Auto-delete after this date
}

// ─── Mongoose Schema ───────────────────────────────────────────────────────────
/*
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationDocument extends INotification, Document {}

const NotificationSchema = new Schema<INotificationDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
            default: null,
        },
        role: {
            type: String,
            enum: NOTIFICATION_ROLES,
            default: 'all',
        },
        category: {
            type: String,
            enum: NOTIFICATION_CATEGORIES,
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: NOTIFICATION_CATEGORIES,
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        priority: {
            type: String,
            enum: NOTIFICATION_PRIORITIES,
            default: 'medium',
            index: true,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        emailSent: { type: Boolean, default: false },
        smsSent:   { type: Boolean, default: false },
        pushSent:  { type: Boolean, default: false },
        actionLabel: { type: String, maxlength: 50 },
        actionUrl:   { type: String, maxlength: 200 },
        metadata:    { type: Schema.Types.Mixed },
        expiresAt:   { type: Date, index: { expireAfterSeconds: 0 } }, // TTL index
    },
    {
        timestamps: true, // Adds createdAt + updatedAt automatically
        versionKey: false,
    }
);

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, category: 1 });
NotificationSchema.index({ role: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

// Static methods
NotificationSchema.statics.getUnreadCount = async function(userId: string): Promise<number> {
    return this.countDocuments({ userId, isRead: false });
};

NotificationSchema.statics.markAllReadForUser = async function(userId: string): Promise<void> {
    await this.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
};

NotificationSchema.statics.getForUser = async function(
    userId: string,
    options: { limit?: number; skip?: number; category?: string } = {}
) {
    const { limit = 50, skip = 0, category } = options;
    const query: Record<string, unknown> = { $or: [{ userId }, { userId: null, role: 'all' }] };
    if (category) query.category = category;
    return this.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

export const Notification: Model<INotificationDocument> =
    mongoose.models.Notification ||
    mongoose.model<INotificationDocument>('Notification', NotificationSchema);
*/

// ─── Express API Routes Reference ─────────────────────────────────────────────
/*
import express from 'express';
const router = express.Router();

// GET /api/notifications - Get notifications for current user
router.get('/', authMiddleware, async (req, res) => {
    const { limit = 50, skip = 0, category } = req.query;
    const notifications = await Notification.getForUser(req.user.id, {
        limit: Number(limit), skip: Number(skip), category: category as string,
    });
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    res.json({ notifications, unreadCount });
});

// PATCH /api/notifications/:id/read - Mark single as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
});

// POST /api/notifications/mark-all-read - Mark all as read
router.post('/mark-all-read', authMiddleware, async (req, res) => {
    await Notification.markAllReadForUser(req.user.id);
    res.json({ success: true });
});

// POST /api/notifications - Create notification (internal/admin)
router.post('/', adminMiddleware, async (req, res) => {
    const notification = await Notification.create(req.body);
    // Emit via Socket.io (see notification-socket.ts)
    req.io?.to(`user:${req.body.userId}`).emit('notification:new', notification);
    res.status(201).json(notification);
});

export default router;
*/

export {};
