"use client";

import { 
    Search, MoreVertical, Plus, Filter, UserCheck, Shield, AtSign, 
    Phone, Activity, CalendarDays, TrendingUp, Dumbbell, Clock, Users,
    CheckCircle2, AlertCircle
} from "lucide-react";
import { useState } from "react";

const membersData = [
    { id: "M-1024", name: "Alex Johnson", email: "alex.j@example.com", phone: "(555) 123-4567", plan: "Elite Annual", joinDate: "Oct 12, 2023", lastVisit: "Today, 09:45 AM", status: "Active", trainer: "Alex Johnson" },
    { id: "M-1023", name: "Sarah Williams", email: "sarah.w@example.com", phone: "(555) 234-5678", plan: "Pro Monthly", joinDate: "Nov 05, 2023", lastVisit: "Today, 08:30 AM", status: "Active", trainer: "Emma Davis" },
    { id: "M-1022", name: "Michael Chen", email: "m.chen@example.com", phone: "(555) 345-6789", plan: "Starter Monthly", joinDate: "Dec 20, 2023", lastVisit: "Yesterday", status: "Pending", trainer: "Unassigned" },
    { id: "M-1021", name: "Emma Davis", email: "emma.d@example.com", phone: "(555) 456-7890", plan: "Pro Monthly", joinDate: "Jan 15, 2024", lastVisit: "2 days ago", status: "Inactive", trainer: "Mike Tyson" },
    { id: "M-1020", name: "David Miller", email: "d.miller@example.com", phone: "(555) 567-8901", plan: "Elite Annual", joinDate: "Feb 01, 2024", lastVisit: "Today, 06:15 AM", status: "Active", trainer: "Sarah Williams" },
    { id: "M-1019", name: "Jessica Taylor", email: "j.taylor@example.com", phone: "(555) 678-9012", plan: "Starter Monthly", joinDate: "Mar 10, 2024", lastVisit: "1 week ago", status: "Frozen", trainer: "Jessica Taylor" },
];

const memberTabs = [
    { id: "All Members", label: "All Members", icon: Users },
    { id: "Active Members", label: "Active Members", icon: UserCheck },
    { id: "Expired Members", label: "Expired Members", icon: AlertCircle },
    { id: "Memberships", label: "Memberships", icon: Shield },
    { id: "Attendance", label: "Attendance", icon: CalendarDays },
    { id: "Progress Overview", label: "Progress Overview", icon: TrendingUp },
    { id: "Personal Training", label: "Personal Training", icon: Dumbbell },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "Active": return "bg-green-500/10 text-green-500 border-green-500/20";
        case "Pending": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        case "Inactive": return "bg-destructive/10 text-destructive border-destructive/20";
        case "Frozen": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        default: return "bg-primary/10 text-primary border-primary/20";
    }
};

