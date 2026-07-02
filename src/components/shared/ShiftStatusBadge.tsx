'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AttendanceStatus } from '@/hooks/useShiftControl';
import { Activity } from 'lucide-react';

interface ShiftStatusBadgeProps {
    status: AttendanceStatus;
    elapsedTime: string;
    themeColor?: 'emerald' | 'purple' | 'amber' | 'indigo' | 'primary' | 'blue' | 'cyan';
}

export const ShiftStatusBadge: React.FC<ShiftStatusBadgeProps> = ({ 
    status, 
    elapsedTime, 
    themeColor = 'primary' 
}) => {
    if (status === 'OFF_DUTY') return null;

    const colorClasses = {
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.1)]',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.1)]',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]',
        primary: 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]'
    };

    const dotColors = {
        emerald: 'bg-emerald-500',
        purple: 'bg-purple-500',
        amber: 'bg-amber-500',
        indigo: 'bg-indigo-500',
        blue: 'bg-blue-500',
        cyan: 'bg-cyan-500',
        primary: 'bg-primary'
    };

    const statusMap = {
        'WORKING': { 
            label: 'Active', 
            color: colorClasses[themeColor] || colorClasses.primary,
            dot: dotColors[themeColor] || dotColors.primary
        },
        'ON_BREAK': { 
            label: 'On Break', 
            color: 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
            dot: 'bg-amber-500'
        },
        'ON_SESSION': { 
            label: 'On Session', 
            color: themeColor === 'blue' || themeColor === 'cyan' ? (themeColor === 'blue' ? colorClasses.blue : colorClasses.cyan) : 'bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.1)]',
            dot: themeColor === 'blue' || themeColor === 'cyan' ? (themeColor === 'blue' ? 'bg-blue-500' : 'bg-cyan-500') : 'bg-purple-500'
        },
        'OFF_DUTY': { 
            label: 'Off Duty', 
            color: 'bg-slate-500/10 border-slate-500/20 text-slate-500',
            dot: 'bg-slate-500'
        }
    };

    const current = statusMap[status];

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 border px-4 py-2 rounded-2xl backdrop-blur-md ${current.color}`}
        >
            <div className="relative flex items-center justify-center">
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-3 h-3 rounded-full absolute ${current.dot}`}
                />
                <div className={`w-2 h-2 rounded-full relative z-10 ${current.dot} shadow-[0_0_8px_currentColor]`} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">{current.label}</span>
                <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 opacity-50" />
                    <span className="text-sm font-mono font-black tracking-tight tabular-nums">{elapsedTime}</span>
                </div>
            </div>
        </motion.div>
    );
};
