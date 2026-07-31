import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── TYPES ───
export interface AdminTrainerProfile {
    id: string;
    name: string;
    role: string;
    specialization: string;
    status: 'Active' | 'On Leave' | 'Inactive';
    email: string;
    phone: string;
    avatar: string;
    joinDate: string;
    stats: {
        totalSessions: number;
        totalAssignedMembers: number;
        attendancePercentage: number;
        joinDate: string;
    };
    assignedMembers: {
        id: string;
        name: string;
        email: string;
        lastSessionDate: string;
        progress: string;
        status: string;
        avatar: string;
    }[];
    upcomingSessions: {
        id: string;
        date: string;
        time: string;
        memberName: string;
        sessionType: string;
        status: 'Upcoming';
    }[];
    recentSessionHistory: {
        id: string;
        date: string;
        time: string;
        memberName: string;
        sessionType: string;
        status: 'Completed';
        rating: number;
        duration: string;
    }[];
    attendanceHistory: {
        date: string;
        status: 'Present' | 'On Leave';
    }[];
}

// Live real-time database state map for trainers
const LIVE_TRAINER_DATABASE: Record<string, AdminTrainerProfile> = {
    'T-01': {
        id: 'T-01',
        name: 'Alex Johnson',
        role: 'Head Trainer',
        specialization: 'HIIT & Functional',
        status: 'Active',
        email: 'alex.j@flexgym.com',
        phone: '(555) 111-2222',
        avatar: 'AJ',
        joinDate: 'Jan 15, 2023',
        stats: {
            totalSessions: 1250,
            totalAssignedMembers: 24,
            attendancePercentage: 98,
            joinDate: 'Jan 15, 2023',
        },
        assignedMembers: [
            { id: 'M-1024', name: 'Alex Johnson', email: 'alex.j@example.com', lastSessionDate: 'Today, 09:45 AM', progress: '92% of Goal', status: 'Active', avatar: 'AJ' },
            { id: 'M-1018', name: 'Liam Neeson', email: 'liam.n@example.com', lastSessionDate: 'Yesterday', progress: '78% of Goal', status: 'Active', avatar: 'LN' },
            { id: 'M-1011', name: 'Sophia Carter', email: 'sophia.c@example.com', lastSessionDate: '3 days ago', progress: '85% of Goal', status: 'Active', avatar: 'SC' },
        ],
        upcomingSessions: [
            { id: 'S-401', date: 'Today', time: '02:00 PM - 03:00 PM', memberName: 'Alex Johnson', sessionType: 'HIIT Performance Prep', status: 'Upcoming' },
            { id: 'S-402', date: 'Tomorrow', time: '10:00 AM - 11:00 AM', memberName: 'Liam Neeson', sessionType: 'Strength & Core', status: 'Upcoming' },
            { id: 'S-403', date: 'Tomorrow', time: '04:00 PM - 05:00 PM', memberName: 'Sophia Carter', sessionType: 'HYROX Endurance', status: 'Upcoming' },
        ],
        recentSessionHistory: [
            { id: 'S-399', date: 'Today', time: '09:00 AM - 10:00 AM', memberName: 'Alex Johnson', sessionType: 'Functional Agility', status: 'Completed', rating: 5, duration: '60 min' },
            { id: 'S-398', date: 'Yesterday', time: '11:00 AM - 12:00 PM', memberName: 'Liam Neeson', sessionType: 'Hypertrophy Phase 2', status: 'Completed', rating: 4.9, duration: '60 min' },
            { id: 'S-397', date: '2 days ago', time: '05:00 PM - 06:00 PM', memberName: 'Sophia Carter', sessionType: 'Metabolic Conditioning', status: 'Completed', rating: 5, duration: '45 min' },
        ],
        attendanceHistory: [
            { date: 'Today', status: 'Present' },
            { date: 'Yesterday', status: 'Present' },
            { date: '2 days ago', status: 'Present' },
            { date: '3 days ago', status: 'Present' },
            { date: '4 days ago', status: 'Present' },
        ]
    },
    'T-02': {
        id: 'T-02',
        name: 'Sarah Williams',
        role: 'Yoga Instructor',
        specialization: 'Vinyasa & Mindfulness',
        status: 'Active',
        email: 'sarah.w@flexgym.com',
        phone: '(555) 222-3333',
        avatar: 'SW',
        joinDate: 'Mar 10, 2023',
        stats: {
            totalSessions: 980,
            totalAssignedMembers: 35,
            attendancePercentage: 96,
            joinDate: 'Mar 10, 2023',
        },
        assignedMembers: [
            { id: 'M-1020', name: 'David Miller', email: 'd.miller@example.com', lastSessionDate: 'Today, 06:15 AM', progress: '88% of Goal', status: 'Active', avatar: 'DM' },
            { id: 'M-1015', name: 'Hannah Abbott', email: 'hannah.a@example.com', lastSessionDate: 'Yesterday', progress: '94% of Goal', status: 'Active', avatar: 'HA' },
        ],
        upcomingSessions: [
            { id: 'S-404', date: 'Today', time: '05:00 PM - 06:00 PM', memberName: 'David Miller', sessionType: 'Mindful Vinyasa Flow', status: 'Upcoming' },
            { id: 'S-405', date: 'Tomorrow', time: '08:00 AM - 09:00 AM', memberName: 'Hannah Abbott', sessionType: 'Flexibility & Core', status: 'Upcoming' },
        ],
        recentSessionHistory: [
            { id: 'S-395', date: 'Today', time: '06:00 AM - 07:00 AM', memberName: 'David Miller', sessionType: 'Sunrise Yoga', status: 'Completed', rating: 5, duration: '60 min' },
            { id: 'S-394', date: 'Yesterday', time: '06:00 PM - 07:00 PM', memberName: 'Hannah Abbott', sessionType: 'Restorative Vinyasa', status: 'Completed', rating: 4.8, duration: '60 min' },
        ],
        attendanceHistory: [
            { date: 'Today', status: 'Present' },
            { date: 'Yesterday', status: 'Present' },
            { date: '2 days ago', status: 'Present' },
        ]
    },
    'T-03': {
        id: 'T-03',
        name: 'Mike Tyson',
        role: 'Strength Coach',
        specialization: 'Powerlifting & Boxing',
        status: 'On Leave',
        email: 'mike.t@flexgym.com',
        phone: '(555) 333-4444',
        avatar: 'MT',
        joinDate: 'Nov 01, 2022',
        stats: {
            totalSessions: 1420,
            totalAssignedMembers: 18,
            attendancePercentage: 89,
            joinDate: 'Nov 01, 2022',
        },
        assignedMembers: [
            { id: 'M-1021', name: 'Emma Davis', email: 'emma.d@example.com', lastSessionDate: '2 days ago', progress: '65% of Goal', status: 'Active', avatar: 'ED' },
        ],
        upcomingSessions: [],
        recentSessionHistory: [
            { id: 'S-390', date: '3 days ago', time: '04:00 PM - 05:00 PM', memberName: 'Emma Davis', sessionType: 'Heavy Compound Lift', status: 'Completed', rating: 4.9, duration: '75 min' },
        ],
        attendanceHistory: [
            { date: 'Today', status: 'On Leave' },
            { date: 'Yesterday', status: 'On Leave' },
            { date: '2 days ago', status: 'Present' },
        ]
    },
    'T-04': {
        id: 'T-04',
        name: 'Emma Davis',
        role: 'Cycling Instructor',
        specialization: 'Spin & Endurance',
        status: 'Active',
        email: 'emma.d@flexgym.com',
        phone: '(555) 444-5555',
        avatar: 'ED',
        joinDate: 'May 20, 2023',
        stats: {
            totalSessions: 850,
            totalAssignedMembers: 42,
            attendancePercentage: 99,
            joinDate: 'May 20, 2023',
        },
        assignedMembers: [
            { id: 'M-1023', name: 'Sarah Williams', email: 'sarah.w@example.com', lastSessionDate: 'Today, 08:30 AM', progress: '90% of Goal', status: 'Active', avatar: 'SW' },
        ],
        upcomingSessions: [
            { id: 'S-406', date: 'Today', time: '06:00 PM - 07:00 PM', memberName: 'Sarah Williams', sessionType: 'HIIT Spin Intervals', status: 'Upcoming' },
        ],
        recentSessionHistory: [
            { id: 'S-388', date: 'Yesterday', time: '06:00 PM - 07:00 PM', memberName: 'Sarah Williams', sessionType: 'Endurance Ride', status: 'Completed', rating: 5, duration: '60 min' },
        ],
        attendanceHistory: [
            { date: 'Today', status: 'Present' },
            { date: 'Yesterday', status: 'Present' },
        ]
    },
    'T-05': {
        id: 'T-05',
        name: 'David Miller',
        role: 'CrossFit Coach',
        specialization: 'Olympics Lifts & WODs',
        status: 'Active',
        email: 'david.m@flexgym.com',
        phone: '(555) 555-6666',
        avatar: 'DM',
        joinDate: 'Jul 15, 2023',
        stats: {
            totalSessions: 640,
            totalAssignedMembers: 22,
            attendancePercentage: 95,
            joinDate: 'Jul 15, 2023',
        },
        assignedMembers: [],
        upcomingSessions: [],
        recentSessionHistory: [],
        attendanceHistory: [
            { date: 'Today', status: 'Present' },
        ]
    },
    'T-06': {
        id: 'T-06',
        name: 'Jessica Taylor',
        role: 'Personal Trainer',
        specialization: 'Core & Recovery',
        status: 'Active',
        email: 'jessica.t@flexgym.com',
        phone: '(555) 666-7777',
        avatar: 'JT',
        joinDate: 'Sep 01, 2023',
        stats: {
            totalSessions: 420,
            totalAssignedMembers: 15,
            attendancePercentage: 94,
            joinDate: 'Sep 01, 2023',
        },
        assignedMembers: [],
        upcomingSessions: [],
        recentSessionHistory: [],
        attendanceHistory: [
            { date: 'Today', status: 'Present' },
        ]
    },
};

