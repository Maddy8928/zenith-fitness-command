'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGymMembers, updateGymMember, GymMemberRecord } from '@/lib/gym-members-store';
import { getStoredMembers, saveStoredMembers, GymMember } from '@/lib/checkins-data';

export type FreezeReason = 'Medical' | 'Travel' | 'Personal' | 'Financial' | 'Other';
export type FreezeStatus = 'Active' | 'Completed' | 'Cancelled';

export interface FreezeRecord {
    id: string;
    memberRollNo: number;
    memberName: string;
    memberEmail: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    totalDays: number;
    reason: FreezeReason;
    internalNote: string;
    oldExpiryDate: string; // YYYY-MM-DD
    newExpiryDate: string; // YYYY-MM-DD
    createdBy: string; // e.g. "Front Desk Manager"
    createdAt: string; // ISO timestamp
    status: FreezeStatus;
}

export interface FreezePolicy {
    minDurationDays: number; // default: 7
    maxDurationDays: number; // default: 90
    maxFreezesPerYear: number; // default: 2
    isChargeable: boolean; // default: false
    feeAmount: number; // default: 500
}

const STORAGE_FREEZES_KEY = 'zenith_membership_freezes_v1';
const STORAGE_POLICY_KEY = 'zenith_membership_freeze_policy_v1';

export const DEFAULT_FREEZE_POLICY: FreezePolicy = {
    minDurationDays: 7,
    maxDurationDays: 90,
    maxFreezesPerYear: 2,
    isChargeable: false,
    feeAmount: 500,
};

const DEFAULT_FREEZES: FreezeRecord[] = [
    {
        id: 'frz_default_101',
        memberRollNo: 1,
        memberName: 'Michael Chen',
        memberEmail: 'michael.c@example.com',
        startDate: '2025-05-01',
        endDate: '2025-05-15',
        totalDays: 14,
        reason: 'Travel',
        internalNote: 'Annual vacation abroad',
        oldExpiryDate: '2025-11-15',
        newExpiryDate: '2025-11-29',
        createdBy: 'Front Desk Manager',
        createdAt: '2025-04-28T10:00:00.000Z',
        status: 'Completed',
    },
];

/**
 * Calculates the total inclusive days between two YYYY-MM-DD dates.
 */
export function calculateFreezeDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

/**
 * Calculates the new YYYY-MM-DD expiry date by adding daysToAdd to oldExpiryDate.
 */
export function calculateNewExpiryDate(oldExpiryDate: string, daysToAdd: number): string {
    if (!oldExpiryDate) {
        const d = new Date();
        d.setDate(d.getDate() + 365 + daysToAdd);
        return d.toISOString().split('T')[0];
    }
    const d = new Date(oldExpiryDate);
    if (isNaN(d.getTime())) {
        const now = new Date();
        now.setDate(now.getDate() + 365 + daysToAdd);
        return now.toISOString().split('T')[0];
    }
    d.setDate(d.getDate() + daysToAdd);
    return d.toISOString().split('T')[0];
}

/**
 * Get configured freeze policy from localStorage or defaults.
 */
export function getFreezePolicy(): FreezePolicy {
    if (typeof window === 'undefined') return DEFAULT_FREEZE_POLICY;
    try {
        const stored = localStorage.getItem(STORAGE_POLICY_KEY);
        if (stored) {
            return { ...DEFAULT_FREEZE_POLICY, ...JSON.parse(stored) };
        }
        localStorage.setItem(STORAGE_POLICY_KEY, JSON.stringify(DEFAULT_FREEZE_POLICY));
        return DEFAULT_FREEZE_POLICY;
    } catch (e) {
        return DEFAULT_FREEZE_POLICY;
    }
}

/**
 * Update configured freeze policy.
 */
export function saveFreezePolicy(policy: Partial<FreezePolicy>): FreezePolicy {
    const current = getFreezePolicy();
    const updated = { ...current, ...policy };
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_POLICY_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('membership_freezes_updated'));
        window.dispatchEvent(new Event('storage'));
    }
    return updated;
}

/**
 * Reads all membership freeze records from localStorage.
 */
