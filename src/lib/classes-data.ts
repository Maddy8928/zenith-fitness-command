'use client';

export interface ClassParticipant {
    name: string;
    email: string;
    enrolledAt: string;
    attended?: boolean;
}

export type ClassStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
export type ClassType = 'Zumba' | 'Yoga' | 'Pilates' | 'Aerobics' | 'Functional Training' | 'Dance Fitness' | 'Other';

export interface GymClass {
    id: string;
    name: string;
    type: ClassType;
    instructor: string;
    dateTime: string; // ISO date-time string
    duration: string; // e.g. '60 mins'
    capacity: number;
    description: string;
    status: ClassStatus;
    room: string;
    participants: ClassParticipant[];
}

const STORAGE_KEY = 'zenith_gym_classes';

// Seed some initial classes with dates relative to today
const generateDefaultClasses = (): GymClass[] => {
    const today = new Date();
    
    const d1 = new Date(today);
    d1.setHours(17, 30, 0, 0); // Today 5:30 PM

    const d2 = new Date(today);
    d2.setDate(today.getDate() + 1);
    d2.setHours(7, 0, 0, 0); // Tomorrow 7:00 AM

    const d3 = new Date(today);
    d3.setDate(today.getDate() + 2);
    d3.setHours(18, 0, 0, 0); // Day after tomorrow 6:00 PM

    const d4 = new Date(today);
    d4.setHours(9, 0, 0, 0); // Today 9:00 AM (Ongoing/Completed)

    const d5 = new Date(today);
    d5.setDate(today.getDate() + 3);
    d5.setHours(19, 0, 0, 0);

    return [
        {
            id: 'class-1',
            name: 'HIIT Extreme Burnout',
            type: 'Functional Training',
            instructor: 'Marcus Johnson',
            dateTime: d1.toISOString(),
            duration: '45 mins',
            capacity: 25,
            room: 'Studio A',
            status: 'Upcoming',
            description: 'High-intensity interval training designed to maximize calorie burn and improve cardiovascular fitness. Focus on explosive power.',
            participants: [
                { name: 'Sarah Jenkins', email: 'sarah.j@example.com', enrolledAt: new Date(Date.now() - 3600000).toISOString(), attended: false },
                { name: 'David Miller', email: 'david.m@example.com', enrolledAt: new Date(Date.now() - 7200000).toISOString(), attended: false }
            ]
        },
        {
            id: 'class-2',
            name: 'Vinyasa Flow Yoga',
            type: 'Yoga',
            instructor: 'Sarah Jenkins',
            dateTime: d2.toISOString(),
            duration: '60 mins',
            capacity: 30,
            room: 'Zen Studio',
            status: 'Upcoming',
            description: 'A continuous flow of postures synchronized with breath to build heat, endurance, flexibility and core strength.',
            participants: []
        },
        {
            id: 'class-3',
            name: 'Pilates Core Sculpt',
            type: 'Pilates',
            instructor: 'Emma Wilson',
            dateTime: d3.toISOString(),
            duration: '50 mins',
            capacity: 20,
            room: 'Studio B',
            status: 'Upcoming',
            description: 'Core-focused Pilates training using mat exercises to strengthen stabilizers, improve posture, and align body balance.',
            participants: [
                { name: 'John Doe', email: 'john.doe@example.com', enrolledAt: new Date(Date.now() - 10800000).toISOString(), attended: false }
            ]
        },
        {
            id: 'class-4',
            name: 'Aerobics Cardio Dance',
            type: 'Aerobics',
            instructor: 'Maria Rodriguez',
            dateTime: d4.toISOString(),
            duration: '60 mins',
            capacity: 40,
            room: 'Studio A',
            status: 'Ongoing',
            description: 'High energy dance aerobics. Get your heart rate up, burn fat and dance to upbeat music.',
            participants: [
                { name: 'Michael Chen', email: 'michael.c@example.com', enrolledAt: new Date(Date.now() - 14400000).toISOString(), attended: true },
                { name: 'Jessica Miller', email: 'jessica.m@example.com', enrolledAt: new Date(Date.now() - 18000000).toISOString(), attended: true }
            ]
        },
        {
            id: 'class-5',
            name: 'Latin Dance Fitness',
            type: 'Dance Fitness',
            instructor: 'Maria Rodriguez',
            dateTime: d5.toISOString(),
            duration: '60 mins',
            capacity: 30,
            room: 'Studio B',
            status: 'Upcoming',
            description: 'Zumba-inspired rhythmic dance fitness. A fun, cardio workout that burns calories through Latin dance steps.',
            participants: []
        }
    ];
};

export const getStoredClasses = (): GymClass[] => {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        const defaults = generateDefaultClasses();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
    }
    
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse gym classes', e);
        const defaults = generateDefaultClasses();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
    }
};

export const saveStoredClasses = (classes: GymClass[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
    // Dispatch standard storage event so other tabs/hooks are notified
    window.dispatchEvent(new Event('storage'));
};

export const enrollMemberInClass = (classId: string, participant: Omit<ClassParticipant, 'enrolledAt'>): GymClass[] => {
    const classes = getStoredClasses();
    const classIdx = classes.findIndex(c => c.id === classId);
    
    if (classIdx === -1) return classes;
    
    const targetClass = classes[classIdx];
    
    // Check capacity
    if (targetClass.participants.length >= targetClass.capacity) {
        throw new Error('Class is at maximum capacity');
    }
    
    // Check if already enrolled
    const isEnrolled = targetClass.participants.some(p => p.email.toLowerCase() === participant.email.toLowerCase());
    if (isEnrolled) {
        return classes; // Already enrolled
    }
    
    const newParticipant: ClassParticipant = {
        ...participant,
        enrolledAt: new Date().toISOString(),
        attended: false
    };
    
    targetClass.participants.push(newParticipant);
    classes[classIdx] = targetClass;
    
    saveStoredClasses(classes);
    return classes;
};

export const cancelEnrollment = (classId: string, email: string): GymClass[] => {
    const classes = getStoredClasses();
    const classIdx = classes.findIndex(c => c.id === classId);
    
    if (classIdx === -1) return classes;
    
    const targetClass = classes[classIdx];
    targetClass.participants = targetClass.participants.filter(p => p.email.toLowerCase() !== email.toLowerCase());
    classes[classIdx] = targetClass;
    
    saveStoredClasses(classes);
    return classes;
};

export const toggleParticipantAttendance = (classId: string, email: string): GymClass[] => {
    const classes = getStoredClasses();
    const classIdx = classes.findIndex(c => c.id === classId);
    
    if (classIdx === -1) return classes;
    
    const targetClass = classes[classIdx];
    const pIdx = targetClass.participants.findIndex(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (pIdx !== -1) {
        targetClass.participants[pIdx].attended = !targetClass.participants[pIdx].attended;
        classes[classIdx] = targetClass;
        saveStoredClasses(classes);
    }
    
    return classes;
};
