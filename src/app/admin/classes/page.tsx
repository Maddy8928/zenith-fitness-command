"use client";

import { Calendar as CalendarIcon, Clock, Users, Plus, Filter, MoreHorizontal, MapPin } from "lucide-react";

const classesData = [
    { id: "C-101", name: "High-Intensity Interval Training", trainer: "Alex Johnson", time: "06:00 AM - 07:00 AM", date: "Today", capacity: 24, maxCapacity: 30, location: "Studio A", type: "HIIT", color: "from-orange-500/20 to-red-500/20", borderColor: "border-orange-500/30" },
    { id: "C-102", name: "Vinyasa Flow Yoga", trainer: "Sarah Williams", time: "08:00 AM - 09:15 AM", date: "Today", capacity: 15, maxCapacity: 20, location: "Zen Room", type: "Yoga", color: "from-emerald-500/20 to-teal-500/20", borderColor: "border-emerald-500/30" },
    { id: "C-103", name: "Strength & Conditioning", trainer: "Mike Tyson", time: "12:00 PM - 01:00 PM", date: "Today", capacity: 25, maxCapacity: 25, location: "Main Floor", type: "Strength", color: "from-blue-500/20 to-indigo-500/20", borderColor: "border-blue-500/30" },
    { id: "C-104", name: "Spin Class Elite", trainer: "Emma Davis", time: "05:30 PM - 06:15 PM", date: "Today", capacity: 38, maxCapacity: 40, location: "Cycle Studio", type: "Cardio", color: "from-purple-500/20 to-pink-500/20", borderColor: "border-purple-500/30" },
    { id: "C-105", name: "CrossFit WOD", trainer: "David Miller", time: "07:00 PM - 08:30 PM", date: "Today", capacity: 12, maxCapacity: 20, location: "The Box", type: "CrossFit", color: "from-yellow-500/20 to-orange-500/20", borderColor: "border-yellow-500/30" },
    { id: "C-106", name: "Core Crusher", trainer: "Jessica Taylor", time: "06:00 AM - 06:45 AM", date: "Tomorrow", capacity: 8, maxCapacity: 25, location: "Studio B", type: "Strength", color: "from-cyan-500/20 to-blue-500/20", borderColor: "border-cyan-500/30" },
];

export default function ClassesPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground dark:text-white">Classes & Schedule</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage class timetables, trainers, and capacities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors text-sm font-medium">
                        <Filter className="w-4 h-4 text-primary dark:text-gold-glow" />
                        Type
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-gold-glow dark:to-primary text-primary-foreground font-semibold text-sm shadow-glow hover:shadow-glow/80 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" />
                        Create Class
                    </button>
                </div>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center justify-between glass-card rounded-2xl p-4">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full no-scrollbar">
                    {["Yesterday", "Today", "Tomorrow", "Thu, Oct 26", "Fri, Oct 27", "Sat, Oct 28", "Sun, Oct 29"].map((day, idx) => (
                        <button
                            key={idx}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${day === "Today"
                                    ? "bg-primary text-primary-foreground shadow-glow"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary dark:text-gold-glow hover:bg-primary/10 rounded-xl ml-4 whitespace-nowrap">
                    <CalendarIcon className="w-4 h-4" />
                    Month View
                </button>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {classesData.map((cls) => {
                    const occupancyPercentage = (cls.capacity / cls.maxCapacity) * 100;
                    const isFull = cls.capacity >= cls.maxCapacity;

                    return (
                        <div key={cls.id} className={`glass-card rounded-3xl p-6 group transition-all duration-300 hover:scale-[1.02] border border-transparent hover:${cls.borderColor} relative overflow-hidden flex flex-col h-full bg-gradient-to-br ${cls.color}`}>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-background/50 border ${cls.borderColor}`}>
                                    {cls.type}
                                </span>
                                <button className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Class Info */}
                            <div className="space-y-1 mb-6 relative z-10">
                                <h3 className="text-xl font-heading font-bold text-foreground dark:text-white leading-tight">{cls.name}</h3>
                                <p className="text-sm font-medium text-muted-foreground">with <span className="text-foreground">{cls.trainer}</span></p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 relative z-10">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 text-primary dark:text-gold-glow" />
                                    <span>{cls.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 text-primary dark:text-gold-glow" />
                                    <span>{cls.location}</span>
                                </div>
                            </div>

                            {/* Capacity Footer (Pushed to bottom) */}
                            <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Users className="w-4 h-4" />
                                        <span>
                                            <span className={isFull ? "text-destructive" : "text-foreground"}>{cls.capacity}</span>
                                            <span className="text-muted-foreground"> / {cls.maxCapacity}</span>
                                        </span>
                                    </div>
                                    <span className={`text-xs font-bold ${isFull ? "text-destructive" : "text-green-500"}`}>
                                        {isFull ? "FULL" : `${cls.maxCapacity - cls.capacity} spots left`}
                                    </span>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-destructive' : 'bg-green-500'}`}
                                        style={{ width: `${occupancyPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State / Pagination placeholder if needed */}
            <div className="flex justify-center mt-8">
                <button className="px-6 py-2.5 rounded-xl border border-primary/20 bg-charcoal/50 dark:bg-background/50 hover:bg-primary/10 transition-colors text-sm font-medium">
                    Load More Classes
                </button>
            </div>
        </div>
    );
}
