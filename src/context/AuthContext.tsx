'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

if (typeof window !== 'undefined') {
    try {
        window.localStorage.getItem = (key: string) => {
            return window.sessionStorage.getItem(key);
        };
        window.localStorage.setItem = (key: string, value: string) => {
            window.sessionStorage.setItem(key, value);
        };
        window.localStorage.removeItem = (key: string) => {
            window.sessionStorage.removeItem(key);
        };
        window.localStorage.clear = () => {
            window.sessionStorage.clear();
        };
        window.localStorage.key = (index: number) => {
            return window.sessionStorage.key(index);
        };
        Object.defineProperty(window.localStorage, 'length', {
            get: () => window.sessionStorage.length,
            configurable: true
        });
    } catch (e) {
        console.error('Failed to override window.localStorage using sessionStorage', e);
    }
}


export type UserRole = 'ADMIN' | 'TRAINER' | 'MEMBER' | 'RECEPTIONIST' | 'CAFE_WORKER' | 'STORE_MANAGER';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, role: UserRole) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Users
const MOCK_USERS: Record<string, User> = {
    'admin@nexusgym.com': { id: '1', name: 'Super Admin', email: 'admin@nexusgym.com', role: 'ADMIN' },
    'trainer@nexusgym.com': { id: '2', name: 'John Doe', email: 'trainer@nexusgym.com', role: 'TRAINER' },
    'member@nexusgym.com': { id: '3', name: 'Jane Smith', email: 'member@nexusgym.com', role: 'MEMBER' },
    'receptionist@nexusgym.com': { id: '4', name: 'Alice Frontdesk', email: 'receptionist@nexusgym.com', role: 'RECEPTIONIST' },
    'cafe@nexusgym.com': { id: '5', name: 'Bjorn Refreshment', email: 'cafe@nexusgym.com', role: 'CAFE_WORKER' },
    'store@nexusgym.com': { id: '6', name: 'Stock Manager', email: 'store@nexusgym.com', role: 'STORE_MANAGER' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session in localStorage
        const savedUser = localStorage.getItem('zenith_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse user session');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (emailInput: string, manualRole: UserRole) => {
        setIsLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const email = emailInput.toLowerCase();
        
        // Smart role detection for demo purposes
        let detectedRole = manualRole;
        if (email.includes('admin')) {
            detectedRole = 'ADMIN';
        } else if (email.includes('trainer')) {
            detectedRole = 'TRAINER';
        } else if (email.includes('receptionist') || email.includes('reception')) {
            detectedRole = 'RECEPTIONIST';
        } else if (email.includes('cafe')) {
            detectedRole = 'CAFE_WORKER';
        } else if (email.includes('store')) {
            detectedRole = 'STORE_MANAGER';
        }

        // Find mock user by email or create a new one based on the detected role
        const selectedUser = MOCK_USERS[email] || {
            id: Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0].split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            email: email,
            role: detectedRole
        };

        setUser(selectedUser);
        localStorage.setItem('zenith_user', JSON.stringify(selectedUser));

        // Redirect based on role
        if (selectedUser.role === 'ADMIN') {
            router.push('/admin');
        } else if (selectedUser.role === 'TRAINER') {
            router.push('/trainer');
        } else if (selectedUser.role === 'RECEPTIONIST') {
            router.push('/receptionist');
        } else if (selectedUser.role === 'CAFE_WORKER') {
            router.push('/cafe');
        } else if (selectedUser.role === 'STORE_MANAGER') {
            router.push('/store');
        } else {
            router.push('/member');
        }

        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('zenith_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
