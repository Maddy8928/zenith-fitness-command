'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, Play, Coffee, Square, History, 
    TrendingUp, Calendar, Zap, UserCheck, 
    Timer, ChevronRight, Activity, Users,
    Dumbbell, CheckCircle2
} from 'lucide-react';
import { AttendanceStatus, ActivityLogEntry, UpcomingShift } from '@/hooks/useShiftControl';

interface ShiftControlPanelProps {
    status: AttendanceStatus;
    elapsedTime: string;
    sessionTime?: string;
    activityLog: ActivityLogEntry[];
    upcomingShifts?: UpcomingShift[];
    totalMinutesWorked?: number;
    performanceScore?: number;
    handleClockIn: () => void;
    handleClockOut: () => void;
    handleStartBreak: () => void;
    handleEndBreak: () => void;
    handleStartSession?: (client: string) => void;
    handleEndSession?: () => void;
    themeColor?: 'emerald' | 'purple' | 'amber' | 'indigo' | 'primary' | 'blue' | 'cyan';
    userName?: string;
    role?: string;
}

export const ShiftControlPanel: React.FC<ShiftControlPanelProps> = ({
    status,
    elapsedTime,
    sessionTime = '00:00:00',
    activityLog,
    upcomingShifts = [],
    totalMinutesWorked = 0,
    performanceScore = 100,
    handleClockIn,
    handleClockOut,
    handleStartBreak,
    handleEndBreak,
    handleStartSession,
    handleEndSession,
    themeColor = 'primary',
    userName = 'Staff',
    role = 'staff'
}) => {
    const isTrainer = role.toLowerCase().includes('trainer');

    const themeStyles = {
        emerald: {
            accent: 'emerald',
            glow: 'bg-emerald-500/10',
            iconText: 'text-emerald-400',
            btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
            border: 'border-emerald-500/20'
        },
        purple: {
            accent: 'purple',
            glow: 'bg-purple-500/10',
            iconText: 'text-purple-400',
            btn: 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]',
            border: 'border-purple-500/20'
        },
        amber: {
            accent: 'amber',
            glow: 'bg-amber-500/10',
            iconText: 'text-amber-400',
            btn: 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
            border: 'border-amber-500/20'
        },
        indigo: {
            accent: 'indigo',
            glow: 'bg-indigo-500/10',
            iconText: 'text-indigo-400',
            btn: 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]',
            border: 'border-indigo-500/20'
        },
        blue: {
            accent: 'blue',
            glow: 'bg-blue-500/10',
            iconText: 'text-blue-400',
            btn: 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] text-white',
            border: 'border-blue-500/20'
        },
        cyan: {
            accent: 'cyan',
            glow: 'bg-cyan-500/10',
            iconText: 'text-cyan-400',
            btn: 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-white',
            border: 'border-cyan-500/20'
        },
        primary: {
            accent: 'primary',
            glow: 'bg-primary/10',
            iconText: 'text-primary',
            btn: 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)]',
            border: 'border-primary/20'
        }
    };

    const style = themeStyles[themeColor] || themeStyles.primary;

    const formattedTotalHours = useMemo(() => {
        const h = Math.floor(totalMinutesWorked / 60);
        const m = totalMinutesWorked % 60;
        return `${h}h ${m}m`;
    }, [totalMinutesWorked]);

    return (
        <Card className={`bg-slate-900/40 backdrop-blur-3xl border-slate-800/60 overflow-hidden relative shadow-2xl ${style.border}`}>
            {/* Animated Background Glow */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none ${style.glow}`}
            />

            <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10 bg-black/40 ${style.iconText}`}>
                            <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-white uppercase tracking-tight italic">Shift <span className="text-slate-500 not-italic">Control</span></CardTitle>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{isTrainer ? 'Trainer Performance Hub' : 'Staff Operations Center'}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className={`bg-black/40 ${style.border} ${style.iconText} font-black px-3 py-1`}>
                        <Activity className="w-3 h-3 mr-1.5" /> LIVE
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
                {/* Main Status & Timer */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-6 rounded-3xl bg-black/40 border border-white/5 shadow-2xl flex flex-col items-center text-center">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4">
                            {status === 'ON_SESSION' ? 'Active Training Session' : 'Current Session'}
                        </p>
                        <motion.span 
                            key={status === 'ON_SESSION' ? sessionTime : elapsedTime}
                            initial={{ scale: 0.95, opacity: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-5xl font-mono font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        >
                            {status === 'ON_SESSION' ? sessionTime : elapsedTime}
                        </motion.span>
                        <div className="flex items-center gap-2 mt-4">
                            <div className={`w-2 h-2 rounded-full ${
                                status === 'WORKING' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 
                                status === 'ON_BREAK' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 
                                status === 'ON_SESSION' ? (themeColor === 'blue' || themeColor === 'cyan' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]') : 'bg-slate-700'
                            } animate-pulse`} />
                            <span className={`text-xs font-black uppercase tracking-widest ${
                                status === 'WORKING' ? 'text-emerald-400' : 
                                status === 'ON_BREAK' ? 'text-amber-400' : 
                                status === 'ON_SESSION' ? (themeColor === 'blue' || themeColor === 'cyan' ? 'text-cyan-400' : 'text-purple-400') : 'text-slate-500'
                            }`}>
                                {status === 'OFF_DUTY' ? 'Ready to Start' : 
                                 status === 'ON_SESSION' ? 'ON SESSION' : status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Control Actions */}
                <div className="grid grid-cols-1 gap-3">
                    <AnimatePresence mode="wait">
                        {status === 'OFF_DUTY' ? (
                            <motion.div
                                key="start"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Button 
                                    onClick={handleClockIn}
                                    className={`w-full py-7 rounded-2xl text-white font-black uppercase tracking-widest transition-all border-0 ${style.btn}`}
                                >
                                    <Play className="w-5 h-5 mr-2 fill-current" /> Initialize Shift
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="active"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-3"
                            >
                                {isTrainer && (
                                    <div className="mb-3">
                                        {status === 'ON_SESSION' ? (
                                            <Button 
                                                onClick={handleEndSession}
                                                className={`w-full py-7 rounded-2xl bg-gradient-to-r ${themeColor === 'blue' || themeColor === 'cyan' ? 'from-blue-600 to-cyan-600 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)]' : 'from-purple-600 to-indigo-600 shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:shadow-[0_0_35px_rgba(147,51,234,0.6)]'} text-white font-black text-xs uppercase tracking-[0.2em] border-0 transition-all active:scale-[0.98]`}
                                            >
                                                <Square className="w-4 h-4 mr-2 fill-current" /> End Training Session
                                            </Button>
                                        ) : status === 'WORKING' && (
                                            <Button 
                                                onClick={() => handleStartSession?.('Sarah Johnson')}
                                                className={`w-full py-7 rounded-2xl ${themeColor === 'blue' || themeColor === 'cyan' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/50' : 'bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/50'} font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]`}
                                            >
                                                <Dumbbell className="w-4 h-4 mr-2" /> Start PT Session
                                            </Button>
                                        )}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {(status === 'WORKING' || status === 'ON_SESSION') ? (
                                        <Button 
                                            onClick={handleStartBreak}
                                            className="py-7 rounded-2xl bg-slate-900/50 border border-white/5 text-slate-200 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/20 hover:text-white transition-all active:scale-[0.98]"
                                        >
                                            <Coffee className="w-4 h-4 mr-2" /> Take Break
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={handleEndBreak}
                                            className="py-7 rounded-2xl bg-amber-500 text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-400 hover:text-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] border-0 active:scale-[0.98]"
                                        >
                                            <Play className="w-4 h-4 mr-2 fill-current" /> Resume
                                        </Button>
                                    )}
                                    <Button 
                                        onClick={handleClockOut}
                                        className="py-7 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all active:scale-[0.98]"
                                    >
                                        <Square className="w-4 h-4 mr-2 fill-current" /> End Shift
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className={`w-3.5 h-3.5 ${isTrainer ? 'text-purple-400' : 'text-indigo-400'}`} />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isTrainer ? 'Session Goal' : 'Efficiency'}</span>
                        </div>
                        <p className="text-xl font-black text-white">{performanceScore}%</p>
                        <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${performanceScore}%` }}
                                className={`h-full bg-gradient-to-r ${themeColor === 'blue' || themeColor === 'cyan' ? 'from-blue-500 to-cyan-500' : (isTrainer ? 'from-purple-500 to-indigo-500' : 'from-indigo-500 to-purple-500')}`}
                            />
                        </div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <History className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Worked</span>
                        </div>
                        <p className="text-xl font-black text-white">{formattedTotalHours}</p>
                        <p className="text-[9px] text-slate-600 font-bold mt-1">{isTrainer ? 'Incl. 2 Sessions' : '+12% from avg'}</p>
                    </div>
                </div>

                {/* Visual Timeline */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-400" /> Session Timeline
                        </span>
                        <span className="text-[10px] text-slate-600 font-bold">TODAY</span>
                    </div>
                    <div className="relative h-12 flex items-center">
                        <div className="absolute inset-x-0 h-1 bg-slate-800 rounded-full" />
                        <div className="absolute inset-x-0 flex justify-between px-2">
                            {activityLog.length > 0 ? (
                                activityLog.slice().reverse().map((entry, i) => (
                                    <div key={entry.id} className="relative group">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`w-3 h-3 rounded-full border-2 border-slate-900 relative z-10 ${
                                                entry.type === 'CLOCK_IN' ? 'bg-emerald-500' :
                                                entry.type === 'BREAK_START' ? 'bg-amber-500' :
                                                entry.type === 'SESSION_START' ? (themeColor === 'blue' || themeColor === 'cyan' ? 'bg-cyan-500' : 'bg-purple-500') :
                                                entry.type === 'SESSION_END' ? (themeColor === 'blue' || themeColor === 'cyan' ? 'bg-blue-500' : 'bg-indigo-500') : 'bg-rose-500'
                                            }`}
                                        />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                            <div className="bg-black/90 text-white text-[9px] font-black px-2 py-1 rounded border border-white/10 uppercase">
                                                {entry.type.replace('_', ' ')} • {entry.timestamp}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full text-center text-[10px] text-slate-600 font-medium italic">Timeline will appear once you clock in.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upcoming Shifts / Client Sessions */}
                {upcomingShifts.length > 0 && (
                    <div className="space-y-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-purple-400" /> {isTrainer ? 'Scheduled PT Sessions' : 'Upcoming Schedule'}
                        </span>
                        <div className="space-y-2">
                            {upcomingShifts.map(shift => (
                                <div key={shift.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group/item">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover/item:bg-purple-500 group-hover/item:text-black transition-all">
                                            {isTrainer ? <Users className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase tracking-tight">{isTrainer ? 'Client Session' : shift.day}</p>
                                            <p className="text-[9px] text-slate-500 font-bold">{shift.time}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-slate-700" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trainer Specific: Recent Session History */}
                {isTrainer && (
                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <History className="w-3 h-3 text-emerald-400" /> Recent Sessions
                        </span>
                        <div className="space-y-3">
                            {[
                                { client: 'Michael Chen', duration: '45m', score: '98%', time: 'Yesterday' },
                                { client: 'Jessica Miller', duration: '60m', score: '92%', time: '2 days ago' }
                            ].map((session, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-sm" />
                                        <div>
                                            <p className="text-[10px] font-bold text-white">{session.client}</p>
                                            <p className="text-[8px] text-slate-500 font-medium">{session.duration} • {session.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-400">{session.score}</p>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase">Rating</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