export function getStoredFreezes(): FreezeRecord[] {
    if (typeof window === 'undefined') return DEFAULT_FREEZES;
    try {
        const stored = localStorage.getItem(STORAGE_FREEZES_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
        localStorage.setItem(STORAGE_FREEZES_KEY, JSON.stringify(DEFAULT_FREEZES));
        return DEFAULT_FREEZES;
    } catch (e) {
        console.error('Failed to parse membership freezes:', e);
        return DEFAULT_FREEZES;
    }
}

/**
 * Saves freeze records to localStorage and notifies listeners.
 */
export function saveStoredFreezes(freezes: FreezeRecord[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_FREEZES_KEY, JSON.stringify(freezes));
    window.dispatchEvent(new CustomEvent('membership_freezes_updated', { detail: freezes }));
    window.dispatchEvent(new Event('storage'));
}

/**
 * Syncs the member's status and expiry date across gym-members-store and checkins-data.
 */
export function syncMemberStatus(
    rollNo: number,
    email: string,
    newStatus: 'Active' | 'Frozen' | 'Expiring Soon' | 'Inactive',
    newExpiryDate?: string
): void {
    if (typeof window === 'undefined') return;

    // 1. Update gym-members-store
    try {
        updateGymMember(rollNo, { status: newStatus as any });
    } catch (e) {
        console.error('Failed to sync gym-members-store status', e);
    }

    // 2. Update checkins-data store
    try {
        const storedMembers = getStoredMembers();
        const updated = storedMembers.map(m => {
            const matchByEmail = email && m.email.toLowerCase() === email.toLowerCase();
            const matchByRoll = m.id === `m-${rollNo}` || m.memberId === `MEM-100${rollNo}`;
            if (matchByEmail || matchByRoll) {
                const copy: GymMember = {
                    ...m,
                    status: newStatus as any,
                };
                if (newExpiryDate) {
                    copy.expiryDate = new Date(newExpiryDate).toISOString();
                }
                return copy;
            }
            return m;
        });
        saveStoredMembers(updated);
    } catch (e) {
        console.error('Failed to sync checkins-data status', e);
    }

    window.dispatchEvent(new CustomEvent('gym_members_updated'));
    window.dispatchEvent(new CustomEvent('membership_freezes_updated'));
    window.dispatchEvent(new Event('storage'));
}

/**
 * Get all freeze records for a specific member by roll number or email.
 */
export function getMemberFreezes(rollNoOrEmail: number | string): FreezeRecord[] {
    const freezes = getStoredFreezes();
    if (typeof rollNoOrEmail === 'number') {
        return freezes.filter(f => f.memberRollNo === rollNoOrEmail);
    }
    const email = String(rollNoOrEmail).toLowerCase().trim();
    return freezes.filter(f => f.memberEmail.toLowerCase() === email || String(f.memberRollNo) === email);
}

/**
 * Get the currently active freeze for a member (if any).
 */
export function getActiveFreezeForMember(rollNoOrEmail: number | string): FreezeRecord | null {
    const freezes = getMemberFreezes(rollNoOrEmail);
    return freezes.find(f => f.status === 'Active') || null;
}

/**
 * Create a new Membership Freeze record.
 */
export function createMembershipFreeze(data: {
    memberRollNo: number;
    memberName: string;
    memberEmail: string;
    startDate: string;
    endDate: string;
    reason: FreezeReason;
    internalNote?: string;
    oldExpiryDate: string;
    createdBy?: string;
}): { success: boolean; record?: FreezeRecord; error?: string } {
    const policy = getFreezePolicy();
    const freezes = getStoredFreezes();

    // 1. Prevent overlapping or active freezes
    const existingActive = freezes.find(f => 
        (f.memberRollNo === data.memberRollNo || f.memberEmail.toLowerCase() === data.memberEmail.toLowerCase()) &&
        f.status === 'Active'
    );
    if (existingActive) {
        return { success: false, error: 'Member already has an active membership freeze.' };
    }

    // 2. Validate against configured policy min/max duration
    const totalDays = calculateFreezeDays(data.startDate, data.endDate);
    if (totalDays < policy.minDurationDays) {
        return { success: false, error: `Freeze duration (${totalDays} days) is less than minimum configured policy (${policy.minDurationDays} days).` };
    }
    if (totalDays > policy.maxDurationDays) {
        return { success: false, error: `Freeze duration (${totalDays} days) exceeds maximum configured policy (${policy.maxDurationDays} days).` };
    }

    // 3. Check annual freeze limit
    const currentYear = new Date(data.startDate).getFullYear();
    const annualFreezesCount = freezes.filter(f => 
        (f.memberRollNo === data.memberRollNo || f.memberEmail.toLowerCase() === data.memberEmail.toLowerCase()) &&
        f.status !== 'Cancelled' &&
        new Date(f.startDate).getFullYear() === currentYear
    ).length;

    if (annualFreezesCount >= policy.maxFreezesPerYear) {
        return { success: false, error: `Member has reached the maximum allowed freezes per year (${policy.maxFreezesPerYear}).` };
    }

    // 4. Calculate new expiry date by extending by exactly totalDays
    const newExpiryDate = calculateNewExpiryDate(data.oldExpiryDate, totalDays);

    const record: FreezeRecord = {
        id: `frz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        memberRollNo: data.memberRollNo,
        memberName: data.memberName,
        memberEmail: data.memberEmail,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays,
        reason: data.reason,
        internalNote: data.internalNote || '',
        oldExpiryDate: data.oldExpiryDate,
        newExpiryDate,
        createdBy: data.createdBy || 'Front Desk Manager',
        createdAt: new Date().toISOString(),
        status: 'Active',
    };

    const updated = [record, ...freezes];
    saveStoredFreezes(updated);

    // 5. Change member status from Active -> Frozen and update expiry date
    syncMemberStatus(data.memberRollNo, data.memberEmail, 'Frozen', newExpiryDate);

    return { success: true, record };
}

/**
 * Ends an active freeze early and recalculates the extension based only on actual frozen days.
 */
export function endFreezeEarly(freezeId: string, actualEndDate: string): { success: boolean; record?: FreezeRecord; error?: string } {
    const freezes = getStoredFreezes();
    const index = freezes.findIndex(f => f.id === freezeId);
    if (index === -1) return { success: false, error: 'Freeze record not found.' };

    const original = freezes[index];
    if (original.status !== 'Active') {
        return { success: false, error: 'Only active freeze periods can be ended early.' };
    }

    const actualDays = calculateFreezeDays(original.startDate, actualEndDate);
    const recalculatedNewExpiry = calculateNewExpiryDate(original.oldExpiryDate, actualDays);

    const updatedRecord: FreezeRecord = {
        ...original,
        endDate: actualEndDate,
        totalDays: actualDays,
        newExpiryDate: recalculatedNewExpiry,
        status: 'Completed',
    };

    freezes[index] = updatedRecord;
    saveStoredFreezes(freezes);

    // Revert status to Active and apply recalculated expiry date
    syncMemberStatus(original.memberRollNo, original.memberEmail, 'Active', recalculatedNewExpiry);

    return { success: true, record: updatedRecord };
}

/**
 * Cancels an active freeze and reverts status and expiry date.
 */
export function cancelFreeze(freezeId: string): { success: boolean; record?: FreezeRecord; error?: string } {
    const freezes = getStoredFreezes();
    const index = freezes.findIndex(f => f.id === freezeId);
    if (index === -1) return { success: false, error: 'Freeze record not found.' };

    const original = freezes[index];
    if (original.status !== 'Active') {
        return { success: false, error: 'Only active freeze periods can be cancelled.' };
    }

    const updatedRecord: FreezeRecord = {
        ...original,
        status: 'Cancelled',
    };

    freezes[index] = updatedRecord;
    saveStoredFreezes(freezes);

    // Restore member status to Active and revert expiry date to oldExpiryDate
    syncMemberStatus(original.memberRollNo, original.memberEmail, 'Active', original.oldExpiryDate);

    return { success: true, record: updatedRecord };
}

/**
 * Automatically checks for expired active freezes and reactivates them.
 * This can be run on app load or whenever a check-in is attempted.
 */
export function checkAndReactivateExpiredFreezes(): { reactivatedCount: number; reactivatedNames: string[] } {
    if (typeof window === 'undefined') return { reactivatedCount: 0, reactivatedNames: [] };
    const freezes = getStoredFreezes();
    const todayStr = new Date().toISOString().split('T')[0];
    const reactivatedNames: string[] = [];
    let hasChanges = false;

    const updatedFreezes = freezes.map(f => {
        if (f.status === 'Active' && todayStr >= f.endDate) {
            hasChanges = true;
            reactivatedNames.push(f.memberName);
            // Revert member status to Active and ensure newExpiryDate is applied
            syncMemberStatus(f.memberRollNo, f.memberEmail, 'Active', f.newExpiryDate);
            return {
                ...f,
                status: 'Completed' as FreezeStatus,
            };
        }
        return f;
    });

    if (hasChanges) {
        saveStoredFreezes(updatedFreezes);
        // Trigger notification event for member dashboard / toast
        reactivatedNames.forEach(name => {
            window.dispatchEvent(new CustomEvent('membership_reactivated_notification', {
                detail: {
                    memberName: name,
                    message: "Your membership has been reactivated. Welcome back!",
                }
            }));
        });
    }

    return { reactivatedCount: reactivatedNames.length, reactivatedNames };
}

/**
 * Custom hook to access membership freeze state and policies reactively.
 */
export function useMembershipFreeze(memberRollNoOrEmail?: number | string) {
    const [freezes, setFreezes] = useState<FreezeRecord[]>(getStoredFreezes());
    const [policy, setPolicy] = useState<FreezePolicy>(getFreezePolicy());

    const loadData = useCallback(() => {
        // Run automatic reactivation check whenever state loads
        checkAndReactivateExpiredFreezes();
        setFreezes(getStoredFreezes());
        setPolicy(getFreezePolicy());
    }, []);

    useEffect(() => {
        loadData();

        const handleUpdate = () => {
            loadData();
        };

        window.addEventListener('membership_freezes_updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('membership_freezes_updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [loadData]);

    const memberFreezes = memberRollNoOrEmail !== undefined 
        ? getMemberFreezes(memberRollNoOrEmail)
        : freezes;

    const activeFreeze = memberRollNoOrEmail !== undefined 
        ? getActiveFreezeForMember(memberRollNoOrEmail)
        : freezes.find(f => f.status === 'Active') || null;

    return {
        allFreezes: freezes,
        memberFreezes: memberFreezes || [],
        freezeHistory: memberFreezes || [],
        activeFreeze,
        policy,
        updatePolicy: saveFreezePolicy,
        createFreeze: createMembershipFreeze,
        endEarly: endFreezeEarly,
        cancel: cancelFreeze,
        refresh: loadData,
    };
}
