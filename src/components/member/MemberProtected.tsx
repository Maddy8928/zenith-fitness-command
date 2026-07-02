'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function MemberProtected({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'MEMBER' && user?.role !== 'ADMIN') {
                if (user?.role === 'TRAINER') {
                    router.push('/trainer');
                } else {
                    router.push('/login'); // Fallback
                }
            } else {
                setIsChecking(false);
            }
        }
    }, [isAuthenticated, user, router, isLoading]);

    if (isLoading || isChecking || !isAuthenticated || (user?.role !== 'MEMBER' && user?.role !== 'ADMIN')) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Authenticating Member Access...</p>
            </div>
        );
    }

    return <>{children}</>;
}
