'use client';

export type MembershipPlan = 'Premium' | 'Standard' | 'Basic' | 'None';
export type MemberStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Inactive';
export type PaymentStatus = 'None' | 'Overdue' | 'Due in 3 Days';

export interface GymMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    memberId: string;
    plan: MembershipPlan;
    status: MemberStatus;
    expiryDate: string; // ISO string
    pendingPayments: PaymentStatus;
    assignedTrainer: string; // Name or 'None'
    avatar: string;
}

export interface CheckInRecord {
    id: string;
    memberId: string;
    memberName: string;
    memberEmail: string;
    plan: MembershipPlan;
    trainerName: string;
    checkInTime: string; // ISO Date string
    checkOutTime?: string; // ISO Date string
    status: 'Success' | 'Denied' | 'Warning';
    message: string;
    durationMinutes?: number;
    overrideApplied?: boolean;
}

const STORAGE_MEMBERS_KEY = 'zenith_gym_members';
const STORAGE_CHECKINS_KEY = 'zenith_gym_checkins';

const generateDefaultMembers = (): GymMember[] => {
    const today = new Date();

    const dActive1 = new Date(today);
    dActive1.setDate(today.getDate() + 90); // 90 days from now

    const dActive2 = new Date(today);
    dActive2.setDate(today.getDate() + 45); // 45 days from now

    const dExpiring = new Date(today);
    dExpiring.setDate(today.getDate() + 3); // 3 days from now

    const dExpired = new Date(today);
    dExpired.setDate(today.getDate() - 5); // 5 days ago

    const dInactive = new Date(today);
    dInactive.setDate(today.getDate() - 40); // 40 days ago

    return [
        {
            id: 'm-1',
            name: 'Michael Chen',
            email: 'michael.c@example.com',
            phone: '+91 98123 45678',
            memberId: 'MEM-1001',
            plan: 'Premium',
            status: 'Active',
            expiryDate: dActive1.toISOString(),
            pendingPayments: 'None',
            assignedTrainer: 'Marcus Johnson',
            avatar: 'MC'
        },
        {
            id: 'm-2',
            name: 'Sarah Jenkins',
            email: 'sarah.j@example.com',
            phone: '+91 98234 56789',
            memberId: 'MEM-1002',
            plan: 'Standard',
            status: 'Active',
            expiryDate: dActive2.toISOString(),
            pendingPayments: 'None',
            assignedTrainer: 'None',
            avatar: 'SJ'
        },
        {
            id: 'm-3',
            name: 'David Miller',
            email: 'david.m@example.com',
            phone: '+91 98345 67890',
            memberId: 'MEM-1003',
            plan: 'Basic',
            status: 'Expiring Soon',
            expiryDate: dExpiring.toISOString(),
            pendingPayments: 'Due in 3 Days',
            assignedTrainer: 'Sarah Jenkins',
            avatar: 'DM'
        },
        {
            id: 'm-4',
            name: 'Emma Wilson',
            email: 'emma.w@example.com',
            phone: '+91 98456 78901',
            memberId: 'MEM-1004',
            plan: 'Premium',
            status: 'Expired',
            expiryDate: dExpired.toISOString(),
            pendingPayments: 'None',
            assignedTrainer: 'Marcus Johnson',
            avatar: 'EW'
        },
        {
            id: 'm-5',
            name: 'James Thompson',
            email: 'james.t@example.com',
            phone: '+91 98567 89012',
            memberId: 'MEM-1005',
            plan: 'Basic',
            status: 'Inactive',
            expiryDate: dInactive.toISOString(),
            pendingPayments: 'Overdue',
            assignedTrainer: 'None',
            avatar: 'JT'
        },
        {
            id: 'm-6',
            name: 'Olivia Davis',
            email: 'olivia.d@example.com',
            phone: '+91 98678 90123',
            memberId: 'MEM-1006',
            plan: 'Standard',
            status: 'Active',
            expiryDate: dActive1.toISOString(),
            pendingPayments: 'None',
            assignedTrainer: 'Sarah Jenkins',
            avatar: 'OD'
        },
        {
            id: 'm-7',
            name: 'William Garcia',
            email: 'william.g@example.com',
            phone: '+91 98789 01234',
            memberId: 'MEM-1007',
            plan: 'Premium',
            status: 'Active',
            expiryDate: dActive2.toISOString(),
            pendingPayments: 'None',
            assignedTrainer: 'Marcus Johnson',
            avatar: 'WG'
        },
        {
            id: 'm-8',
            name: 'Sophia Martinez',
            email: 'sophia.m@example.com',
            phone: '+91 98890 12345',
            memberId: 'MEM-1008',
            plan: 'Standard',
            status: 'Active',
            expiryDate: dActive1.toISOString(),
            pendingPayments: 'None',
            assignedTrainer: 'None',
            avatar: 'SM'
        }
    ];
};

