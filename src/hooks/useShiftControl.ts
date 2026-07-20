'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';

export type AttendanceStatus = 'OFF_DUTY' | 'WORKING' | 'ON_BREAK' | 'ON_SESSION';

export interface ActivityLogEntry {
    id: string;
    type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END' | 'SESSION_START' | 'SESSION_END' | string;
    timestamp: string;
    description?: string;
    rawTime: number;
}

export interface UpcomingShift {
    id: string;
    day: string;
    time: string;
    role: string;
}

export function useShiftControl(roleKey: string) {
    const [status, setStatus] = useState<AttendanceStatus>('OFF_DUTY');
    const [shiftStartTime, setShiftStartTime] = useState<number | null>(null);
    const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
    const [sessionTime, setSessionTime] = useState<string>('00:00:00');
    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
    const [totalMinutesWorked, setTotalMinutesWorked] = useState(0);
    const [totalBreakMinutes, setTotalBreakMinutes] = useState(0);
    const [totalSessionMinutes, setTotalSessionMinutes] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    // Mock upcoming shifts based on role
    const upcomingShifts = useMemo<UpcomingShift[]>(() => [
        { id: '1', day: 'Tomorrow', time: '09:00 AM - 05:00 PM', role: roleKey.charAt(0).toUpperCase() + roleKey.slice(1) },
        { id: '2', day: 'Wednesday', time: '10:00 AM - 06:00 PM', role: roleKey.charAt(0).toUpperCase() + roleKey.slice(1) },
    ], [roleKey]);

    // Storage keys based on role
    const keys = useMemo(() => ({
        status: `flex_${roleKey}_status`,
        shiftStart: `flex_${roleKey}_shift_start`,
        breakStart: `flex_${roleKey}_break_start`,
        sessionStart: `flex_${roleKey}_session_start`,
        log: `flex_${roleKey}_activity_log`,
        mins: `flex_${roleKey}_mins_worked`,
        breaks: `flex_${roleKey}_mins_break`,
        sessions: `flex_${roleKey}_mins_session`
    }), [roleKey]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedStatus = localStorage.getItem(keys.status) as AttendanceStatus;
        const savedShiftStart = localStorage.getItem(keys.shiftStart);
        const savedBreakStart = localStorage.getItem(keys.breakStart);
        const savedSessionStart = localStorage.getItem(keys.sessionStart);
        const savedLog = localStorage.getItem(keys.log);
        const savedMins = localStorage.getItem(keys.mins);
        const savedBreaks = localStorage.getItem(keys.breaks);
        const savedSessions = localStorage.getItem(keys.sessions);

        if (savedStatus) setStatus(savedStatus);
        if (savedShiftStart) setShiftStartTime(parseInt(savedShiftStart));
        if (savedBreakStart) setBreakStartTime(parseInt(savedBreakStart));
        if (savedSessionStart) setSessionStartTime(parseInt(savedSessionStart));
        if (savedLog) setActivityLog(JSON.parse(savedLog));
        if (savedMins) setTotalMinutesWorked(parseInt(savedMins));
        if (savedBreaks) setTotalBreakMinutes(parseInt(savedBreaks));
        if (savedSessions) setTotalSessionMinutes(parseInt(savedSessions));
        
        setIsInitialized(true);
    }, [keys]);

    // Persist to localStorage
    useEffect(() => {
        if (!isInitialized) return;

        localStorage.setItem(keys.status, status);
        if (shiftStartTime) localStorage.setItem(keys.shiftStart, shiftStartTime.toString());
        else localStorage.removeItem(keys.shiftStart);
        
        if (breakStartTime) localStorage.setItem(keys.breakStart, breakStartTime.toString());
        else localStorage.removeItem(keys.breakStart);

        if (sessionStartTime) localStorage.setItem(keys.sessionStart, sessionStartTime.toString());
        else localStorage.removeItem(keys.sessionStart);

        localStorage.setItem(keys.log, JSON.stringify(activityLog));
        localStorage.setItem(keys.mins, totalMinutesWorked.toString());
        localStorage.setItem(keys.breaks, totalBreakMinutes.toString());
        localStorage.setItem(keys.sessions, totalSessionMinutes.toString());
    }, [status, shiftStartTime, breakStartTime, sessionStartTime, activityLog, totalMinutesWorked, totalBreakMinutes, totalSessionMinutes, isInitialized, keys]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const updateTimer = () => {
            const now = Date.now();
            
            // Main Shift Timer
            if (status !== 'OFF_DUTY' && shiftStartTime) {
                const diff = now - shiftStartTime;
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setElapsedTime('00:00:00');
            }

            // Session Timer
            if (status === 'ON_SESSION' && sessionStartTime) {
                const diff = now - sessionStartTime;
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setSessionTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setSessionTime('00:00:00');
            }
        };

        updateTimer();
        interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [status, shiftStartTime, sessionStartTime]);

    const addLogEntry = useCallback((type: ActivityLogEntry['type'], description?: string) => {
        const now = new Date();
        const entry: ActivityLogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawTime: Date.now(),
            description
        };
        setActivityLog(prev => [entry, ...prev].slice(0, 15));
    }, []);

    const handleClockIn = useCallback(() => {
        setShiftStartTime(Date.now());
        setStatus('WORKING');
        addLogEntry('CLOCK_IN');
    }, [addLogEntry]);

    const handleClockOut = useCallback(() => {
        if (shiftStartTime) {
            const workedMins = Math.floor((Date.now() - shiftStartTime) / 60000);
            setTotalMinutesWorked(prev => prev + workedMins);
        }
        addLogEntry('CLOCK_OUT');
        setStatus('OFF_DUTY');
        setShiftStartTime(null);
        setBreakStartTime(null);
        setSessionStartTime(null);
    }, [addLogEntry, shiftStartTime]);

    const handleStartBreak = useCallback(() => {
        setBreakStartTime(Date.now());
        setStatus('ON_BREAK');
        addLogEntry('BREAK_START');
    }, [addLogEntry]);

    const handleEndBreak = useCallback(() => {
        if (breakStartTime) {
            const breakMins = Math.floor((Date.now() - breakStartTime) / 60000);
            setTotalBreakMinutes(prev => prev + breakMins);
        }
        addLogEntry('BREAK_END');
        setStatus('WORKING');
        setBreakStartTime(null);
    }, [addLogEntry, breakStartTime]);

    const handleStartSession = useCallback((clientName: string) => {
        setSessionStartTime(Date.now());
        setStatus('ON_SESSION');
        addLogEntry('SESSION_START', `Session with ${clientName}`);
    }, [addLogEntry]);

    const handleEndSession = useCallback(() => {
        if (sessionStartTime) {
            const sessionMins = Math.floor((Date.now() - sessionStartTime) / 60000);
            setTotalSessionMinutes(prev => prev + sessionMins);
        }
        addLogEntry('SESSION_END');
        setStatus('WORKING');
        setSessionStartTime(null);
    }, [addLogEntry, sessionStartTime]);

    const performanceScore = useMemo(() => {
        if (totalMinutesWorked === 0) return 100;
        const activeMinutes = totalMinutesWorked - totalBreakMinutes;
        // Trainers are high performance if they spend more time on sessions
        const efficiency = (totalSessionMinutes / Math.max(1, activeMinutes)) * 100;
        return Math.min(100, Math.round(70 + (efficiency * 0.3))); // Weighted score
    }, [totalMinutesWorked, totalBreakMinutes, totalSessionMinutes]);

    return {
        status,
        elapsedTime,
        sessionTime,
        activityLog,
        upcomingShifts,
        totalMinutesWorked,
        totalBreakMinutes,
        totalSessionMinutes,
        performanceScore,
        handleClockIn,
        handleClockOut,
        handleStartBreak,
        handleEndBreak,
        handleStartSession,
        handleEndSession,
        addLogEntry,
        isInitialized
    };
}
