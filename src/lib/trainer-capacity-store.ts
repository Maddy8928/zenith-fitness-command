/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ZENITH FITNESS — Trainer Capacity Store
 * ─────────────────────────────────────────────────────────────────────────────
 * localStorage-backed data layer for trainer client capacity management.
 * Used by the Trainer Dashboard and the Member Trainer Trial page.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CAPACITY_STORAGE_KEY = 'zenith_trainer_capacity';

export const CAPACITY_PRESETS = [5, 10, 15, 20] as const;
export type CapacityPreset = typeof CAPACITY_PRESETS[number] | number;

export interface TrainerCapacity {
    maxClients: number;
    currentClients: number;
    slotsOpen: boolean;
    openSlotsTimestamp?: string; // ISO string — when broadcast was sent
}

/** Default capacity per trainer (simulated initial values). */
const TRAINER_DEFAULTS: Record<string, Partial<TrainerCapacity>> = {
    'marcus-johnson': { currentClients: 10 },
    'sarah-chen':     { currentClients: 6 },
    'michael-rivers': { currentClients: 4 },
};

const DEFAULT_CAPACITY: TrainerCapacity = {
    maxClients: 10,
    currentClients: 0,
    slotsOpen: false,
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export function getAllCapacities(): Record<string, TrainerCapacity> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(CAPACITY_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return {};
}

export function getTrainerCapacity(trainerId: string): TrainerCapacity {
    const all = getAllCapacities();
    if (all[trainerId]) return all[trainerId];
    // Return sensible default with simulated currentClients
    return {
        ...DEFAULT_CAPACITY,
        ...(TRAINER_DEFAULTS[trainerId] ?? {}),
    };
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function setTrainerCapacity(trainerId: string, data: Partial<TrainerCapacity>): TrainerCapacity {
    const all = getAllCapacities();
    const current = getTrainerCapacity(trainerId);
    const updated: TrainerCapacity = { ...current, ...data };
    all[trainerId] = updated;
    try {
        localStorage.setItem(CAPACITY_STORAGE_KEY, JSON.stringify(all));
        // Dispatch storage event so other tabs/components update
        window.dispatchEvent(new StorageEvent('storage', { key: CAPACITY_STORAGE_KEY }));
    } catch { /* storage full */ }
    return updated;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isAtCapacity(trainerId: string): boolean {
    const cap = getTrainerCapacity(trainerId);
    return cap.currentClients >= cap.maxClients;
}

export function getAvailableSlots(trainerId: string): number {
    const cap = getTrainerCapacity(trainerId);
    return Math.max(0, cap.maxClients - cap.currentClients);
}

/**
 * Increment current clients by 1 (called when a member booking is accepted).
 * Automatically closes "open slots" broadcast if now at capacity.
 */
export function incrementClientCount(trainerId: string): TrainerCapacity {
    const cap = getTrainerCapacity(trainerId);
    const newCount = Math.min(cap.currentClients + 1, cap.maxClients);
    const atCap = newCount >= cap.maxClients;
    return setTrainerCapacity(trainerId, {
        currentClients: newCount,
        // Auto-close open slots if at capacity
        slotsOpen: atCap ? false : cap.slotsOpen,
    });
}

/**
 * Decrement current clients by 1 (called when a client is removed).
 */
export function decrementClientCount(trainerId: string): TrainerCapacity {
    const cap = getTrainerCapacity(trainerId);
    return setTrainerCapacity(trainerId, {
        currentClients: Math.max(0, cap.currentClients - 1),
    });
}

/**
 * Check if an "open slots" broadcast has expired (> 24h old).
 */
export function isOpenSlotsBroadcastExpired(trainerId: string): boolean {
    const cap = getTrainerCapacity(trainerId);
    if (!cap.slotsOpen || !cap.openSlotsTimestamp) return false;
    const age = Date.now() - new Date(cap.openSlotsTimestamp).getTime();
    return age > 24 * 60 * 60 * 1000; // 24 hours
}