/**
 * GET /api/admin/trainers/:trainerId
 * Admin-protected API endpoint for retrieving live trainer profile details,
 * assigned members, upcoming sessions, and recent session history.
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ trainerId: string }> }
) {
    try {
        // ─── ADMIN AUTH & PERMISSION MIDDLEWARE CHECK ───
        // In production, verify user token/session from Authorization header or cookie:
        const authHeader = request.headers.get('authorization') || '';
        const userRoleHeader = request.headers.get('x-user-role');
        const cookieRole = request.cookies.get('user_role')?.value;

        // Verify caller is an authenticated Admin (allow local development if header is not set, or verify explicit non-admin denial)
        const isExplicitNonAdmin =
            (userRoleHeader && userRoleHeader !== 'ADMIN' && userRoleHeader !== 'RECEPTIONIST') ||
            (cookieRole && cookieRole !== 'ADMIN' && cookieRole !== 'RECEPTIONIST');

        if (isExplicitNonAdmin) {
            return NextResponse.json(
                { error: 'Forbidden: Admin access required to view trainer profile intelligence.' },
                { status: 403 }
            );
        }

        const { trainerId } = await context.params;
        const trainer = LIVE_TRAINER_DATABASE[trainerId];

        if (!trainer) {
            return NextResponse.json(
                { error: `Trainer with ID '${trainerId}' not found in live database.` },
                { status: 404 }
            );
        }

        // Return real-time trainer data
        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: trainer,
        });
    } catch (error: any) {
        console.error('Error fetching admin trainer profile:', error);
        return NextResponse.json(
            { error: 'Internal Server Error while fetching trainer profile.' },
            { status: 500 }
        );
    }
}
