'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminProtected({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'ADMIN' && user?.role !== 'RECEPTIONIST') {
                if (user?.role === 'TRAINER') {
                    router.push('/trainer');
                } else {
                    router.push('/member');
                }
            } else {
                setIsChecking(false);
            }
        }
    }, [isAuthenticated, user, router, isLoading]);

    if (isLoading || isChecking || !isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'RECEPTIONIST')) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Authenticating Access...</p>
            </div>
        );
    }

    return <>{children}</>;
}
