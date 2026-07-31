'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GymMemberRecord {
    rollNo: number; // SEQUENCE-WISE UNIQUE ROLL NUMBER (1, 2, 3, 4, 5...)
    name: string;
    email: string;
    phone: string;
    plan: 'Premium' | 'Standard' | 'Basic' | 'None';
    status: 'Active' | 'Expiring Soon' | 'Inactive' | 'Pending';
    joinDate: string;
    lastVisit: string;
    avatar: string;
}

const STORAGE_KEY = 'zenith_gym_all_members_v1';

const DEFAULT_GYM_MEMBERS: GymMemberRecord[] = [
    { rollNo: 1, name: 'Michael Chen', email: 'michael.c@example.com', phone: '(555) 123-4567', plan: 'Premium', status: 'Active', joinDate: '2023-10-15', lastVisit: 'Today, 10:42 AM', avatar: 'MC' },
    { rollNo: 2, name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '(555) 987-6543', plan: 'Standard', status: 'Active', joinDate: '2023-11-02', lastVisit: 'Yesterday, 6:15 PM', avatar: 'SJ' },
    { rollNo: 3, name: 'David Miller', email: 'david.m@example.com', phone: '(555) 456-7890', plan: 'Basic', status: 'Expiring Soon', joinDate: '2024-01-20', lastVisit: '3 days ago', avatar: 'DM' },
    { rollNo: 4, name: 'Emma Wilson', email: 'emma.w@example.com', phone: '(555) 234-5678', plan: 'Premium', status: 'Active', joinDate: '2023-08-10', lastVisit: 'Today, 09:50 AM', avatar: 'EW' },
    { rollNo: 5, name: 'James Thompson', email: 'james.t@example.com', phone: '(555) 876-5432', plan: 'Basic', status: 'Inactive', joinDate: '2023-05-15', lastVisit: '2 weeks ago', avatar: 'JT' },
    { rollNo: 6, name: 'Olivia Davis', email: 'olivia.d@example.com', phone: '(555) 345-6789', plan: 'Standard', status: 'Active', joinDate: '2024-02-01', lastVisit: 'Yesterday, 8:30 AM', avatar: 'OD' },
    { rollNo: 7, name: 'William Garcia', email: 'william.g@example.com', phone: '(555) 765-4321', plan: 'Premium', status: 'Active', joinDate: '2023-12-10', lastVisit: 'Today, 2:15 PM', avatar: 'WG' },
    { rollNo: 8, name: 'Sophia Martinez', email: 'sophia.m@example.com', phone: '(555) 012-3456', plan: 'Standard', status: 'Pending', joinDate: '2024-02-28', lastVisit: 'Never', avatar: 'SM' },
    { rollNo: 9, name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '(555) 555-0101', plan: 'Premium', status: 'Active', joinDate: '2024-03-01', lastVisit: 'Today, 07:15 AM', avatar: 'AS' },
    { rollNo: 10, name: 'Vikram Mehta', email: 'vikram.m@example.com', phone: '(555) 555-0102', plan: 'Standard', status: 'Active', joinDate: '2024-03-05', lastVisit: 'Yesterday, 05:45 PM', avatar: 'VM' },
    { rollNo: 11, name: 'Rohan Gupta', email: 'rohan.g@example.com', phone: '(555) 555-0103', plan: 'Premium', status: 'Active', joinDate: '2024-03-10', lastVisit: 'Today, 08:30 AM', avatar: 'RG' },
    { rollNo: 12, name: 'Priya Nair', email: 'priya.nair@example.com', phone: '(555) 555-0104', plan: 'Basic', status: 'Active', joinDate: '2024-03-12', lastVisit: '2 days ago', avatar: 'PN' },
    { rollNo: 13, name: 'Kabir Khanna', email: 'kabir.k@example.com', phone: '(555) 555-0105', plan: 'Premium', status: 'Active', joinDate: '2024-03-15', lastVisit: 'Today, 06:30 PM', avatar: 'KK' },
    { rollNo: 14, name: 'Sneha Patel', email: 'sneha.p@example.com', phone: '(555) 555-0106', plan: 'Standard', status: 'Active', joinDate: '2024-03-18', lastVisit: 'Yesterday, 07:00 AM', avatar: 'SP' },
    { rollNo: 15, name: 'Arjun Rao', email: 'arjun.rao@example.com', phone: '(555) 555-0107', plan: 'Premium', status: 'Active', joinDate: '2024-03-20', lastVisit: 'Today, 11:15 AM', avatar: 'AR' },
    { rollNo: 16, name: 'Neha Verma', email: 'neha.v@example.com', phone: '(555) 555-0108', plan: 'Basic', status: 'Active', joinDate: '2024-03-22', lastVisit: '3 days ago', avatar: 'NV' },
    { rollNo: 17, name: 'Rajesh Kumar', email: 'rajesh.k@example.com', phone: '(555) 555-0109', plan: 'Standard', status: 'Active', joinDate: '2024-03-25', lastVisit: 'Today, 05:00 PM', avatar: 'RK' },
    { rollNo: 18, name: 'Aditya Joshi', email: 'aditya.j@example.com', phone: '(555) 555-0110', plan: 'Premium', status: 'Active', joinDate: '2024-03-28', lastVisit: 'Yesterday, 06:15 AM', avatar: 'AJ' },
    { rollNo: 19, name: 'Tanvi Shah', email: 'tanvi.s@example.com', phone: '(555) 555-0111', plan: 'Standard', status: 'Active', joinDate: '2024-04-01', lastVisit: 'Today, 09:00 AM', avatar: 'TS' },
    { rollNo: 20, name: 'Siddharth Malhotra', email: 'siddharth.m@example.com', phone: '(555) 555-0112', plan: 'Premium', status: 'Active', joinDate: '2024-04-05', lastVisit: 'Today, 07:45 AM', avatar: 'SM' },
];

