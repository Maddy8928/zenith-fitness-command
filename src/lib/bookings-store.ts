export type TherapyBookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Rescheduled';

export interface TherapyBooking {
    id: string;
    memberId: string;
    memberName: string;
    membershipId: string;
    serviceId: string;
    serviceTitle: string;
    serviceCategory: string; // e.g. 'Massage Therapy', 'Thermal Therapy'
    duration: string;
    price: number;
    preferredDate: string; // e.g. "Jun 20, 2026"
    preferredTime: string; // e.g. "10:00 AM"
    status: TherapyBookingStatus;
    bookingDate: string; // e.g. "Jun 16, 2026, 12:45 PM"
    type: 'massage' | 'thermal' | 'tech' | 'physical' | 'steam';
    notes?: string;
}

const STORAGE_KEY = 'zenith_therapy_bookings';

const relativeDateStr = (daysOffset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatBookingDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
           ', ' + 
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const getInitialBookings = (): TherapyBooking[] => {
    return [
        {
            id: 'BK-101',
            memberId: '4', // Emma Wilson
            memberName: 'Emma Wilson',
            membershipId: 'NXS-8942',
            serviceId: 'rs-1',
            serviceTitle: 'Himalayan Salt Steam',
            serviceCategory: 'Thermal Therapy',
            duration: '30 min',
            price: 2199,
            preferredDate: relativeDateStr(1), // Tomorrow
            preferredTime: '02:00 PM',
            status: 'Pending',
            bookingDate: formatBookingDate(new Date(Date.now() - 1000 * 60 * 30)), // 30 mins ago
            type: 'steam'
        },
        {
            id: 'BK-102',
            memberId: '3', // David Garcia (or member@nexusgym.com)
            memberName: 'David Garcia',
            membershipId: 'NXS-4821',
            serviceId: 'rs-3',
            serviceTitle: 'Arctic Cryotherapy',
            serviceCategory: 'Recovery Tech',
            duration: '15 min',
            price: 4499,
            preferredDate: relativeDateStr(0), // Today
            preferredTime: '10:00 AM',
            status: 'Approved',
            bookingDate: formatBookingDate(new Date(Date.now() - 1000 * 60 * 120)), // 2h ago
            type: 'tech'
        },
        {
            id: 'BK-103',
            memberId: '5', // Olivia Davis
            memberName: 'Olivia Davis',
            membershipId: 'NXS-2041',
            serviceId: 'rs-6',
            serviceTitle: 'Valkyrie Deep Tissue',
            serviceCategory: 'Massage Therapy',
            duration: '60 min',
            price: 6999,
            preferredDate: relativeDateStr(2), // In 2 days
            preferredTime: '04:00 PM',
            status: 'Pending',
            bookingDate: formatBookingDate(new Date(Date.now() - 1000 * 60 * 60 * 3)), // 3h ago
            type: 'massage'
        },
        {
            id: 'BK-104',
            memberId: '1', // Michael Chen
            memberName: 'Michael Chen',
            membershipId: 'NXS-3112',
            serviceId: 'rs-4',
            serviceTitle: 'Compression Therapy',
            serviceCategory: 'Recovery Tech',
            duration: '30 min',
            price: 1899,
            preferredDate: relativeDateStr(-1), // Yesterday
            preferredTime: '03:00 PM',
            status: 'Completed',
            bookingDate: formatBookingDate(new Date(Date.now() - 1000 * 60 * 60 * 25)),
            type: 'tech'
        },
        {
            id: 'BK-105',
            memberId: '2', // Sarah Jenkins
            memberName: 'Sarah Jenkins',
            membershipId: 'NXS-7781',
            serviceId: 'rs-7',
            serviceTitle: 'Nordic Swedish Bliss',
            serviceCategory: 'Massage Therapy',
            duration: '90 min',
            price: 7999,
            preferredDate: relativeDateStr(-1), // Yesterday
            preferredTime: '11:00 AM',
            status: 'Rejected',
            bookingDate: formatBookingDate(new Date(Date.now() - 1000 * 60 * 60 * 27)),
            type: 'massage',
            notes: 'Requested therapist was unavailable.'
        }
    ];
};

export const getStoredBookings = (): TherapyBooking[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        const initial = getInitialBookings();
        saveStoredBookings(initial);
        return initial;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse therapy bookings, resetting...', e);
        const initial = getInitialBookings();
        saveStoredBookings(initial);
        return initial;
    }
};

export const saveStoredBookings = (bookings: TherapyBooking[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
        window.dispatchEvent(new Event('storage_bookings_updated'));
    }
};

export const addBooking = (booking: Omit<TherapyBooking, 'id' | 'bookingDate' | 'status'>): TherapyBooking => {
    const bookings = getStoredBookings();
    const nextId = `BK-${101 + bookings.length}`;
    
    const newBooking: TherapyBooking = {
        ...booking,
        id: nextId,
        status: 'Pending',
        bookingDate: formatBookingDate(new Date())
    };
    
    const updated = [newBooking, ...bookings];
    saveStoredBookings(updated);
    return newBooking;
};

export const updateBookingStatus = (
    id: string, 
    status: TherapyBookingStatus, 
    rescheduleDate?: string, 
    rescheduleTime?: string,
    rejectionNotes?: string
): TherapyBooking | null => {
    const bookings = getStoredBookings();
    let updatedBooking: TherapyBooking | null = null;
    
    const updated = bookings.map(b => {
        if (b.id === id) {
            updatedBooking = {
                ...b,
                status,
                ...(rescheduleDate ? { preferredDate: rescheduleDate } : {}),
                ...(rescheduleTime ? { preferredTime: rescheduleTime } : {}),
                ...(rejectionNotes ? { notes: rejectionNotes } : {})
            };
            return updatedBooking;
        }
        return b;
    });
    
    if (updatedBooking) {
        saveStoredBookings(updated);
    }
    
    return updatedBooking;
};

export type ServiceStatus = 'Operational' | 'Maintenance';

const SERVICE_STATUS_KEY = 'zenith_therapy_service_statuses';

export const getServiceStatuses = (): Record<string, ServiceStatus> => {
    if (typeof window === 'undefined') {
        return {};
    }
    const stored = window.localStorage.getItem(SERVICE_STATUS_KEY);
    if (!stored) {
        const initial: Record<string, ServiceStatus> = {
            'rs-1': 'Operational',
            'rs-2': 'Operational',
            'rs-3': 'Operational',
            'rs-4': 'Operational',
            'rs-5': 'Operational',
            'rs-6': 'Operational',
            'rs-7': 'Operational',
            'rs-8': 'Operational'
        };
        window.localStorage.setItem(SERVICE_STATUS_KEY, JSON.stringify(initial));
        return initial;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse service statuses, resetting...', e);
        return {};
    }
};

export const saveServiceStatuses = (statuses: Record<string, ServiceStatus>): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(SERVICE_STATUS_KEY, JSON.stringify(statuses));
        window.dispatchEvent(new Event('storage_service_statuses_updated'));
    }
};

