'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function TrainerProtected({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'TRAINER' && user?.role !== 'ADMIN') {
                if (user?.role === 'MEMBER') {
                    router.push('/member');
                } else if (user?.role === 'RECEPTIONIST') {
                    router.push('/receptionist');
                } else {
                    router.push('/admin');
                }
            } else {
                setIsChecking(false);
            }
        }
    }, [isAuthenticated, user, router, isLoading]);

    if (isLoading || isChecking || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN')) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Authenticating Access...</p>
            </div>
        );
    }

    return <>{children}</>;
}
