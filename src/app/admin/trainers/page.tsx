"use client";

import { Search, Plus, Filter, MoreVertical, Star, Users, Award, Mail, Phone } from "lucide-react";
import { useState } from "react";

const trainersData = [
    { id: "T-01", name: "Alex Johnson", role: "Head Trainer", specialization: "HIIT & Functional", rating: 4.9, activeClients: 24, totalSessions: 1250, email: "alex.j@nexusgym.com", phone: "(555) 111-2222", status: "Active", image: "AJ" },
    { id: "T-02", name: "Sarah Williams", role: "Yoga Instructor", specialization: "Vinyasa & Mindfulness", rating: 4.8, activeClients: 35, totalSessions: 980, email: "sarah.w@nexusgym.com", phone: "(555) 222-3333", status: "Active", image: "SW" },
    { id: "T-03", name: "Mike Tyson", role: "Strength Coach", specialization: "Powerlifting & Boxing", rating: 4.7, activeClients: 18, totalSessions: 1420, email: "mike.t@nexusgym.com", phone: "(555) 333-4444", status: "On Leave", image: "MT" },
    { id: "T-04", name: "Emma Davis", role: "Cycling Instructor", specialization: "Spin & Endurance", rating: 4.9, activeClients: 42, totalSessions: 850, email: "emma.d@nexusgym.com", phone: "(555) 444-5555", status: "Active", image: "ED" },
    { id: "T-05", name: "David Miller", role: "CrossFit Coach", specialization: "Olympics Lifts & WODs", rating: 4.6, activeClients: 22, totalSessions: 640, email: "david.m@nexusgym.com", phone: "(555) 555-6666", status: "Active", image: "DM" },
    { id: "T-06", name: "Jessica Taylor", role: "Personal Trainer", specialization: "Core & Recovery", rating: 4.8, activeClients: 15, totalSessions: 420, email: "jessica.t@nexusgym.com", phone: "(555) 666-7777", status: "Active", image: "JT" },
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
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">Trainers</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage staff, performance, and schedules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors text-sm font-medium">
                        <Filter className="w-4 h-4 text-primary dark:text-gold-glow" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground font-semibold text-sm shadow-glow hover:shadow-glow/80 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" />
                        Add Trainer
                    </button>
                </div>
            </div>

            {/* Quick Stats Search/Filter Bar */}
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
                <div className="flex gap-4 w-full sm:w-auto overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 whitespace-nowrap">
                        <Users className="w-4 h-4 text-primary dark:text-gold-glow" />
                        <span className="text-sm font-medium">Total: 42</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 whitespace-nowrap">
                        <Award className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Active: 38</span>
                    </div>
                </div>
            </div>

            {/* Trainers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trainersData.map((trainer) => (
                    <div key={trainer.id} className="glass-card rounded-3xl p-6 group transition-all duration-300 hover:scale-[1.02] border border-primary/10 hover:border-primary/30 dark:hover:border-gold-glow/40 relative overflow-hidden flex flex-col bg-charcoal/20 dark:bg-black/20">
                        {/* Decorative background glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,_hsl(var(--gold)/0.15),_transparent_70%)] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                        {/* Header Actions */}
                        <div className="flex justify-between items-start mb-4 relative z-10 w-full">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${getStatusColor(trainer.status)}`}>
                                {trainer.status}
                            </span>
                            <button className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div className="flex flex-col items-center text-center space-y-3 mb-6 relative z-10">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/50 flex items-center justify-center text-2xl font-bold text-primary dark:text-gold-glow shadow-soft group-hover:shadow-glow transition-all duration-500 mb-1">
                                {trainer.image}
                            </div>
                            <div>
                                <h3 className="text-lg font-heading font-bold text-foreground dark:text-white leading-tight">{trainer.name}</h3>
                                <p className="text-sm font-medium text-primary dark:text-gold-glow">{trainer.role}</p>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-background/50 border border-primary/5 text-xs text-muted-foreground dark:text-gray-400">
                                {trainer.specialization}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-around w-full py-3 border-t border-b border-black/5 dark:border-white/5 mb-6 relative z-10 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg">
                            <div className="flex flex-col items-center">
                                <span className="flex items-center gap-1 text-sm font-bold text-foreground"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {trainer.rating}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Rating</span>
                            </div>
                            <div className="w-px h-8 bg-black/10 dark:bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-bold text-foreground">{trainer.activeClients}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Clients</span>
                            </div>
                            <div className="w-px h-8 bg-black/10 dark:bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-bold text-foreground">{trainer.totalSessions}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sessions</span>
                            </div>
                        </div>

                        {/* Contact Info Footer (Pushed to bottom) */}
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

            {/* Pagination / Load More */}
            <div className="flex justify-center mt-8">
                <button className="px-6 py-2.5 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-background/50 hover:bg-primary/10 transition-colors text-sm font-medium">
                    Load More Trainers
                </button>
            </div>
        </div>
    );
}
