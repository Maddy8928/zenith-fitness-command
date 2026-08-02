"use client";

import { Search, MoreVertical, Plus, Filter, UserCheck, Shield, AtSign, Phone, Activity } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const membersData = [
    { id: "M-1024", name: "Alex Johnson", email: "alex.j@example.com", phone: "(555) 123-4567", plan: "Elite Annual", joinDate: "Oct 12, 2023", lastVisit: "Today, 09:45 AM", status: "Active" },
    { id: "M-1023", name: "Sarah Williams", email: "sarah.w@example.com", phone: "(555) 234-5678", plan: "Pro Monthly", joinDate: "Nov 05, 2023", lastVisit: "Today, 08:30 AM", status: "Active" },
    { id: "M-1022", name: "Michael Chen", email: "m.chen@example.com", phone: "(555) 345-6789", plan: "Starter Monthly", joinDate: "Dec 20, 2023", lastVisit: "Yesterday", status: "Pending" },
    { id: "M-1021", name: "Emma Davis", email: "emma.d@example.com", phone: "(555) 456-7890", plan: "Pro Monthly", joinDate: "Jan 15, 2024", lastVisit: "2 days ago", status: "Inactive" },
    { id: "M-1020", name: "David Miller", email: "d.miller@example.com", phone: "(555) 567-8901", plan: "Elite Annual", joinDate: "Feb 01, 2024", lastVisit: "Today, 06:15 AM", status: "Active" },
    { id: "M-1019", name: "Jessica Taylor", email: "j.taylor@example.com", phone: "(555) 678-9012", plan: "Starter Monthly", joinDate: "Mar 10, 2024", lastVisit: "1 week ago", status: "Frozen" },
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

function MembersPageContent() {
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get("status") || "All";
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(initialStatus);

    const filteredMembers = membersData.filter((member) => {
        const matchesSearch =
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.phone.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            selectedStatus === "All" || member.status.toLowerCase() === selectedStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">Members</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage all gym members, memberships, and statuses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors text-sm font-medium">
                        <Filter className="w-4 h-4 text-primary dark:text-gold-glow" />
                        Filters
                    </button>
                    <Link href="/receptionist/members/new" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground font-semibold text-sm shadow-glow hover:shadow-glow/80 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" />
                        Add Member
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Members", value: "3,248", icon: UserCheck, color: "text-primary dark:text-gold-glow" },
                    { label: "Active Plans", value: "2,845", icon: Shield, color: "text-green-500" },
                    { label: "Pending", value: "142", icon: Activity, color: "text-orange-500" },
                    { label: "New This Month", value: "84", icon: Plus, color: "text-accent dark:text-neon-cyan" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-4">
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

            {/* Main Content Area */}
            <div className="glass-card rounded-3xl border border-primary/10 overflow-hidden shadow-soft flex flex-col min-h-[500px]">
                {/* Table Header / Filters */}
                <div className="p-6 border-b border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-charcoal/30 dark:bg-black/20">
                    <div className="flex flex-wrap items-center gap-2">
                        {["All", "Active", "Pending", "Inactive", "Frozen"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                    selectedStatus.toLowerCase() === status.toLowerCase()
                                        ? "bg-primary dark:bg-gold-glow text-black font-bold shadow-glow"
                                        : "bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground border border-primary/10"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
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
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                        <thead>
                            <tr className="border-b border-primary/10 text-xs uppercase tracking-wider font-semibold text-muted-foreground bg-black/5 dark:bg-white/5">
                                <th className="px-6 py-4 w-[24%]">Member Info</th>
                                <th className="px-6 py-4 w-[22%]">Contact</th>
                                <th className="px-6 py-4 w-[16%]">Membership</th>
                                <th className="px-6 py-4 w-[14%]">Last Visit</th>
                                <th className="px-6 py-4 w-[12%]">Status</th>
                                <th className="px-6 py-4 text-right w-[12%]">Actions</th>
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

                {/* Pagination */}
                <div className="p-4 mt-auto border-t border-primary/10 flex items-center justify-between text-sm text-muted-foreground bg-charcoal/30 dark:bg-black/20">
                    <p>Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">6</span> of <span className="font-medium text-foreground">3,248</span> members</p>
                    <div className="flex gap-1">
                        <button className="px-3 py-1.5 rounded-lg hover:bg-charcoal dark:hover:bg-white/5 transition-colors disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary dark:text-gold-glow font-medium">1</button>
                        <button className="px-3 py-1.5 rounded-lg hover:bg-charcoal dark:hover:bg-white/5 transition-colors">2</button>
                        <button className="px-3 py-1.5 rounded-lg hover:bg-charcoal dark:hover:bg-white/5 transition-colors">3</button>
                        <button className="px-3 py-1.5 rounded-lg hover:bg-charcoal dark:hover:bg-white/5 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MembersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading members...</div>}>
            <MembersPageContent />
        </Suspense>
    );
}
