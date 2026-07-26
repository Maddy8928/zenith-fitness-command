"use client";

import { 
    Search, Plus, Filter, MoreVertical, Star, Users, Award, 
    Mail, Phone, UserCheck, Shield, Clock, Briefcase, CalendarDays, CheckCircle2 
} from "lucide-react";
import { useState } from "react";

const trainersData = [
    { id: "T-01", name: "Alex Johnson", role: "Head Trainer", specialization: "HIIT & Functional", rating: 4.9, activeClients: 24, totalSessions: 1250, email: "alex.j@flexgym.com", phone: "(555) 111-2222", status: "Active", attendance: "Present" },
    { id: "T-02", name: "Sarah Williams", role: "Yoga Instructor", specialization: "Vinyasa & Mindfulness", rating: 4.8, activeClients: 35, totalSessions: 980, email: "sarah.w@flexgym.com", phone: "(555) 222-3333", status: "Active", attendance: "Present" },
    { id: "T-03", name: "Mike Tyson", role: "Strength Coach", specialization: "Powerlifting & Boxing", rating: 4.7, activeClients: 18, totalSessions: 1420, email: "mike.t@flexgym.com", phone: "(555) 333-4444", status: "On Leave", attendance: "On Leave" },
    { id: "T-04", name: "Emma Davis", role: "Cycling Instructor", specialization: "Spin & Endurance", rating: 4.9, activeClients: 42, totalSessions: 850, email: "emma.d@flexgym.com", phone: "(555) 444-5555", status: "Active", attendance: "Present" },
    { id: "T-05", name: "David Miller", role: "CrossFit Coach", specialization: "Olympics Lifts & WODs", rating: 4.6, activeClients: 22, totalSessions: 640, email: "david.m@flexgym.com", phone: "(555) 555-6666", status: "Active", attendance: "Present" },
    { id: "T-06", name: "Jessica Taylor", role: "Personal Trainer", specialization: "Core & Recovery", rating: 4.8, activeClients: 15, totalSessions: 420, email: "jessica.t@flexgym.com", phone: "(555) 666-7777", status: "Active", attendance: "Off Duty" },
];

const receptionistsData = [
    { id: "R-01", name: "Priya Patel", role: "Lead Front Desk", shift: "Morning (06:00 - 14:00)", desk: "Main Atrium Desk", rating: 4.9, email: "priya.p@flexgym.com", phone: "(555) 888-1111", status: "On Duty", attendance: "Present" },
    { id: "R-02", name: "Rohan Mehta", role: "Receptionist", shift: "Evening (14:00 - 22:00)", desk: "Main Atrium Desk", rating: 4.8, email: "rohan.m@flexgym.com", phone: "(555) 888-2222", status: "Scheduled", attendance: "Upcoming" },
    { id: "R-03", name: "Ananya Sharma", role: "Concierge & Desk", shift: "Morning (06:00 - 14:00)", desk: "VIP Welcome Lobby", rating: 4.9, email: "ananya.s@flexgym.com", phone: "(555) 888-3333", status: "On Duty", attendance: "Present" },
    { id: "R-04", name: "Kevin D'Souza", role: "Receptionist", shift: "Weekend Relief", desk: "Main Atrium Desk", rating: 4.7, email: "kevin.d@flexgym.com", phone: "(555) 888-4444", status: "Off Duty", attendance: "Off Duty" },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "Active":
        case "On Duty":
            return "bg-green-500/10 text-green-500 border-green-500/20";
        case "On Leave":
        case "Scheduled":
            return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        case "Inactive":
        case "Off Duty":
            return "bg-destructive/10 text-destructive border-destructive/20";
        default:
            return "bg-primary/10 text-primary border-primary/20";
    }
};

