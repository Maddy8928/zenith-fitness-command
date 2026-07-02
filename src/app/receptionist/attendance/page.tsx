"use client";

import React, { useState } from 'react';
import { Search, Flame, Activity, Heart, CalendarDays, Clock, User, CheckCircle2, XCircle, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

type ClassSession = {
    id: string;
    title: string;
    instructor: string;
    time: string;
    type: 'Cardio' | 'Strength' | 'Flexibility' | 'Other';
    enrolled: number;
    capacity: number;
    roster: RosterMember[];
};

type RosterMember = {
    id: string;
    name: string;
    status: 'Present' | 'Absent' | 'Pending';
    plan: string;
};

const mockClasses: ClassSession[] = [
    {
        id: 'c1', title: 'HIIT Extreme', instructor: 'Marcus Johnson', time: '07:00 AM - 08:00 AM', type: 'Cardio', enrolled: Math.floor(Math.random() * 20) + 5, capacity: 25,
        roster: [
            { id: 'm1', name: 'Michael Chen', status: 'Present', plan: 'Premium' },
            { id: 'm2', name: 'Sarah Jenkins', status: 'Pending', plan: 'Standard' },
            { id: 'm3', name: 'William Garcia', status: 'Absent', plan: 'Premium' },
            { id: 'm4', name: 'Emma Wilson', status: 'Pending', plan: 'Basic' },
            { id: 'm5', name: 'Olivia Davis', status: 'Present', plan: 'Premium' }
        ]
    },
    {
        id: 'c2', title: 'Power Yoga', instructor: 'Sarah Jenkins', time: '09:00 AM - 10:15 AM', type: 'Flexibility', enrolled: 3, capacity: 30,
        roster: [
            { id: 'm6', name: 'David Miller', status: 'Pending', plan: 'Basic' },
            { id: 'm7', name: 'Sophia Martinez', status: 'Pending', plan: 'Standard' },
            { id: 'm8', name: 'James Thompson', status: 'Pending', plan: 'Premium' }
        ]
    },
    {
        id: 'c3', title: 'Strength & Core', instructor: 'David Miller', time: '12:00 PM - 01:00 PM', type: 'Strength', enrolled: 4, capacity: 20,
        roster: [
            { id: 'm9', name: 'Lucas White', status: 'Pending', plan: 'Premium' },
            { id: 'm10', name: 'Mia Brown', status: 'Pending', plan: 'Standard' },
            { id: 'm11', name: 'Henry Davis', status: 'Pending', plan: 'Basic' },
            { id: 'm12', name: 'Amelia Clark', status: 'Pending', plan: 'Premium' }
        ]
    }
];

export default function AttendancePanel() {
    const [selectedClass, setSelectedClass] = useState<ClassSession>(mockClasses[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roster, setRoster] = useState<RosterMember[]>(mockClasses[0].roster);

    // Update roster when selected class changes
    const handleClassSelect = (cls: ClassSession) => {
        setSelectedClass(cls);
        setRoster(cls.roster);
        setSearchTerm('');
    };

    const handleStatusChange = (memberId: string, newStatus: 'Present' | 'Absent' | 'Pending') => {
        setRoster(prev => prev.map(member =>
            member.id === memberId ? { ...member, status: newStatus } : member
        ));
    };

    const handleSaveAttendance = () => {
        toast.success("Attendance records saved successfully!");
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Cardio': return <Flame className="w-4 h-4 text-orange-500" />;
            case 'Strength': return <Activity className="w-4 h-4 text-blue-500" />;
            case 'Flexibility': return <Heart className="w-4 h-4 text-rose-400" />;
            default: return <CalendarDays className="w-4 h-4 text-slate-400" />;
        }
    };

    const filteredRoster = roster.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const presentCount = roster.filter(m => m.status === 'Present').length;
    const absentCount = roster.filter(m => m.status === 'Absent').length;
    const pendingCount = roster.filter(m => m.status === 'Pending').length;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">

            {/* Left Sidebar - Classes List */}
            <div className="w-full lg:w-[350px] flex-shrink-0 flex flex-col space-y-4">
                <header>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Check-ins</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage class rosters and verify member check-ins.</p>
                </header>

                <div className="glass-card rounded-2xl flex-1 overflow-y-auto p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Today's Sessions</h3>

                    {mockClasses.map(cls => {
                        const isSelected = selectedClass.id === cls.id;
                        return (
                            <div
                                key={cls.id}
                                onClick={() => handleClassSelect(cls)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-primary/10 border-primary shadow-[0_0_15px_hsl(var(--gold)/0.15)]' : 'bg-black/20 border-white/5 hover:border-primary/30'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{cls.title}</h4>
                                    {getTypeIcon(cls.type)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    {cls.time}
                                </div>
                                <div className="flex justify-between items-center text-xs mt-3">
                                    <span className="text-muted-foreground">Instructor: <span className="text-slate-300">{cls.instructor}</span></span>
                                    <span className="font-medium bg-white/5 px-2 py-1 rounded-md">
                                        {cls.enrolled} / {cls.capacity}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Right Side - Roster Management */}
            <div className="flex-1 glass-card rounded-3xl flex flex-col overflow-hidden border border-primary/20 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-black/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    {getTypeIcon(selectedClass.type)}
                                    {selectedClass.type}
                                </span>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-4 h-4" /> {selectedClass.time}
                                </span>
                            </div>
                            <h2 className="text-2xl font-heading font-bold text-foreground">{selectedClass.title} Roster</h2>
                            <p className="text-slate-400 text-sm mt-1">Instructor: {selectedClass.instructor}</p>
                        </div>
                        <button onClick={handleSaveAttendance} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-semibold uppercase tracking-wide gold-glow hover:bg-primary/90 transition-all">
                            <Save className="w-4 h-4" />
                            Save Roster
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Present</span>
                            <span className="text-xl font-bold text-emerald-400">{presentCount}</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Absent</span>
                            <span className="text-xl font-bold text-rose-400">{absentCount}</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Pending</span>
                            <span className="text-xl font-bold text-amber-400">{pendingCount}</span>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search member..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-primary/20 rounded-lg py-2 pl-9 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                        />
                    </div>
                </div>

                {/* Roster Table */}
                <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-charcoal/90 backdrop-blur-md z-10 shadow-md">
                            <tr className="border-b border-white/10">
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member</th>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Status</th>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Mark Attendance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRoster.map(member => (
                                <tr key={member.id} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-foreground">{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-slate-300">{member.plan}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border flex items-center gap-1.5 w-fit ${member.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                            member.status === 'Absent' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                                'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                            }`}>
                                            {member.status === 'Present' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                                                member.status === 'Absent' ? <XCircle className="w-3.5 h-3.5" /> :
                                                    <AlertCircle className="w-3.5 h-3.5" />}
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 bg-black/40 rounded-lg p-1 border border-white/5 w-fit ml-auto">
                                            <button
                                                onClick={() => handleStatusChange(member.id, 'Present')}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${member.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-muted-foreground hover:text-emerald-400 hover:bg-white/5 border border-transparent'}`}
                                            >
                                                Present
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(member.id, 'Absent')}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${member.status === 'Absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-muted-foreground hover:text-rose-400 hover:bg-white/5 border border-transparent'}`}
                                            >
                                                Absent
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(member.id, 'Pending')}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${member.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-muted-foreground hover:text-amber-400 hover:bg-white/5 border border-transparent'}`}
                                            >
                                                Pending
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredRoster.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                        No members found in roster matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