/**
 * Reads all gym members from local storage. Initializes with DEFAULT_GYM_MEMBERS if not present.
 */
export function getGymMembers(): GymMemberRecord[] {
    if (typeof window === 'undefined') return DEFAULT_GYM_MEMBERS;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Ensure all items have a sequential rollNo
                return parsed.map((m: any, index: number) => ({
                    ...m,
                    rollNo: typeof m.rollNo === 'number' ? m.rollNo : index + 1
                }));
            }
        }
        // Initialize localStorage with defaults
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GYM_MEMBERS));
        return DEFAULT_GYM_MEMBERS;
    } catch (e) {
        console.error('Failed to get gym members from storage:', e);
        return DEFAULT_GYM_MEMBERS;
    }
}

/**
 * Adds a new member with an automatically generated sequence-wise Roll Number.
 * Dispatches an event so that all open panels (Members Directory, Attendance Page) immediately update.
 */
export function addNewGymMember(data: {
    name: string;
    email: string;
    phone: string;
    plan: 'Premium' | 'Standard' | 'Basic' | 'None';
    status?: 'Active' | 'Expiring Soon' | 'Inactive' | 'Pending';
    joinDate?: string;
    lastVisit?: string;
}): GymMemberRecord {
    const current = getGymMembers();
    const maxRollNo = current.length > 0 ? Math.max(...current.map(m => m.rollNo)) : 0;
    const nextRollNo = maxRollNo + 1;

    const avatar = data.name
        .split(' ')
        .filter(Boolean)
        .map(w => w[0].toUpperCase())
        .join('')
        .substring(0, 2) || 'M';

    const newMember: GymMemberRecord = {
        rollNo: nextRollNo,
        name: data.name,
        email: data.email,
        phone: data.phone,
        plan: data.plan,
        status: data.status || 'Active',
        joinDate: data.joinDate || new Date().toISOString().split('T')[0],
        lastVisit: data.lastVisit || 'Today, Just Registered',
        avatar
    };

    const updatedList = [...current, newMember];
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent('gym_members_updated', { detail: updatedList }));
    }

    return newMember;
}

/**
 * Deletes a member by Roll No from the centralized store and notifies all open pages.
 */
export function deleteGymMember(rollNo: number): boolean {
    const current = getGymMembers();
    const updatedList = current.filter(m => m.rollNo !== rollNo);
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent('gym_members_updated', { detail: updatedList }));
        window.dispatchEvent(new Event('storage'));
    }
    return true;
}

/**
 * Updates an existing member by Roll No in the centralized store and notifies all open pages.
 */
export function updateGymMember(rollNo: number, updatedData: Partial<GymMemberRecord>): GymMemberRecord | null {
    const current = getGymMembers();
    let target: GymMemberRecord | null = null;
    const updatedList = current.map(m => {
        if (m.rollNo === rollNo) {
            target = { ...m, ...updatedData };
            return target;
        }
        return m;
    });
    if (target && typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent('gym_members_updated', { detail: updatedList }));
        window.dispatchEvent(new Event('storage'));
    }
    return target;
}

/**
 * React Hook to access the unified sequence-wise gym members list in real time.
 */
export function useGymMembers(): {
    members: GymMemberRecord[];
    addMember: typeof addNewGymMember;
    deleteMember: typeof deleteGymMember;
    updateMember: typeof updateGymMember;
    refresh: () => void;
} {
    const [members, setMembers] = useState<GymMemberRecord[]>(DEFAULT_GYM_MEMBERS);

    const loadMembers = useCallback(() => {
        setMembers(getGymMembers());
    }, []);

    useEffect(() => {
        loadMembers();

        const handleUpdate = () => {
            loadMembers();
        };

        window.addEventListener('gym_members_updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('gym_members_updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [loadMembers]);

    return {
        members,
        addMember: addNewGymMember,
        deleteMember: deleteGymMember,
        updateMember: updateGymMember,
        refresh: loadMembers
    };
}
