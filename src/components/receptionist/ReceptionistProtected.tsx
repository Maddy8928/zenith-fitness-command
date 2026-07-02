'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ReceptionistProtected({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'RECEPTIONIST' && user?.role !== 'ADMIN') {
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

    if (isLoading || isChecking || !isAuthenticated || (user?.role !== 'RECEPTIONIST' && user?.role !== 'ADMIN')) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="font-body">Authenticating Receptionist Access...</p>
            </div>
        );
    }

    return <>{children}</>;
}