const generateDefaultCheckIns = (): CheckInRecord[] => {
    const today = new Date();
    const records: CheckInRecord[] = [];

    // Historical records (last 7 days)
    for (let i = 7; i > 0; i--) {
        const checkInDate = new Date(today);
        checkInDate.setDate(today.getDate() - i);
        
        // Let's generate a few check-ins for each day
        const numVisits = 15 + Math.floor(Math.random() * 10);
        for (let j = 0; j < numVisits; j++) {
            // Hours spread: morning and evening peaks
            const hour = Math.random() > 0.4 
                ? 6 + Math.floor(Math.random() * 4) // 6:00 AM - 10:00 AM
                : 16 + Math.floor(Math.random() * 4); // 4:00 PM - 8:00 PM

            const minute = Math.floor(Math.random() * 60);
            
            const timeIn = new Date(checkInDate);
            timeIn.setHours(hour, minute, 0, 0);

            const duration = 45 + Math.floor(Math.random() * 60); // 45 to 105 minutes
            const timeOut = new Date(timeIn);
            timeOut.setMinutes(timeIn.getMinutes() + duration);

            const members = ['Michael Chen', 'Sarah Jenkins', 'Olivia Davis', 'William Garcia', 'Sophia Martinez'];
            const chosenMember = members[j % members.length];
            const plan = (j % 3 === 0 ? 'Premium' : j % 3 === 1 ? 'Standard' : 'Basic') as MembershipPlan;

            records.push({
                id: `check-${i}-${j}-${Math.random().toString(36).slice(2, 7)}`,
                memberId: `MEM-100${(j % 5) + 1}`,
                memberName: chosenMember,
                memberEmail: chosenMember.toLowerCase().replace(' ', '.') + '@example.com',
                plan,
                trainerName: plan === 'Premium' ? 'Marcus Johnson' : 'None',
                checkInTime: timeIn.toISOString(),
                checkOutTime: timeOut.toISOString(),
                status: 'Success',
                message: 'Access Granted',
                durationMinutes: duration
            });
        }
    }

    // Add some check-ins for today that are already checked out
    const todayMorning = new Date(today);
    todayMorning.setHours(7, 30, 0, 0);
    const todayMorningOut = new Date(todayMorning);
    todayMorningOut.setHours(8, 45, 0, 0);

    records.push({
        id: 'check-today-1',
        memberId: 'MEM-1002',
        memberName: 'Sarah Jenkins',
        memberEmail: 'sarah.j@example.com',
        plan: 'Standard',
        trainerName: 'None',
        checkInTime: todayMorning.toISOString(),
        checkOutTime: todayMorningOut.toISOString(),
        status: 'Success',
        message: 'Access Granted',
        durationMinutes: 75
    });

    // Add currently active inside check-ins (no checkout time)
    const active1 = new Date(today);
    active1.setMinutes(today.getMinutes() - 42); // checked in 42 mins ago
    records.push({
        id: 'check-active-1',
        memberId: 'MEM-1001',
        memberName: 'Michael Chen',
        memberEmail: 'michael.c@example.com',
        plan: 'Premium',
        trainerName: 'Marcus Johnson',
        checkInTime: active1.toISOString(),
        status: 'Success',
        message: 'Access Granted'
    });

    const active2 = new Date(today);
    active2.setMinutes(today.getMinutes() - 15); // checked in 15 mins ago
    records.push({
        id: 'check-active-2',
        memberId: 'MEM-1006',
        memberName: 'Olivia Davis',
        memberEmail: 'olivia.d@example.com',
        plan: 'Standard',
        trainerName: 'Sarah Jenkins',
        checkInTime: active2.toISOString(),
        status: 'Success',
        message: 'Access Granted'
    });

    // Add a denied attempt in history
    const deniedTime = new Date(today);
    deniedTime.setHours(9, 50, 0, 0);
    records.push({
        id: 'check-denied-1',
        memberId: 'MEM-1004',
        memberName: 'Emma Wilson',
        memberEmail: 'emma.w@example.com',
        plan: 'Premium',
        trainerName: 'Marcus Johnson',
        checkInTime: deniedTime.toISOString(),
        checkOutTime: deniedTime.toISOString(), // Denied ends immediately
        status: 'Denied',
        message: 'Access Denied: Membership Expired'
    });

    return records;
};

