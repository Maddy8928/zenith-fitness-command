'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, 
    CalendarDays, 
    Clock, 
    Users, 
    Plus, 
    Filter, 
    Activity, 
    Flame, 
    Heart, 
    AlertCircle, 
    Edit, 
    Check, 
    Trash, 
    UserCheck, 
    ChevronRight, 
    FileText, 
    UserPlus, 
    PieChart, 
    History,
    X,
    ClipboardList,
    AlertTriangle
} from 'lucide-react';
import { getStoredClasses, saveStoredClasses, toggleParticipantAttendance, GymClass, ClassType, ClassStatus } from '@/lib/classes-data';
import { useNotifications } from '@/context/NotificationContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ClassesManagementPanel() {
    const { addNotification } = useNotifications();

    // Classes State
    const [classes, setClasses] = useState<GymClass[]>([]);
    
    // UI Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('All');
    const [filterStatus, setFilterStatus] = useState<string>('All');

    // Selected Class for Roster / Detail View
    const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);

    // Modal forms states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClass, setEditingClass] = useState<GymClass | null>(null);

    // Form fields
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<ClassType>('Yoga');
    const [formInstructor, setFormInstructor] = useState('');
    const [formDateTime, setFormDateTime] = useState('');
    const [formDuration, setFormDuration] = useState('60 mins');
    const [formCapacity, setFormCapacity] = useState(25);
    const [formRoom, setFormRoom] = useState('Studio A');
    const [formDescription, setFormDescription] = useState('');
    const [formStatus, setFormStatus] = useState<ClassStatus>('Upcoming');

    // Load classes
    useEffect(() => {
        setClasses(getStoredClasses());

        const handleStorageChange = () => {
            const updated = getStoredClasses();
            setClasses(updated);
            
            // Sync selected class state if open
            if (selectedClass) {
                const refreshedSelected = updated.find(c => c.id === selectedClass.id);
                if (refreshedSelected) setSelectedClass(refreshedSelected);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [selectedClass]);

    // Derived statistics
    const stats = useMemo(() => {
        const activeClasses = classes.filter(c => c.status !== 'Cancelled');
        const totalBookings = activeClasses.reduce((acc, c) => acc + c.participants.length, 0);
        const totalCapacity = activeClasses.reduce((acc, c) => acc + c.capacity, 0);
        
        const capacityUtilization = totalCapacity > 0 
            ? Math.round((totalBookings / totalCapacity) * 100) 
            : 0;

        const nearCapacity = activeClasses.filter(
            c => c.participants.length >= c.capacity * 0.8 && c.participants.length < c.capacity
        ).length;

        const fullClasses = activeClasses.filter(
            c => c.participants.length >= c.capacity
        ).length;

        return {
            totalClasses: classes.length,
            totalBookings,
            capacityUtilization,
            nearCapacity,
            fullClasses
        };
    }, [classes]);

    // Filtering logic
    const filteredClasses = useMemo(() => {
        return classes.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.room.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = filterType === 'All' || c.type === filterType;
            const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
            
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [classes, searchTerm, filterType, filterStatus]);

    // Handle Create Class
    const handleCreateClass = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formName || !formInstructor || !formDateTime || formCapacity <= 0) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const newClass: GymClass = {
            id: `class-${Date.now()}`,
            name: formName,
            type: formType,
            instructor: formInstructor,
            dateTime: new Date(formDateTime).toISOString(),
            duration: formDuration,
            capacity: Number(formCapacity),
            room: formRoom,
            description: formDescription,
            status: 'Upcoming',
            participants: []
        };

        const updated = [...classes, newClass];
        saveStoredClasses(updated);
        setClasses(updated);
        
        // Notify members
        const formattedDate = new Date(newClass.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        addNotification({
            role: 'member',
            category: 'WORKOUT',
            priority: 'high',
            title: `🆕 New Class Scheduled: ${newClass.name}`,
            message: `A new ${newClass.type} session is scheduled with Coach ${newClass.instructor} on ${formattedDate} in ${newClass.room}. Enroll now!`,
        });

        toast.success(`Class "${newClass.name}" scheduled successfully.`);
        resetForm();
        setShowCreateModal(false);
    };

    // Handle Edit Click
    const startEdit = (cls: GymClass) => {
        setEditingClass(cls);
        setFormName(cls.name);
        setFormType(cls.type);
        setFormInstructor(cls.instructor);
        // Format ISO string to datetime-local format: YYYY-MM-DDTHH:MM
        const localDate = new Date(cls.dateTime);
        const offset = localDate.getTimezoneOffset();
        const adjustedDate = new Date(localDate.getTime() - (offset * 60 * 1000));
        setFormDateTime(adjustedDate.toISOString().slice(0, 16));
        setFormDuration(cls.duration);
        setFormCapacity(cls.capacity);
        setFormRoom(cls.room);
        setFormDescription(cls.description);
        setFormStatus(cls.status);
        setShowEditModal(true);
    };

    // Handle Save Edit
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClass) return;

        if (!formName || !formInstructor || !formDateTime || formCapacity <= 0) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const updatedClass: GymClass = {
            ...editingClass,
            name: formName,
            type: formType,
            instructor: formInstructor,
            dateTime: new Date(formDateTime).toISOString(),
            duration: formDuration,
            capacity: Number(formCapacity),
            room: formRoom,
            description: formDescription,
            status: formStatus
        };

        const updated = classes.map(c => c.id === editingClass.id ? updatedClass : c);
        saveStoredClasses(updated);
        setClasses(updated);

        // Update selected class panel if it is active
        if (selectedClass?.id === editingClass.id) {
            setSelectedClass(updatedClass);
        }

        // Notify members of schedule updates
        const formattedDate = new Date(updatedClass.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        addNotification({
            role: 'member',
            category: 'WORKOUT',
            priority: 'medium',
            title: `🔄 Class Schedule Updated: ${updatedClass.name}`,
            message: `Details or status of the ${updatedClass.type} session on ${formattedDate} have been modified. Status is now: ${updatedClass.status}.`,
        });

        toast.success('Class details updated successfully.');
        resetForm();
        setEditingClass(null);
        setShowEditModal(false);
    };

    // Handle Delete/Cancel Class
    const handleCancelClass = (classId: string) => {
        const target = classes.find(c => c.id === classId);
        if (!target) return;

        const updated = classes.map(c => {
            if (c.id === classId) {
                return { ...c, status: 'Cancelled' as ClassStatus };
            }
            return c;
        });

        saveStoredClasses(updated);
        setClasses(updated);
        
        if (selectedClass?.id === classId) {
            setSelectedClass({ ...selectedClass, status: 'Cancelled' });
        }

        // Notify enrolled members
        addNotification({
            role: 'member',
            category: 'WORKOUT',
            priority: 'critical',
            title: `⚠️ Class CANCELLED: ${target.name}`,
            message: `The scheduled ${target.type} class with ${target.instructor} has been cancelled. Any reserved credits or slots have been refunded.`,
        });

        toast.warning(`Class "${target.name}" has been marked as Cancelled.`);
    };

    // Toggle Member Attendance
    const handleToggleAttendance = (classId: string, email: string) => {
        const updated = toggleParticipantAttendance(classId, email);
        setClasses(updated);
        
        // Sync selected class roster view
        const refreshedSelected = updated.find(c => c.id === classId);
        if (refreshedSelected) setSelectedClass(refreshedSelected);
        
        toast.success('Attendance updated.');
    };

    const resetForm = () => {
        setFormName('');
        setFormType('Yoga');
        setFormInstructor('');
        setFormDateTime('');
        setFormDuration('60 mins');
        setFormCapacity(25);
        setFormRoom('Studio A');
        setFormDescription('');
        setFormStatus('Upcoming');
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Yoga':
            case 'Pilates':
                return <Heart className="w-4 h-4 text-rose-400" />;
            case 'Zumba':
            case 'Dance Fitness':
                return <Flame className="w-4 h-4 text-orange-500" />;
            case 'Functional Training':
            case 'Aerobics':
                return <Activity className="w-4 h-4 text-blue-500" />;
            default:
                return <CalendarDays className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusBadgeStyle = (status: ClassStatus) => {
        switch (status) {
            case 'Upcoming': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'Ongoing': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'Completed': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
            case 'Cancelled': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Class Management Center</h1>
                    <p className="text-muted-foreground mt-1">Schedule fitness programs, check rosters, mark attendance, and alert members.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black font-bold uppercase tracking-wider text-xs shadow-glow hover:bg-primary/95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Schedule Class
                    </button>
                </div>
            </div>

            {/* Stats Ratios */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-3xl p-5 border-white/5 bg-slate-900/20">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Active Classes</span>
                        <CalendarDays className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-3xl font-black text-white italic">{stats.totalClasses}</p>
                </div>
                <div className="glass-card rounded-3xl p-5 border-white/5 bg-slate-900/20">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Bookings</span>
                        <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-black text-white italic">{stats.totalBookings}</p>
                </div>
                <div className="glass-card rounded-3xl p-5 border-white/5 bg-slate-900/20">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Seat Utilization</span>
                        <PieChart className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-3xl font-black text-white italic">{stats.capacityUtilization}%</p>
                </div>
                <div className="glass-card rounded-3xl p-5 border-white/5 bg-slate-900/20">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Near Capacity</span>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-3xl font-black text-amber-500 italic">{stats.nearCapacity}</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="glass-card rounded-3xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center border-white/5 bg-slate-900/20">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by class name, coach, or room..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                    />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
                    <span className="text-[10px] font-black uppercase text-slate-500 mr-2 tracking-wider">Class Type</span>
                    {['All', 'Yoga', 'Zumba', 'Pilates', 'Aerobics', 'Functional Training', 'Dance Fitness'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filterType === type ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Split Screen Layout: Classes List & Detail Roster view */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Classes grid/table */}
                <div className={`${selectedClass ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredClasses.map((cls) => {
                            const isFull = cls.participants.length >= cls.capacity;
                            const fillingFast = cls.participants.length >= cls.capacity * 0.8 && !isFull;
                            const isSelected = selectedClass?.id === cls.id;

                            return (
                                <div 
                                    key={cls.id} 
                                    className={`glass-card rounded-[2rem] p-6 relative overflow-hidden transition-all duration-300 border ${
                                        isSelected ? 'ring-2 ring-primary border-primary/50' : 
                                        isFull ? 'border-rose-500/20 hover:border-rose-500/40' : 
                                        fillingFast ? 'border-amber-500/20 hover:border-amber-500/40' : 
                                        'border-white/5 hover:border-primary/30'
                                    }`}
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />

                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                {getTypeIcon(cls.type)}
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{cls.type}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{cls.name}</h3>
                                            <p className="text-xs text-slate-400 mt-1">Coach: <span className="font-bold text-slate-300">{cls.instructor}</span></p>
                                        </div>
                                        <Badge className={`text-[9px] uppercase tracking-widest font-black ${getStatusBadgeStyle(cls.status)}`}>
                                            {cls.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2.5 bg-black/20 rounded-2xl p-4 border border-white/5 text-xs text-slate-300">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span>
                                                {new Date(cls.dateTime).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                                                {new Date(cls.dateTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <CalendarDays className="w-4 h-4 text-primary" />
                                                <span>Room: {cls.room} ({cls.duration})</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" /> Bookings
                                            </p>
                                            <p className="text-sm font-black text-slate-200 font-mono mt-0.5">
                                                <span className={isFull ? 'text-rose-400' : fillingFast ? 'text-amber-400' : 'text-primary'}>
                                                    {cls.participants.length}
                                                </span>
                                                <span className="text-slate-500"> / {cls.capacity}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => startEdit(cls)}
                                                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-450 hover:text-white transition-all"
                                                title="Edit Details"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setSelectedClass(cls)}
                                                className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                            >
                                                Roster <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Utilization progress bar */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-black/40">
                                        <div 
                                            className={`h-full transition-all duration-700 ${isFull ? 'bg-rose-500' : fillingFast ? 'bg-amber-500' : 'bg-primary'}`}
                                            style={{ width: `${Math.min(100, (cls.participants.length / cls.capacity) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredClasses.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-500 glass-card rounded-[2.5rem] border border-dashed border-white/5 bg-slate-900/10">
                            <AlertCircle className="w-16 h-16 mb-4 opacity-30 text-slate-500" />
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">No Classes Found</h3>
                            <p className="text-xs text-slate-500 mt-1">Change filters or create a new session.</p>
                        </div>
                    )}
                </div>

                {/* Right Side: Participant list & roster tracker */}
                {selectedClass && (
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/5 rounded-[2rem] overflow-hidden flex flex-col min-h-[500px]">
                            <CardHeader className="bg-black/20 border-b border-white/5 p-6 flex flex-row justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                        {getTypeIcon(selectedClass.type)}
                                        <span className="uppercase tracking-wider">{selectedClass.type} Roster</span>
                                    </div>
                                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight">{selectedClass.name}</CardTitle>
                                    <CardDescription className="text-xs">
                                        Coach: {selectedClass.instructor} • Room: {selectedClass.room}
                                    </CardDescription>
                                </div>
                                <button 
                                    onClick={() => setSelectedClass(null)}
                                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                
                            </CardHeader>
                            <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                                {/* Utilization Info */}
                                <div className="flex justify-between items-center p-4 rounded-2xl bg-black/30 border border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Seat Utilization</p>
                                        <p className="text-2xl font-black text-white italic">
                                            {selectedClass.participants.length} <span className="text-xs font-normal text-slate-400">/ {selectedClass.capacity} filled</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-primary italic">
                                            {Math.round((selectedClass.participants.length / selectedClass.capacity) * 100)}%
                                        </p>
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-wider">utilization rate</p>
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                                        <ClipboardList className="w-4 h-4 text-primary" /> Active Enrolled Members
                                    </h4>

                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                        {selectedClass.participants.length === 0 ? (
                                            <div className="py-12 text-center text-slate-500 bg-black/10 rounded-2xl border border-dashed border-white/5">
                                                <Users className="w-10 h-10 mb-2 opacity-20 mx-auto" />
                                                <p className="text-xs font-bold uppercase tracking-wider">Roster is empty</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">No members have enrolled yet.</p>
                                            </div>
                                        ) : (
                                            selectedClass.participants.map((p, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm">
                                                            {p.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-xs">{p.name}</p>
                                                            <p className="text-[10px] text-slate-400">{p.email}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] text-slate-500 hidden sm:inline-block font-mono">
                                                            {new Date(p.enrolledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                        
                                                        {/* Attendance Checkbox Button */}
                                                        <button
                                                            onClick={() => handleToggleAttendance(selectedClass.id, p.email)}
                                                            className={`h-7 px-3.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                                                                p.attended 
                                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                                            }`}
                                                        >
                                                            {p.attended ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5" /> Present
                                                                </>
                                                            ) : (
                                                                'Mark Present'
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Class Action Panel Footer */}
                                <div className="border-t border-white/5 pt-4 space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Active Operations</span>
                                        <span className="text-slate-450">Session ID: {selectedClass.id}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedClass.status !== 'Cancelled' ? (
                                            <button 
                                                onClick={() => handleCancelClass(selectedClass.id)}
                                                className="flex-1 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider transition-all"
                                            >
                                                Cancel Class
                                            </button>
                                        ) : (
                                            <div className="flex-1 py-3 text-center rounded-xl bg-slate-950 text-rose-500 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
                                                ✗ Class Cancelled
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <div className="p-6 border-b border-white/5 bg-black/20">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-primary" /> Schedule New Class
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Fill out the fields to publish a fitness session to members.</p>
                        </div>

                        <form onSubmit={handleCreateClass} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Class Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Vinyasa Power Flow"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Class Type</label>
                                    <select 
                                        value={formType}
                                        onChange={(e) => setFormType(e.target.value as ClassType)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="Yoga">Yoga</option>
                                        <option value="Zumba">Zumba</option>
                                        <option value="Pilates">Pilates</option>
                                        <option value="Aerobics">Aerobics</option>
                                        <option value="Functional Training">Functional Training</option>
                                        <option value="Dance Fitness">Dance Fitness</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Instructor Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Coach Sarah"
                                        value={formInstructor}
                                        onChange={(e) => setFormInstructor(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Room / Location</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Studio B"
                                        value={formRoom}
                                        onChange={(e) => setFormRoom(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        value={formDateTime}
                                        onChange={(e) => setFormDateTime(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Duration (mins)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 60 mins"
                                        value={formDuration}
                                        onChange={(e) => setFormDuration(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Max Capacity</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min={1}
                                        value={formCapacity}
                                        onChange={(e) => setFormCapacity(Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Class Description</label>
                                <textarea 
                                    rows={2}
                                    placeholder="Enter details about core techniques, difficulty level, and prerequisites..."
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button 
                                    type="button" 
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-350 text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider transition-colors shadow-glow"
                                >
                                    Publish Class
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => { setShowEditModal(false); setEditingClass(null); }}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-450 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <div className="p-6 border-b border-white/5 bg-black/20">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
                                <Edit className="w-5 h-5 text-primary" /> Modify Class Details
                            </h3>
                            <p className="text-xs text-slate-450 mt-1">Make edits to schedule, coach, rooms, or class status.</p>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Class Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Class Type</label>
                                    <select 
                                        value={formType}
                                        onChange={(e) => setFormType(e.target.value as ClassType)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="Yoga">Yoga</option>
                                        <option value="Zumba">Zumba</option>
                                        <option value="Pilates">Pilates</option>
                                        <option value="Aerobics">Aerobics</option>
                                        <option value="Functional Training">Functional Training</option>
                                        <option value="Dance Fitness">Dance Fitness</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Instructor Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formInstructor}
                                        onChange={(e) => setFormInstructor(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Room / Location</label>
                                    <input 
                                        type="text" 
                                        value={formRoom}
                                        onChange={(e) => setFormRoom(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        value={formDateTime}
                                        onChange={(e) => setFormDateTime(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Duration</label>
                                    <input 
                                        type="text" 
                                        value={formDuration}
                                        onChange={(e) => setFormDuration(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Max Capacity</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min={1}
                                        value={formCapacity}
                                        onChange={(e) => setFormCapacity(Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Class Status</label>
                                    <select 
                                        value={formStatus}
                                        onChange={(e) => setFormStatus(e.target.value as ClassStatus)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Class Description</label>
                                <textarea 
                                    rows={2}
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button 
                                    type="button" 
                                    onClick={() => { setShowEditModal(false); setEditingClass(null); }}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-350 text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider transition-colors shadow-glow"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
