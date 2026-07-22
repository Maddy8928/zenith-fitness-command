'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ChevronLeft,
    ChevronRight,
    CalendarCheck,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    MoreHorizontal,
    UserCircle,
    RotateCw
} from 'lucide-react';

export default function AttendancePanel() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, isLoading]);

    const [sessions, setSessions] = useState([
        { id: 1, clientName: 'Jessica Miller', time: '07:00 AM', duration: '60 min', type: 'Strength Training', status: 'Present', avatar: 'JM' },
        { id: 2, clientName: 'David Garcia', time: '09:30 AM', duration: '45 min', type: 'Cardio Core', status: 'Upcoming', avatar: 'DG' },
        { id: 3, clientName: 'Alex Thompson', time: '11:00 AM', duration: '60 min', type: 'HIIT Session', status: 'Upcoming', avatar: 'AT' },
        { id: 4, clientName: 'Sarah Johnson', time: '02:00 PM', duration: '30 min', type: 'Form Assessment', status: 'Upcoming', avatar: 'SJ' },
        { id: 5, clientName: 'Michael Chen', time: '04:30 PM', duration: '60 min', type: 'Powerlifting', status: 'Rescheduled', avatar: 'MC' },
        { id: 6, clientName: 'Lisa Anderson', time: '06:00 PM', duration: '45 min', type: 'Flexibility & Yoga', status: 'Absent', avatar: 'LA' },
    ]);

    const updateStatus = (id: number, newStatus: string) => {
        setSessions(sessions.map(s => s.id === id ? { ...s, status: newStatus } : s));
    };

    if (isLoading || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN')) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Attendance Data...</div>;
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const stats = {
        total: sessions.length,
        completed: sessions.filter(s => s.status === 'Present').length,
        upcoming: sessions.filter(s => s.status === 'Upcoming').length,
        missed: sessions.filter(s => s.status === 'Absent' || s.status === 'Rescheduled').length
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header & Navigation */}
                <div className="flex flex-col gap-4">
                    <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2" asChild>
                        <Link href="/trainer">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Dashboard
                        </Link>
                    </Button>

                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-orange-400 via-rose-500 to-pink-500 bg-clip-text text-transparent pb-1">
                                Session Attendance
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Track and manage your daily appointments and client show-ups.
                            </p>
                        </div>
                    </header>
                </div>

                {/* Date Navigator */}
                <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 flex items-center justify-between p-2 rounded-2xl">
                    <Button variant="ghost" onClick={handlePrevDay} className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl h-12 w-12 p-0">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>

                    <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">Schedule For</span>
                        <div className="flex items-center gap-3">
                            <CalendarCheck className="w-5 h-5 text-rose-400" />
                            <span className="text-xl md:text-2xl font-bold text-white tracking-tight">{formatDate(currentDate)}</span>
                        </div>
                    </div>

                    <Button variant="ghost" onClick={handleNextDay} className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl h-12 w-12 p-0">
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </Card>

                {/* KPI Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between group">
                        <div>
                            <p className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">Total Sessions</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 transition-colors">
                            <Clock className="w-5 h-5" />
                        </div>
                    </Card>
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between group">
                        <div>
                            <p className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">Completed</p>
                            <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </Card>
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between group">
                        <div>
                            <p className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">Upcoming</p>
                            <p className="text-3xl font-bold text-blue-400 mt-1">{stats.upcoming}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <UserCircle className="w-5 h-5" />
                        </div>
                    </Card>
                    <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 p-4 rounded-xl flex items-center justify-between group">
                        <div>
                            <p className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">Exceptions</p>
                            <p className="text-3xl font-bold text-rose-400 mt-1">{stats.missed}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 transition-colors">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </Card>
                </div>

                {/* Session List */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 border-t-4 border-t-rose-500/50">
                    <CardHeader className="border-b border-slate-800/50 pb-4">
                        <CardTitle className="text-xl text-white">Daily Roster</CardTitle>
                        <CardDescription>Click action buttons to update attendance status directly.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-800/50">
                            {sessions.map((session) => (
                                <div key={session.id} className={`p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-800/20 ${session.status === 'Present' ? 'bg-emerald-950/20' : session.status === 'Absent' ? 'bg-rose-950/20' : ''}`}>

                                    {/* Session Info */}
                                    <div className="flex items-center gap-4 md:w-1/3">
                                        <div className="flex-shrink-0 flex flex-col items-center justify-center h-16 w-20 rounded-xl bg-slate-950 border border-slate-800 text-center">
                                            <span className="text-lg font-bold text-white leading-none">{session.time.split(' ')[0]}</span>
                                            <span className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{session.time.split(' ')[1]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-lg font-semibold text-slate-100 truncate">{session.clientName}</h4>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-400 gap-3">
                                                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {session.duration}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                <span className="truncate">{session.type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="md:w-1/4 flex items-center md:justify-center">
                                        {session.status === 'Upcoming' && <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 text-sm font-medium rounded-lg">Upcoming</Badge>}
                                        {session.status === 'Present' && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-sm font-medium rounded-lg"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Attended</Badge>}
                                        {session.status === 'Absent' && <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-3 py-1 text-sm font-medium rounded-lg"><XCircle className="w-4 h-4 mr-1.5" /> No Show</Badge>}
                                        {session.status === 'Rescheduled' && <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1 text-sm font-medium rounded-lg"><RotateCw className="w-4 h-4 mr-1.5" /> Rescheduled</Badge>}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 md:w-auto md:justify-end">
                                        {session.status === 'Upcoming' ? (
                                            <>
                                                <Button size="sm" onClick={() => updateStatus(session.id, 'Present')} className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg">
                                                    Present
                                                </Button>
                                                <Button size="sm" onClick={() => updateStatus(session.id, 'Absent')} className="bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 rounded-lg">
                                                    Absent
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button size="sm" variant="outline" onClick={() => updateStatus(session.id, 'Upcoming')} className="bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg">
                                                Reset Status
                                            </Button>
                                        )}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