export const getStoredMembers = (): GymMember[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_MEMBERS_KEY);
    if (!stored) {
        const defaults = generateDefaultMembers();
        localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(defaults));
        return defaults;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse members', e);
        return generateDefaultMembers();
    }
};

export const saveStoredMembers = (members: GymMember[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(members));
    window.dispatchEvent(new Event('storage'));
};

export const getStoredCheckIns = (): CheckInRecord[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_CHECKINS_KEY);
    if (!stored) {
        const defaults = generateDefaultCheckIns();
        localStorage.setItem(STORAGE_CHECKINS_KEY, JSON.stringify(defaults));
        return defaults;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse check-ins', e);
        return generateDefaultCheckIns();
    }
};

export const saveStoredCheckIns = (checkIns: CheckInRecord[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_CHECKINS_KEY, JSON.stringify(checkIns));
    window.dispatchEvent(new Event('storage'));
};

export interface CheckInValidation {
    member: GymMember;
    allowed: boolean;
    status: 'Success' | 'Denied' | 'Warning';
    message: string;
}

export const validateCheckIn = (memberIdOrCode: string): CheckInValidation | null => {
    const members = getStoredMembers();
    const query = memberIdOrCode.trim().toLowerCase();
    
    const member = members.find(m => 
        m.memberId.toLowerCase() === query || 
        m.name.toLowerCase() === query ||
        m.email.toLowerCase() === query
    );

    if (!member) return null;

    // Validation rules
    if (member.status === 'Expired' || new Date(member.expiryDate) < new Date()) {
        return {
            member,
            allowed: false,
            status: 'Denied',
            message: 'Access Denied: Membership Expired'
        };
    }

    if (member.pendingPayments === 'Overdue') {
        return {
            member,
            allowed: false,
            status: 'Denied',
            message: 'Access Denied: Overdue Payment'
        };
    }

    if (member.pendingPayments === 'Due in 3 Days') {
        return {
            member,
            allowed: true,
            status: 'Warning',
            message: 'Access Granted: Pending Payment Due'
        };
    }

    return {
        member,
        allowed: true,
        status: 'Success',
        message: 'Access Granted'
    };
};