export default function StaffPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"Trainers" | "Receptionists">("Trainers");

    const filteredTrainers = trainersData.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredReceptionists = receptionistsData.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.shift.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">
                        Staff Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Consolidated executive oversight for Trainers and Receptionists.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors text-sm font-medium">
                        <Filter className="w-4 h-4 text-primary dark:text-gold-glow" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground font-semibold text-sm shadow-glow hover:shadow-glow/80 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" />
                        Add {activeTab === "Trainers" ? "Trainer" : "Receptionist"}
                    </button>
                </div>
            </div>

            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activeTab === "Trainers" ? [
                    { label: "Active Trainers", value: "42", icon: UserCheck, color: "text-primary dark:text-gold-glow" },
                    { label: "Avg. Client Rating", value: "4.8 ★", icon: Star, color: "text-amber-400" },
                    { label: "Active PT Members", value: "312", icon: Users, color: "text-emerald-400" },
                    { label: "Monthly Sessions", value: "5,450", icon: Award, color: "text-cyan-400" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-primary/10">
                        <div className={`p-3 rounded-full bg-background/50 ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground dark:text-white">{stat.value}</p>
                            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                        </div>
                    </div>
                )) : [
                    { label: "Active Desk Staff", value: "8", icon: Briefcase, color: "text-primary dark:text-gold-glow" },
                    { label: "Shift Coverage", value: "100%", icon: CheckCircle2, color: "text-emerald-400" },
                    { label: "Avg. Desk Speed", value: "2.4s", icon: Clock, color: "text-cyan-400" },
                    { label: "Staff Satisfaction", value: "4.9 ★", icon: Star, color: "text-amber-400" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-primary/10">
                        <div className={`p-3 rounded-full bg-background/50 ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground dark:text-white">{stat.value}</p>
                            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Role Navigation Tabs: Trainers | Receptionists */}
            <div className="flex items-center gap-2 border-b border-primary/10 pb-1">
                {(["Trainers", "Receptionists"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === tab
                                ? "bg-primary/15 text-primary dark:text-gold-glow border border-primary/30 shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                    >
                        {tab === "Trainers" ? <Award className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="glass-card rounded-3xl border border-primary/10 overflow-hidden shadow-soft flex flex-col min-h-[450px]">
                {/* Filter / Search Header */}
                <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-charcoal/30 dark:bg-black/20">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab.toLowerCase()} by name or role...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                        Displaying <span className="font-bold text-foreground dark:text-white">
                            {activeTab === "Trainers" ? filteredTrainers.length : filteredReceptionists.length}
                        </span> staff members
                    </div>
                </div>

                {/* Trainers View */}
                {activeTab === "Trainers" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-primary/10 text-xs uppercase tracking-wider font-semibold text-muted-foreground bg-black/5 dark:bg-white/5">
                                    <th className="px-6 py-4">Trainer Profile</th>
                                    <th className="px-6 py-4">Specialization</th>
                                    <th className="px-6 py-4">Assigned Members</th>
                                    <th className="px-6 py-4">Sessions</th>
                                    <th className="px-6 py-4">Attendance</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-primary/5">
                                {filteredTrainers.map((trainer) => (
                                    <tr key={trainer.id} className="group hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {trainer.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground dark:text-white text-base">{trainer.name}</span>
                                                    <span className="text-xs text-muted-foreground">{trainer.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                                            {trainer.specialization}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-primary dark:text-gold-glow">{trainer.activeClients}</span>
                                            <span className="text-xs text-muted-foreground ml-1">active clients</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-mono">
                                            {trainer.totalSessions.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-semibold text-emerald-400">{trainer.attendance}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusColor(trainer.status)}`}>
                                                {trainer.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className="text-sm font-medium text-primary dark:text-gold-glow hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10">
                                                Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-primary/10 text-xs uppercase tracking-wider font-semibold text-muted-foreground bg-black/5 dark:bg-white/5">
                                    <th className="px-6 py-4">Receptionist Profile</th>
                                    <th className="px-6 py-4">Assigned Shift</th>
                                    <th className="px-6 py-4">Desk Location</th>
                                    <th className="px-6 py-4">Attendance</th>
                                    <th className="px-6 py-4">Performance</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-primary/5">
                                {filteredReceptionists.map((staff) => (
                                    <tr key={staff.id} className="group hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-sm">
                                                    {staff.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground dark:text-white text-base">{staff.name}</span>
                                                    <span className="text-xs text-muted-foreground">{staff.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                                            {staff.shift}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {staff.desk}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-semibold text-emerald-400">{staff.attendance}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-400">
                                            {staff.rating} ★
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusColor(staff.status)}`}>
                                                {staff.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className="text-sm font-medium text-primary dark:text-gold-glow hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10">
                                                Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
