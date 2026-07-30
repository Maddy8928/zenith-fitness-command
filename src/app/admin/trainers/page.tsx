"use client";

import { useState, useMemo } from "react";
import { 
    Search, 
    Plus, 
    Filter, 
    MoreVertical, 
    Star, 
    Users, 
    Award, 
    Mail, 
    Phone, 
    Clock, 
    Dumbbell, 
    UserCheck, 
    Briefcase, 
    CalendarCheck, 
    ArrowUpDown, 
    CheckCircle2, 
    TrendingUp, 
    RefreshCw, 
    ArrowRightLeft, 
    ShieldCheck,
    Eye,
    Edit3,
    Calendar,
    MessageSquare,
    UserCog
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Trainer {
    id: string;
    name: string;
    role: string;
    specialization: string;
    experience: string;
    rating: number;
    performance: string;
    activeClients: number;
    totalSessions: number;
    availability: string;
    email: string;
    phone: string;
    status: "Active" | "On Leave" | "Inactive";
    image: string;
}

interface Receptionist {
    id: string;
    name: string;
    role: string;
    shiftTimings: string;
    attendance: string;
    checkInsManaged: number;
    membershipRenewals: number;
    membershipTransfers: number;
    performance: string;
    rating: number;
    email: string;
    phone: string;
    status: "Active" | "On Leave" | "Inactive";
    image: string;
}

const trainersData: Trainer[] = [
    {
        id: "T-01",
        name: "Alex Johnson",
        role: "Head Trainer",
        specialization: "HIIT & Functional",
        experience: "8 Years Exp",
        rating: 4.9,
        performance: "99% Success Rate",
        activeClients: 24,
        totalSessions: 1250,
        availability: "Mon - Sat • 06:00 - 14:00",
        email: "alex.j@nexusgym.com",
        phone: "(555) 111-2222",
        status: "Active",
        image: "AJ",
    },
    {
        id: "T-02",
        name: "Sarah Williams",
        role: "Yoga & Vinyasa Instructor",
        specialization: "Mindfulness & Flexibility",
        experience: "6 Years Exp",
        rating: 4.8,
        performance: "98% Client Goal Rate",
        activeClients: 35,
        totalSessions: 980,
        availability: "Tue - Sun • 07:00 - 15:00",
        email: "sarah.w@nexusgym.com",
        phone: "(555) 222-3333",
        status: "Active",
        image: "SW",
    },
    {
        id: "T-03",
        name: "Mike Tyson",
        role: "Strength & Conditioning Coach",
        specialization: "Powerlifting & Boxing",
        experience: "12 Years Exp",
        rating: 4.7,
        performance: "95% Retention",
        activeClients: 18,
        totalSessions: 1420,
        availability: "Mon - Fri • 14:00 - 22:00",
        email: "mike.t@nexusgym.com",
        phone: "(555) 333-4444",
        status: "On Leave",
        image: "MT",
    },
    {
        id: "T-04",
        name: "Emma Davis",
        role: "Endurance & Cycling Coach",
        specialization: "Spin & Cardio Power",
        experience: "5 Years Exp",
        rating: 4.9,
        performance: "99% Class Fill Rate",
        activeClients: 42,
        totalSessions: 850,
        availability: "Mon - Sat • 06:00 - 12:00",
        email: "emma.d@nexusgym.com",
        phone: "(555) 444-5555",
        status: "Active",
        image: "ED",
    },
    {
        id: "T-05",
        name: "David Miller",
        role: "CrossFit Coach",
        specialization: "Olympic Lifts & WODs",
        experience: "7 Years Exp",
        rating: 4.6,
        performance: "94% PR Achievement",
        activeClients: 22,
        totalSessions: 640,
        availability: "Wed - Sun • 10:00 - 18:00",
        email: "david.m@nexusgym.com",
        phone: "(555) 555-6666",
        status: "Active",
        image: "DM",
    },
    {
        id: "T-06",
        name: "Jessica Taylor",
        role: "Personal Rehabilitation Trainer",
        specialization: "Core & Mobility Recovery",
        experience: "4 Years Exp",
        rating: 4.8,
        performance: "97% Injury-Free Rate",
        activeClients: 15,
        totalSessions: 420,
        availability: "Mon - Fri • 08:00 - 16:00",
        email: "jessica.t@nexusgym.com",
        phone: "(555) 666-7777",
        status: "Active",
        image: "JT",
    },
];

const receptionistsData: Receptionist[] = [
    {
        id: "R-01",
        name: "Chloe Bennett",
        role: "Head Receptionist",
        shiftTimings: "Morning Shift • 06:00 - 14:00",
        attendance: "99.4% Attendance",
        checkInsManaged: 3420,
        membershipRenewals: 148,
        membershipTransfers: 24,
        performance: "98% Desk Efficiency",
        rating: 4.9,
        email: "chloe.b@nexusgym.com",
        phone: "(555) 777-8888",
        status: "Active",
        image: "CB",
    },
    {
        id: "R-02",
        name: "Marcus Vance",
        role: "Front Desk Specialist",
        shiftTimings: "Evening Shift • 14:00 - 22:00",
        attendance: "98.1% Attendance",
        checkInsManaged: 2890,
        membershipRenewals: 112,
        membershipTransfers: 18,
        performance: "96% Speedy Check-in Rate",
        rating: 4.8,
        email: "marcus.v@nexusgym.com",
        phone: "(555) 888-9999",
        status: "Active",
        image: "MV",
    },
    {
        id: "R-03",
        name: "Aria Patel",
        role: "Member Services Representative",
        shiftTimings: "Morning Shift • 06:00 - 14:00",
        attendance: "100% Attendance",
        checkInsManaged: 3150,
        membershipRenewals: 165,
        membershipTransfers: 31,
        performance: "99% Member Satisfaction",
        rating: 4.9,
        email: "aria.p@nexusgym.com",
        phone: "(555) 999-0000",
        status: "Active",
        image: "AP",
    },
    {
        id: "R-04",
        name: "Liam O'Connor",
        role: "Night Desk Concierge",
        shiftTimings: "Night Shift • 22:00 - 06:00",
        attendance: "96.5% Attendance",
        checkInsManaged: 1840,
        membershipRenewals: 64,
        membershipTransfers: 9,
        performance: "94% After-Hours Accuracy",
        rating: 4.7,
        email: "liam.o@nexusgym.com",
        phone: "(555) 000-1111",
        status: "Active",
        image: "LO",
    },
    {
        id: "R-05",
        name: "Sophia Zhang",
        role: "Reception & Roster Coordinator",
        shiftTimings: "Weekend Shift • 08:00 - 20:00",
        attendance: "97.8% Attendance",
        checkInsManaged: 2110,
        membershipRenewals: 89,
        membershipTransfers: 15,
        performance: "97% Booking Precision",
        rating: 4.8,
        email: "sophia.z@nexusgym.com",
        phone: "(555) 111-3333",
        status: "On Leave",
        image: "SZ",
    },
    {
        id: "R-06",
        name: "Daniel Reyes",
        role: "Front Desk Associate",
        shiftTimings: "Evening Shift • 14:00 - 22:00",
        attendance: "95.2% Attendance",
        checkInsManaged: 1950,
        membershipRenewals: 72,
        membershipTransfers: 11,
        performance: "93% On-Time Check-in",
        rating: 4.6,
        email: "daniel.r@nexusgym.com",
        phone: "(555) 333-5555",
        status: "Active",
        image: "DR",
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "Active": 
            return "bg-green-500/10 text-green-500 border-green-500/20";
        case "On Leave": 
            return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        case "Inactive": 
            return "bg-destructive/10 text-destructive border-destructive/20";
        default: 
            return "bg-primary/10 text-primary border-primary/20";
    }
};

export default function StaffManagementPage() {
    const [activeTab, setActiveTab] = useState<'trainers' | 'receptionists'>('trainers');
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [sortBy, setSortBy] = useState<string>("rating");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // KPI summary calculations
    const totalTrainers = 42;
    const activeTrainersCount = 38;
    const onLeaveTrainersCount = 4;

    const totalReceptionists = 12;
    const activeReceptionistsCount = 11;
    const onLeaveReceptionistsCount = 1;

    const filteredTrainers = useMemo(() => {
        return trainersData
            .filter((t) => {
                const matchesSearch =
                    searchTerm === "" ||
                    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === "All" || t.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === "rating") return b.rating - a.rating;
                if (sortBy === "name") return a.name.localeCompare(b.name);
                if (sortBy === "clients") return b.activeClients - a.activeClients;
                if (sortBy === "sessions") return b.totalSessions - a.totalSessions;
                return 0;
            });
    }, [searchTerm, statusFilter, sortBy]);

    const filteredReceptionists = useMemo(() => {
        return receptionistsData
            .filter((r) => {
                const matchesSearch =
                    searchTerm === "" ||
                    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.shiftTimings.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === "All" || r.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === "rating") return b.rating - a.rating;
                if (sortBy === "name") return a.name.localeCompare(b.name);
                if (sortBy === "checkins") return b.checkInsManaged - a.checkInsManaged;
                if (sortBy === "renewals") return b.membershipRenewals - a.membershipRenewals;
                return 0;
            });
    }, [searchTerm, statusFilter, sortBy]);

    const displayedTrainers = filteredTrainers.slice(0, currentPage * itemsPerPage);
    const displayedReceptionists = filteredReceptionists.slice(0, currentPage * itemsPerPage);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-primary/10 dark:bg-gold-glow/10 text-primary dark:text-gold-glow">
                            Staff Management Module
                        </span>
                    </div>
                    <h1 className="text-3xl font-heading font-black tracking-tight text-foreground dark:text-white mt-2">
                        Staff
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage all gym employees, trainers, and receptionists from a unified management hub.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("All");
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors text-sm font-medium"
                    >
                        <Filter className="w-4 h-4 text-primary dark:text-gold-glow" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground font-semibold text-sm shadow-glow hover:shadow-glow/80 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" />
                        {activeTab === 'trainers' ? 'Add Trainer' : 'Add Receptionist'}
                    </button>
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Trainers Summary Card */}
                <div
                    onClick={() => {
                        setActiveTab('trainers');
                        setCurrentPage(1);
                    }}
                    className={`glass-card rounded-3xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group border ${
                        activeTab === 'trainers'
                            ? 'border-primary dark:border-gold-glow shadow-glow bg-primary/5 dark:bg-gold-glow/5'
                            : 'border-primary/10 hover:border-primary/30 dark:hover:border-gold-glow/30 bg-charcoal/20 dark:bg-black/20'
                    }`}
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle,_hsl(var(--gold)/0.15),_transparent_70%)] rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Total Trainers
                            </span>
                            <div className="flex items-baseline gap-3 mt-2">
                                <h2 className="text-4xl font-heading font-black text-foreground dark:text-white">
                                    {totalTrainers}
                                </h2>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +3 This Month
                                </span>
                            </div>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-soft ${
                            activeTab === 'trainers'
                                ? 'bg-gradient-to-br from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground scale-110 shadow-glow'
                                : 'bg-primary/10 dark:bg-gold-glow/10 text-primary dark:text-gold-glow group-hover:scale-105'
                        }`}>
                            <Dumbbell className="w-7 h-7" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary/10 text-xs relative z-10">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <strong className="text-foreground dark:text-white">{activeTrainersCount}</strong> Active
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <strong className="text-foreground dark:text-white">{onLeaveTrainersCount}</strong> On Leave
                            </span>
                        </div>
                        <span className="text-primary dark:text-gold-glow font-bold flex items-center gap-1">
                            {activeTab === 'trainers' ? 'Currently Viewing •' : 'Click to View →'}
                        </span>
                    </div>
                </div>

                {/* Total Receptionists Summary Card */}
                <div
                    onClick={() => {
                        setActiveTab('receptionists');
                        setCurrentPage(1);
                    }}
                    className={`glass-card rounded-3xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group border ${
                        activeTab === 'receptionists'
                            ? 'border-primary dark:border-gold-glow shadow-glow bg-primary/5 dark:bg-gold-glow/5'
                            : 'border-primary/10 hover:border-primary/30 dark:hover:border-gold-glow/30 bg-charcoal/20 dark:bg-black/20'
                    }`}
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle,_hsl(var(--gold)/0.15),_transparent_70%)] rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Total Receptionists
                            </span>
                            <div className="flex items-baseline gap-3 mt-2">
                                <h2 className="text-4xl font-heading font-black text-foreground dark:text-white">
                                    {totalReceptionists}
                                </h2>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> 100% Shift Coverage
                                </span>
                            </div>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-soft ${
                            activeTab === 'receptionists'
                                ? 'bg-gradient-to-br from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground scale-110 shadow-glow'
                                : 'bg-primary/10 dark:bg-gold-glow/10 text-primary dark:text-gold-glow group-hover:scale-105'
                        }`}>
                            <UserCheck className="w-7 h-7" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary/10 text-xs relative z-10">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <strong className="text-foreground dark:text-white">{activeReceptionistsCount}</strong> Active
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <strong className="text-foreground dark:text-white">{onLeaveReceptionistsCount}</strong> On Leave
                            </span>
                        </div>
                        <span className="text-primary dark:text-gold-glow font-bold flex items-center gap-1">
                            {activeTab === 'receptionists' ? 'Currently Viewing •' : 'Click to View →'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Role-Based Navigation Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-primary/10 dark:border-white/10">
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-primary/10 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            setActiveTab('trainers');
                            setCurrentPage(1);
                        }}
                        className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex-1 sm:flex-initial ${
                            activeTab === 'trainers'
                                ? 'bg-primary dark:bg-gold-glow text-primary-foreground shadow-glow scale-[1.02]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                        <Dumbbell className="w-4 h-4" />
                        <span>Trainers</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            activeTab === 'trainers'
                                ? 'bg-black/20 text-white'
                                : 'bg-black/10 dark:bg-white/10 text-muted-foreground'
                        }`}>
                            {trainersData.length}
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('receptionists');
                            setCurrentPage(1);
                        }}
                        className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex-1 sm:flex-initial ${
                            activeTab === 'receptionists'
                                ? 'bg-primary dark:bg-gold-glow text-primary-foreground shadow-glow scale-[1.02]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                        <UserCheck className="w-4 h-4" />
                        <span>Receptionists</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            activeTab === 'receptionists'
                                ? 'bg-black/20 text-white'
                                : 'bg-black/10 dark:bg-white/10 text-muted-foreground'
                        }`}>
                            {receptionistsData.length}
                        </span>
                    </button>
                </div>

                {/* Status Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                    {(['All', 'Active', 'On Leave'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                setCurrentPage(1);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                                statusFilter === status
                                    ? 'bg-primary/20 dark:bg-gold-glow/20 text-primary dark:text-gold-glow border border-primary/40 dark:border-gold-glow/40 shadow-sm'
                                    : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 border border-transparent'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search, Sorting & Filters Bar */}
            <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border border-primary/10">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={
                            activeTab === 'trainers'
                                ? "Search trainers by name, specialization, or email..."
                                : "Search receptionists by name, shift, or email..."
                        }
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-primary/10">
                        <ArrowUpDown className="w-3.5 h-3.5 text-primary dark:text-gold-glow" />
                        <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                        >
                            <option value="rating" className="bg-charcoal dark:bg-slate-900">Highest Rating</option>
                            <option value="name" className="bg-charcoal dark:bg-slate-900">Name (A - Z)</option>
                            {activeTab === 'trainers' ? (
                                <>
                                    <option value="clients" className="bg-charcoal dark:bg-slate-900">Most Assigned Members</option>
                                    <option value="sessions" className="bg-charcoal dark:bg-slate-900">Most Sessions</option>
                                </>
                            ) : (
                                <>
                                    <option value="checkins" className="bg-charcoal dark:bg-slate-900">Most Check-ins Managed</option>
                                    <option value="renewals" className="bg-charcoal dark:bg-slate-900">Most Renewals</option>
                                </>
                            )}
                        </select>
                    </div>

                    <button 
                        onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("All");
                            setSortBy("rating");
                            setCurrentPage(1);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 transition-colors text-xs font-medium text-muted-foreground hover:text-foreground"
                        title="Reset Filters"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                </div>
            </div>

            {/* Active Tab Count Bar */}
            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-muted-foreground">
                    Showing <strong className="text-foreground dark:text-white">
                        {activeTab === 'trainers' ? displayedTrainers.length : displayedReceptionists.length}
                    </strong> of <strong className="text-foreground dark:text-white">
                        {activeTab === 'trainers' ? filteredTrainers.length : filteredReceptionists.length}
                    </strong> {activeTab === 'trainers' ? 'Trainers' : 'Receptionists'}
                </span>
                {statusFilter !== "All" && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-gold-glow/10 text-primary dark:text-gold-glow font-medium">
                        Filter applied: {statusFilter}
                    </span>
                )}
            </div>

            {/* TAB 1: TRAINERS GRID */}
            {activeTab === 'trainers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedTrainers.length === 0 ? (
                        <div className="col-span-full glass-card rounded-3xl p-12 text-center text-muted-foreground">
                            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-semibold">No trainers found matching criteria</p>
                            <p className="text-xs mt-1">Try resetting your search or filter options.</p>
                        </div>
                    ) : (
                        displayedTrainers.map((trainer) => (
                            <div 
                                key={trainer.id} 
                                className="glass-card rounded-3xl p-6 group transition-all duration-300 hover:scale-[1.01] border border-primary/10 hover:border-primary/30 dark:hover:border-gold-glow/40 relative overflow-hidden flex flex-col bg-charcoal/20 dark:bg-black/20"
                            >
                                {/* Decorative radial glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.15),_transparent_70%)] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                                {/* Header Actions */}
                                <div className="flex justify-between items-start mb-4 relative z-10 w-full">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${getStatusColor(trainer.status)}`}>
                                        {trainer.status}
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors outline-none">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-primary/20">
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">Trainer Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                                                <Eye className="w-3.5 h-3.5 text-primary dark:text-gold-glow" /> View Full Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                                                <Edit3 className="w-3.5 h-3.5" /> Edit Trainer Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                                                <Users className="w-3.5 h-3.5" /> Reassign Members
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                                                <Calendar className="w-3.5 h-3.5" /> View Schedule
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer text-primary dark:text-gold-glow font-medium">
                                                <MessageSquare className="w-3.5 h-3.5" /> Send Message
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Profile Info */}
                                <div className="flex flex-col items-center text-center space-y-3 mb-5 relative z-10">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/50 flex items-center justify-center text-2xl font-bold text-primary dark:text-gold-glow shadow-soft group-hover:shadow-glow transition-all duration-500 mb-1">
                                        {trainer.image}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-heading font-bold text-foreground dark:text-white leading-tight">
                                            {trainer.name}
                                        </h3>
                                        <p className="text-sm font-medium text-primary dark:text-gold-glow">
                                            {trainer.role}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap justify-center">
                                        <span className="px-3 py-1 rounded-full bg-background/50 border border-primary/10 text-xs text-muted-foreground dark:text-gray-300 font-medium">
                                            {trainer.specialization}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-primary/10 dark:bg-gold-glow/10 text-[11px] text-primary dark:text-gold-glow font-semibold">
                                            {trainer.experience}
                                        </span>
                                    </div>
                                </div>

                                {/* Availability / Schedule Pill */}
                                <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-primary/5 mb-5 relative z-10">
                                    <Clock className="w-3.5 h-3.5 text-primary dark:text-gold-glow flex-shrink-0" />
                                    <span className="text-xs font-semibold text-foreground/90 dark:text-gray-200 truncate">
                                        {trainer.availability}
                                    </span>
                                </div>

                                {/* Stats Grid: Assigned Members, Performance, Total Sessions */}
                                <div className="grid grid-cols-3 gap-2 py-3.5 px-2 border-t border-b border-black/5 dark:border-white/5 mb-5 relative z-10 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold text-foreground dark:text-white">
                                            {trainer.activeClients}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                            Assigned Members
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center border-l border-r border-black/10 dark:border-white/10 px-1">
                                        <span className="flex items-center justify-center gap-1 text-sm font-bold text-foreground dark:text-white">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {trainer.rating}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5 truncate">
                                            {trainer.performance}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold text-foreground dark:text-white">
                                            {trainer.totalSessions}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                            Total Sessions
                                        </span>
                                    </div>
                                </div>

                                {/* Contact Info Footer */}
                                <div className="mt-auto space-y-2.5 relative z-10 pt-1">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground group-hover:text-foreground/90 transition-colors">
                                        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-primary dark:text-gold-glow">
                                            <Mail className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="truncate">{trainer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground group-hover:text-foreground/90 transition-colors">
                                        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-primary dark:text-gold-glow">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="truncate">{trainer.phone}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB 2: RECEPTIONISTS GRID */}
            {activeTab === 'receptionists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedReceptionists.length === 0 ? (
                        <div className="col-span-full glass-card rounded-3xl p-12 text-center text-muted-foreground">
                            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-semibold">No receptionists found matching criteria</p>
                            <p className="text-xs mt-1">Try resetting your search or filter options.</p>
                        </div>
                    ) : (
                        displayedReceptionists.map((receptionist) => (
                            <div 
                                key={receptionist.id} 
                                className="glass-card rounded-3xl p-6 group transition-all duration-300 hover:scale-[1.01] border border-primary/10 hover:border-primary/30 dark:hover:border-gold-glow/40 relative overflow-hidden flex flex-col bg-charcoal/20 dark:bg-black/20"
                            >
                                {/* Decorative radial glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.15),_transparent_70%)] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                                {/* Header Actions */}
                                <div className="flex justify-between items-start mb-4 relative z-10 w-full">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${getStatusColor(receptionist.status)}`}>
                                        {receptionist.status}
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors outline-none">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-primary/20">
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">Receptionist Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                                                <Eye className="w-3.5 h-3.5 text-primary dark:text-gold-glow" /> View Full Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                                                <CalendarCheck className="w-3.5 h-3.5" /> Shift Roster
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                                                <Clock className="w-3.5 h-3.5" /> Attendance Log
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                                                <Edit3 className="w-3.5 h-3.5" /> Edit Staff Details
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer text-primary dark:text-gold-glow font-medium">
                                                <MessageSquare className="w-3.5 h-3.5" /> Send Message
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Profile Info */}
                                <div className="flex flex-col items-center text-center space-y-3 mb-5 relative z-10">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/50 flex items-center justify-center text-2xl font-bold text-primary dark:text-gold-glow shadow-soft group-hover:shadow-glow transition-all duration-500 mb-1">
                                        {receptionist.image}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-heading font-bold text-foreground dark:text-white leading-tight">
                                            {receptionist.name}
                                        </h3>
                                        <p className="text-sm font-medium text-primary dark:text-gold-glow">
                                            {receptionist.role}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap justify-center">
                                        <span className="px-3 py-1 rounded-full bg-background/50 border border-primary/10 text-xs text-muted-foreground dark:text-gray-300 font-medium flex items-center gap-1.5">
                                            <CalendarCheck className="w-3 h-3 text-emerald-500" />
                                            {receptionist.attendance}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-primary/10 dark:bg-gold-glow/10 text-[11px] text-primary dark:text-gold-glow font-semibold">
                                            {receptionist.performance}
                                        </span>
                                    </div>
                                </div>

                                {/* Shift Timings Pill */}
                                <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-primary/5 mb-5 relative z-10">
                                    <Clock className="w-3.5 h-3.5 text-primary dark:text-gold-glow flex-shrink-0" />
                                    <span className="text-xs font-semibold text-foreground/90 dark:text-gray-200 truncate">
                                        {receptionist.shiftTimings}
                                    </span>
                                </div>

                                {/* Stats Grid: Check-ins Managed, Membership Renewals, Membership Transfers */}
                                <div className="grid grid-cols-3 gap-2 py-3.5 px-2 border-t border-b border-black/5 dark:border-white/5 mb-5 relative z-10 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold text-foreground dark:text-white">
                                            {receptionist.checkInsManaged.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                            Check-ins
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center border-l border-r border-black/10 dark:border-white/10 px-1">
                                        <span className="text-sm font-bold text-foreground dark:text-white">
                                            {receptionist.membershipRenewals}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                            Renewals
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold text-foreground dark:text-white">
                                            {receptionist.membershipTransfers}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                            Transfers
                                        </span>
                                    </div>
                                </div>

                                {/* Performance Footer Info */}
                                <div className="flex items-center justify-between px-1 mb-3 relative z-10 text-xs">
                                    <span className="text-muted-foreground">Service Score:</span>
                                    <span className="flex items-center gap-1 font-bold text-foreground dark:text-white">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {receptionist.rating} / 5.0
                                    </span>
                                </div>

                                {/* Contact Info Footer */}
                                <div className="mt-auto space-y-2.5 relative z-10 pt-2 border-t border-primary/5 dark:border-white/5">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground group-hover:text-foreground/90 transition-colors">
                                        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-primary dark:text-gold-glow">
                                            <Mail className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="truncate">{receptionist.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground group-hover:text-foreground/90 transition-colors">
                                        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-primary dark:text-gold-glow">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="truncate">{receptionist.phone}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pagination / Load More */}
            <div className="flex justify-center mt-10">
                {((activeTab === 'trainers' && filteredTrainers.length > displayedTrainers.length) ||
                  (activeTab === 'receptionists' && filteredReceptionists.length > displayedReceptionists.length)) ? (
                    <button 
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="px-8 py-3 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-background/50 hover:bg-primary/10 transition-all text-sm font-semibold shadow-soft hover:shadow-glow"
                    >
                        Load More {activeTab === 'trainers' ? 'Trainers' : 'Receptionists'}
                    </button>
                ) : (
                    <span className="text-xs text-muted-foreground/70 font-medium">
                        All {activeTab === 'trainers' ? 'trainers' : 'receptionists'} loaded
                    </span>
                )}
            </div>
        </div>
    );
}

