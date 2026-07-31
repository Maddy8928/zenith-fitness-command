"use client";

import React, { useState } from "react";
import { 
    Search, MoreVertical, Star, Users, Award, Mail, Phone, 
    Table as TableIcon, LayoutGrid, Eye, UserCheck, Activity
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import TrainerProfileDrawer from "@/components/admin/TrainerProfileDrawer";

const trainersData = [
    { id: "T-01", name: "Alex Johnson", role: "Head Trainer", specialization: "HIIT & Functional", rating: 4.9, activeClients: 24, totalSessions: 1250, attendance: "98%", email: "alex.j@flexgym.com", phone: "(555) 111-2222", status: "Active", image: "AJ" },
    { id: "T-02", name: "Sarah Williams", role: "Yoga Instructor", specialization: "Vinyasa & Mindfulness", rating: 4.8, activeClients: 35, totalSessions: 980, attendance: "96%", email: "sarah.w@flexgym.com", phone: "(555) 222-3333", status: "Active", image: "SW" },
    { id: "T-03", name: "Mike Tyson", role: "Strength Coach", specialization: "Powerlifting & Boxing", rating: 4.7, activeClients: 18, totalSessions: 1420, attendance: "89%", email: "mike.t@flexgym.com", phone: "(555) 333-4444", status: "On Leave", image: "MT" },
    { id: "T-04", name: "Emma Davis", role: "Cycling Instructor", specialization: "Spin & Endurance", rating: 4.9, activeClients: 42, totalSessions: 850, attendance: "99%", email: "emma.d@flexgym.com", phone: "(555) 444-5555", status: "Active", image: "ED" },
    { id: "T-05", name: "David Miller", role: "CrossFit Coach", specialization: "Olympics Lifts & WODs", rating: 4.6, activeClients: 22, totalSessions: 640, attendance: "95%", email: "david.m@flexgym.com", phone: "(555) 555-6666", status: "Active", image: "DM" },
    { id: "T-06", name: "Jessica Taylor", role: "Personal Trainer", specialization: "Core & Recovery", rating: 4.8, activeClients: 15, totalSessions: 420, attendance: "94%", email: "jessica.t@flexgym.com", phone: "(555) 666-7777", status: "Active", image: "JT" },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "Active": return "bg-green-500/10 text-green-500 border-green-500/20";
        case "On Leave": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        case "Inactive": return "bg-destructive/10 text-destructive border-destructive/20";
        default: return "bg-primary/10 text-primary border-primary/20";
    }
};

export default function TrainersPage() {
    const { user, isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Only authenticated admin users can see & click the Profile action
    const isAdmin = isAuthenticated && (user?.role === "ADMIN" || user?.role === "RECEPTIONIST");

    const filteredTrainers = trainersData.filter((trainer) =>
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenProfile = (trainerId: string) => {
        if (!isAdmin) return;
        setSelectedTrainerId(trainerId);
        setIsDrawerOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">Trainers</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage staff, performance, and schedules.</p>
                </div>
            </div>

            {/* Search and View Switcher */}
            <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search trainers by name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 whitespace-nowrap">
                            <Users className="w-4 h-4 text-primary dark:text-gold-glow" />
                            <span className="text-sm font-medium">Total: 42</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 whitespace-nowrap">
                            <Award className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">Active: 38</span>
                        </div>
                    </div>

                    {/* Table / Grid Mode Toggle */}
                    <div className="flex items-center gap-1 bg-black/10 dark:bg-white/5 p-1 rounded-xl border border-primary/10">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === "table"
                                    ? "bg-primary text-primary-foreground shadow-glow"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            title="Table View"
                        >
                            <TableIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === "grid"
                                    ? "bg-primary text-primary-foreground shadow-glow"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Trainer Management Table (Admin Dashboard UI) */}
            {viewMode === "table" ? (
                <div className="glass-card rounded-3xl border border-primary/10 overflow-hidden shadow-soft">
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
                                    <th className="px-6 py-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-primary/5">
                                {filteredTrainers.map((trainer) => (
                                    <tr
                                        key={trainer.id}
                                        className="group hover:bg-primary/[0.03] dark:hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/50 flex items-center justify-center text-primary dark:text-gold-glow font-bold text-sm shadow-soft">
                                                    {trainer.image}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground dark:text-white text-base">
                                                        {trainer.name}
                                                    </span>
                                                    <span className="text-xs text-primary dark:text-gold-glow font-medium">
                                                        {trainer.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full bg-background/50 border border-primary/10 text-xs font-medium text-muted-foreground dark:text-gray-300">
                                                {trainer.specialization}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-foreground dark:text-white">
                                                {trainer.activeClients}
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-1">clients</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-primary dark:text-gold-glow font-bold">
                                            {trainer.totalSessions.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-emerald-400">
                                            {trainer.attendance}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${getStatusColor(trainer.status)}`}>
                                                {trainer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            {/* Clickable Profile button — Admin Dashboard only */}
                                            {isAdmin ? (
                                                <button
                                                    onClick={() => handleOpenProfile(trainer.id)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary dark:text-gold-glow font-bold text-xs shadow-soft hover:shadow-glow transition-all"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Profile
                                                </button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground font-mono">Restricted</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Trainers Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTrainers.map((trainer) => (
                        <div
                            key={trainer.id}
                            className="glass-card rounded-3xl p-6 group transition-all duration-300 hover:scale-[1.02] border border-primary/10 hover:border-primary/30 dark:hover:border-gold-glow/40 relative overflow-hidden flex flex-col bg-charcoal/20 dark:bg-black/20"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.15),_transparent_70%)] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                            <div className="flex justify-between items-start mb-4 relative z-10 w-full">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${getStatusColor(trainer.status)}`}>
                                    {trainer.status}
                                </span>
                                {isAdmin && (
                                    <button
                                        onClick={() => handleOpenProfile(trainer.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary dark:text-gold-glow font-bold text-xs shadow-soft hover:shadow-glow transition-all"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Profile
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col items-center text-center space-y-3 mb-6 relative z-10">
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
                                <div className="px-3 py-1 rounded-full bg-background/50 border border-primary/5 text-xs text-muted-foreground dark:text-gray-400">
                                    {trainer.specialization}
                                </div>
                            </div>

                            <div className="flex items-center justify-around w-full py-3 border-t border-b border-black/5 dark:border-white/5 mb-6 relative z-10 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg">
                                <div className="flex flex-col items-center">
                                    <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {trainer.rating}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Rating</span>
                                </div>
                                <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-bold text-foreground">{trainer.activeClients}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Clients</span>
                                </div>
                                <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-bold text-foreground">{trainer.totalSessions}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sessions</span>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3 relative z-10">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                    <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-primary dark:text-gold-glow">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="truncate">{trainer.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                    <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-primary dark:text-gold-glow">
                                        <Phone className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="truncate">{trainer.phone}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination / Load More */}
            <div className="flex justify-center mt-8">
                <button className="px-6 py-2.5 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-background/50 hover:bg-primary/10 transition-colors text-sm font-medium">
                    Load More Trainers
                </button>
            </div>

            {/* Live Interactive Admin-Only Trainer Profile Drawer */}
            <TrainerProfileDrawer
                trainerId={selectedTrainerId}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    );
}