export default function MembersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("All Members");

    const filteredMembers = membersData.filter((member) => {
        const matchesSearch = 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.phone.includes(searchTerm);
            
        if (!matchesSearch) return false;

        if (activeTab === "Active Members") {
            return member.status === "Active";
        }
        if (activeTab === "Expired Members") {
            return member.status === "Inactive" || member.status === "Frozen";
        }
        return true;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">
                        Member Management Hub
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Centralized control for members, memberships, attendance, progress, and personal training.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors text-sm font-medium">
                        <Filter className="w-4 h-4 text-primary dark:text-gold-glow" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground font-semibold text-sm shadow-glow hover:shadow-glow/80 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" />
                        Add Member
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Members", value: "3,248", icon: UserCheck, color: "text-primary dark:text-gold-glow" },
                    { label: "Active Plans", value: "2,845", icon: Shield, color: "text-green-500" },
                    { label: "Expired / Frozen", value: "184", icon: AlertCircle, color: "text-rose-500" },
                    { label: "PT Enrolled", value: "312", icon: Dumbbell, color: "text-accent dark:text-neon-cyan" },
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

            {/* Navigation Tabs - Central Hub Structure */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-primary/10">
                {memberTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                isActive
                                    ? "bg-primary/15 text-primary dark:text-gold-glow border border-primary/30 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-primary dark:text-gold-glow" : ""}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content - Consolidated Hub */}
            {(activeTab === "All Members" || activeTab === "Active Members" || activeTab === "Expired Members") && (
                <div className="glass-card rounded-3xl border border-primary/10 overflow-hidden shadow-soft flex flex-col min-h-[450px]">
                    {/* Table Header / Search */}
                    <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-charcoal/30 dark:bg-black/20">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                            Displaying <span className="font-bold text-foreground dark:text-white">{filteredMembers.length}</span> records
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-primary/10 text-xs uppercase tracking-wider font-semibold text-muted-foreground bg-black/5 dark:bg-white/5">
                                    <th className="px-6 py-4">Member Info</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Membership</th>
                                    <th className="px-6 py-4">Last Visit</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-primary/5">
                                {filteredMembers.map((member) => (
                                    <tr key={member.id} className="group hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground dark:text-white text-base">{member.name}</span>
                                                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1 font-mono">{member.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs"><AtSign className="w-3 h-3" /> {member.email}</span>
                                                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs"><Phone className="w-3 h-3" /> {member.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-foreground">{member.plan}</span>
                                                <span className="text-xs text-muted-foreground">Joined {member.joinDate}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {member.lastVisit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusColor(member.status)}`}>
                                                {member.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className="text-sm font-medium text-primary dark:text-gold-glow hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10">
                                                Edit
                                            </button>
                                            <button className="ml-2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-white/5">
                                                <MoreVertical className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="p-4 mt-auto border-t border-primary/10 flex items-center justify-between text-sm text-muted-foreground bg-charcoal/30 dark:bg-black/20">
                        <p>Showing <span className="font-medium text-foreground">{filteredMembers.length}</span> members in current view</p>
                        <div className="flex gap-1">
                            <button className="px-3 py-1.5 rounded-lg hover:bg-charcoal dark:hover:bg-white/5 transition-colors disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary dark:text-gold-glow font-medium">1</button>
                            <button className="px-3 py-1.5 rounded-lg hover:bg-charcoal dark:hover:bg-white/5 transition-colors">Next</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Memberships" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Starter Monthly", price: "₹2,499 / mo", active: 820, revenue: "₹20.49 L", color: "border-cyan-500/20" },
                        { title: "Pro Monthly", price: "₹4,499 / mo", active: 1340, revenue: "₹60.28 L", color: "border-primary/40" },
                        { title: "Elite Annual", price: "₹24,999 / yr", active: 685, revenue: "₹1.71 Cr", color: "border-amber-500/30" },
                    ].map((plan, idx) => (
                        <div key={idx} className={`glass-card rounded-3xl p-6 border ${plan.color} flex flex-col justify-between space-y-4`}>
                            <div>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{plan.title}</span>
                                <h3 className="text-2xl font-heading font-bold text-foreground dark:text-white mt-1">{plan.price}</h3>
                            </div>
                            <div className="space-y-2 pt-4 border-t border-primary/10 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Active Members:</span>
                                    <span className="font-bold text-foreground dark:text-white">{plan.active}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Monthly Run-rate:</span>
                                    <span className="font-bold text-emerald-400">{plan.revenue}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "Attendance" && (
                <div className="glass-card rounded-3xl p-8 border border-primary/10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-foreground dark:text-white">Attendance & Peak Check-in Metrics</h3>
                            <p className="text-xs text-muted-foreground">Daily facility utilization and peak member volume.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">Live Peak · 84% Capacity</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5">
                            <span className="text-xs text-muted-foreground uppercase font-bold">Today&apos;s Total Check-ins</span>
                            <p className="text-3xl font-heading font-bold text-foreground dark:text-white mt-1">428</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5">
                            <span className="text-xs text-muted-foreground uppercase font-bold">Peak Facility Hours</span>
                            <p className="text-3xl font-heading font-bold text-foreground dark:text-white mt-1">17:00 - 20:00</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5">
                            <span className="text-xs text-muted-foreground uppercase font-bold">Avg. Daily Attendance</span>
                            <p className="text-3xl font-heading font-bold text-foreground dark:text-white mt-1">415</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Progress Overview" && (
                <div className="glass-card rounded-3xl p-8 border border-primary/10 space-y-6">
                    <div>
                        <h3 className="text-lg font-heading font-bold text-foreground dark:text-white">Member Progress & Goal Attainment</h3>
                        <p className="text-xs text-muted-foreground">Consolidated fitness milestones across active training plans.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5">
                            <span className="text-xs text-muted-foreground uppercase font-bold">Goals Achieved This Month</span>
                            <p className="text-3xl font-heading font-bold text-emerald-400 mt-1">142 Members</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5">
                            <span className="text-xs text-muted-foreground uppercase font-bold">Avg. Weight / Fat Loss Goal Rate</span>
                            <p className="text-3xl font-heading font-bold text-foreground dark:text-white mt-1">78.4%</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5">
                            <span className="text-xs text-muted-foreground uppercase font-bold">Workout Adherence</span>
                            <p className="text-3xl font-heading font-bold text-primary dark:text-gold-glow mt-1">89.2%</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Personal Training" && (
                <div className="glass-card rounded-3xl p-8 border border-primary/10 space-y-6">
                    <div>
                        <h3 className="text-lg font-heading font-bold text-foreground dark:text-white">Personal Training Enrollees</h3>
                        <p className="text-xs text-muted-foreground">Members enrolled in 1-on-1 personal training packages.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {membersData.slice(0, 4).map((m, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-charcoal/40 dark:bg-black/20 border border-primary/5 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-foreground dark:text-white">{m.name}</p>
                                    <p className="text-xs text-muted-foreground">Assigned Trainer: <span className="font-bold text-primary dark:text-gold-glow">{m.trainer}</span></p>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">12 Sessions Left</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
