/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ZENITH FITNESS — Socket.io Real-time Notification Reference (Node.js Backend)
 * ─────────────────────────────────────────────────────────────────────────────
 * This file shows exactly how to wire Socket.io into your Express + MongoDB
 * backend for real-time notification delivery.
 * Install: npm install socket.io @types/socket.io
 * ─────────────────────────────────────────────────────────────────────────────
 */

/*
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

// ─── Socket.io Server Setup (attach to your Express HTTP server) ──────────────

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
    });

    // ─── Auth Middleware ──────────────────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) return next(new Error('Authentication required'));
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
            socket.data.userId = decoded.id;
            socket.data.role = decoded.role;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    // ─── Connection Handler ───────────────────────────────────────────────────
    io.on('connection', (socket: Socket) => {
        const { userId, role } = socket.data;
        console.log(`[Socket] User connected: ${userId} (${role})`);

        // Join personal room + role room
        socket.join(`user:${userId}`);
        socket.join(`role:${role}`);
        socket.join(`role:all`);

        // ─── Client Events ────────────────────────────────────────────────────

        // Mark single notification as read
        socket.on('notification:markRead', async (notificationId: string) => {
            // await Notification.findByIdAndUpdate(notificationId, { isRead: true });
            socket.emit('notification:readConfirmed', notificationId);
        });

        // Mark all as read
        socket.on('notification:markAllRead', async () => {
            // await Notification.markAllReadForUser(userId);
            socket.emit('notification:allReadConfirmed');
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${userId}`);
        });
    });

    return io;
}

// ─── Notification Emitter Service ─────────────────────────────────────────────
// Use this service in your controllers to emit real-time notifications

export class NotificationEmitter {
    private io: SocketIOServer;

    constructor(io: SocketIOServer) { this.io = io; }

    // Emit to a specific user
    emitToUser(userId: string, notification: unknown) {
        this.io.to(`user:${userId}`).emit('notification:new', notification);
    }

    // Emit to all users with a specific role
    emitToRole(role: string, notification: unknown) {
        this.io.to(`role:${role}`).emit('notification:new', notification);
    }

    // Broadcast to all connected users
    broadcast(notification: unknown) {
        this.io.to(`role:all`).emit('notification:new', notification);
    }

    // Update unread count for a user
    updateUnreadCount(userId: string, count: number) {
        this.io.to(`user:${userId}`).emit('notification:unreadCount', count);
    }
}

// ─── Usage in Express Controller ──────────────────────────────────────────────
//
// import { NotificationEmitter } from './notification-socket';
// import { Notification } from './notification-schema';
//
// // In your inventory controller:
// async function onLowStockDetected(req, res) {
//     const item = await InventoryItem.findById(req.params.id);
//     if (item.stock <= req.app.locals.prefs.lowStockThreshold) {
//         const notif = await Notification.create({
//             category: 'INVENTORY',
//             type: 'INVENTORY',
//             title: '⚡ Low Stock Alert',
//             message: `${item.name} is running low — ${item.stock} units remaining.`,
//             priority: 'high',
//             role: 'store_manager',
//             emailSent: true,
//             actionLabel: 'View Inventory',
//             actionUrl: '/store-manager/inventory',
//         });
//         const emitter = new NotificationEmitter(req.app.locals.io);
//         emitter.emitToRole('store_manager', notif);
//     }
// }

// ─── Frontend React Hook for Socket.io (add to frontend when backend is ready) ─
//
// Install: npm install socket.io-client
//
// import { useEffect, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useNotifications } from '@/context/NotificationContext';
//
// export function useSocketNotifications(authToken: string) {
//     const socketRef = useRef<Socket | null>(null);
//     const { addNotification } = useNotifications();
//
//     useEffect(() => {
//         if (!authToken) return;
//         socketRef.current = io(process.env.NEXT_PUBLIC_API_URL!, {
//             auth: { token: authToken },
//         });
//
//         socketRef.current.on('notification:new', (notification) => {
//             addNotification(notification);
//             // Show a toast popup
//         });
//
//         return () => { socketRef.current?.disconnect(); };
//     }, [authToken, addNotification]);
// }

*/

export {};