export const checkInMember = (memberId: string, overrideApplied: boolean = false): CheckInRecord => {
    const validation = validateCheckIn(memberId);
    if (!validation) {
        throw new Error('Member not found');
    }

    const checkIns = getStoredCheckIns();
    
    // Check if already inside (only if check-in was allowed or override is applied)
    const isInside = checkIns.some(c => c.memberId === validation.member.memberId && !c.checkOutTime && c.status !== 'Denied');
    if (isInside && (validation.allowed || overrideApplied)) {
        throw new Error('Member is already checked in and inside the gym');
    }

    // Determine status
    let checkInStatus: 'Success' | 'Denied' | 'Warning' = validation.status;
    let checkInMessage = validation.message;
    
    if (!validation.allowed) {
        if (overrideApplied) {
            checkInStatus = 'Warning';
            checkInMessage = `Access Override Granted: ${validation.message.split(': ')[1] || 'Overridden'}`;
        } else {
            checkInStatus = 'Denied';
        }
    }

    const newRecord: CheckInRecord = {
        id: `check-${Date.now()}`,
        memberId: validation.member.memberId,
        memberName: validation.member.name,
        memberEmail: validation.member.email,
        plan: validation.member.plan,
        trainerName: validation.member.assignedTrainer,
        checkInTime: new Date().toISOString(),
        status: checkInStatus,
        message: checkInMessage,
        overrideApplied: overrideApplied && !validation.allowed
    };

    // If denied, we log it but set checkout time instantly (since they don't enter the facility)
    if (checkInStatus === 'Denied') {
        newRecord.checkOutTime = newRecord.checkInTime;
    }

    const updated = [newRecord, ...checkIns];
    saveStoredCheckIns(updated);

    // Update lastVisit time on member profile
    const members = getStoredMembers();
    const updatedMembers = members.map(m => {
        if (m.memberId === validation.member.memberId) {
            return {
                ...m,
                lastVisit: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ` + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
        }
        return m;
    });
    saveStoredMembers(updatedMembers);

    return newRecord;
};

export const checkOutMember = (recordId: string): CheckInRecord => {
    const checkIns = getStoredCheckIns();
    const idx = checkIns.findIndex(c => c.id === recordId);
    
    if (idx === -1) {
        throw new Error('Check-in record not found');
    }

    const record = checkIns[idx];
    if (record.checkOutTime) {
        throw new Error('Member is already checked out');
    }

    const checkOutTime = new Date().toISOString();
    const checkInTime = new Date(record.checkInTime);
    const diffMs = new Date(checkOutTime).getTime() - checkInTime.getTime();
    const durationMinutes = Math.max(1, Math.round(diffMs / 60000));

    const updatedRecord: CheckInRecord = {
        ...record,
        checkOutTime,
        durationMinutes
    };

    checkIns[idx] = updatedRecord;
    saveStoredCheckIns(checkIns);

    return updatedRecord;
};

// Analytics Helpers
export const getCheckInAnalytics = () => {
    const checkIns = getStoredCheckIns();
    const members = getStoredMembers();

    // 1. Visit Mix by Plan
    const planCounts = { Premium: 0, Standard: 0, Basic: 0, None: 0 };
    checkIns.forEach(c => {
        if (c.status !== 'Denied') {
            planCounts[c.plan] = (planCounts[c.plan] || 0) + 1;
        }
    });
    const planMixData = Object.entries(planCounts)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));

    // 2. Attendance Trends (Daily counts for last 7 days)
    const today = new Date();
    const trendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayKey = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        trendMap[dayKey] = 0;
    }

    checkIns.forEach(c => {
        if (c.status !== 'Denied') {
            const dateStr = new Date(c.checkInTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            if (dateStr in trendMap) {
                trendMap[dateStr] += 1;
            }
        }
    });
    const trendsData = Object.entries(trendMap).map(([day, visits]) => ({ day, visits }));

    // 3. Peak Gym Hours (Group by hour of checkInTime)
    const hourMap: Record<string, number> = {};
    for (let h = 5; h <= 22; h++) {
        const hourLabel = h > 12 ? `${h - 12} PM` : `${h} AM`;
        hourMap[hourLabel] = 0;
    }
    checkIns.forEach(c => {
        if (c.status !== 'Denied') {
            const h = new Date(c.checkInTime).getHours();
            if (h >= 5 && h <= 22) {
                const hourLabel = h > 12 ? `${h - 12} PM` : `${h} AM`;
                hourMap[hourLabel] += 1;
            }
        }
    });
    const peakHoursData = Object.entries(hourMap).map(([hour, count]) => ({ hour, count }));

    // 4. Most Active Members (Top 5 checked in)
    const memberFreq: Record<string, { name: string; count: number; email: string; avatar: string }> = {};
    checkIns.forEach(c => {
        if (c.status !== 'Denied') {
            if (!memberFreq[c.memberId]) {
                const profile = members.find(m => m.memberId === c.memberId);
                memberFreq[c.memberId] = {
                    name: c.memberName,
                    count: 0,
                    email: c.memberEmail,
                    avatar: profile?.avatar || c.memberName.charAt(0)
                };
            }
            memberFreq[c.memberId].count += 1;
        }
    });
    const activeMembersData = Object.values(memberFreq)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        planMixData,
        trendsData,
        peakHoursData,
        activeMembersData
    };
};
