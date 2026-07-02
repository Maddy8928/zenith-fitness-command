'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type OrderStatus = 'incoming' | 'preparing' | 'ready' | 'delivered';
export type OrderPriority = 'normal' | 'high';

export interface Order {
    id: string;
    member: string;
    items: string[];
    total: string;
    status: OrderStatus;
    time: string;
    priority: OrderPriority;
    timestamp: number;
}

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => string;
    updateStatus: (id: string, status: OrderStatus) => void;
    isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);
const STORAGE_KEY = 'zenith_orders';

export function OrderProvider({ children }: { children: React.ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from LocalStorage
    useEffect(() => {
        const savedOrders = localStorage.getItem(STORAGE_KEY);
        if (savedOrders) {
            try {
                setOrders(JSON.parse(savedOrders));
            } catch (e) {
                console.error("Failed to parse orders", e);
            }
        } else {
            // Seed with initial data if empty
            const initialData: Order[] = [
                { id: 'ORD-2104', member: 'Alex Thompson', items: ['Viking Whey Shake', 'Almond Croissant'], total: '₹1,199', status: 'preparing', time: '4m ago', priority: 'normal', timestamp: Date.now() - 240000 },
                { id: 'ORD-2105', member: 'Jessica Miller', items: ['Pre-Workout Ignite Shot', 'Banana'], total: '₹649', status: 'incoming', time: '1m ago', priority: 'high', timestamp: Date.now() - 60000 },
            ];
            setOrders(initialData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        }
        setIsLoading(false);
    }, []);

    // Sync state to LocalStorage
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        }
    }, [orders, isLoading]);

    // Cross-tab synchronization
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                setOrders(JSON.parse(e.newValue));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const addOrder = (newOrderData: Omit<Order, 'id' | 'timestamp'>): string => {
        const generatedId = `ORD-${Math.floor(Math.random() * 9000) + 1000}`;
        const newOrder: Order = {
            ...newOrderData,
            id: generatedId,
            timestamp: Date.now()
        };
        setOrders(prev => [newOrder, ...prev]);
        return generatedId;
    };

    const updateStatus = (id: string, status: OrderStatus) => {
        setOrders(prev => prev.map(order => 
            order.id === id ? { ...order, status } : order
        ));
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, updateStatus, isLoading }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
}
