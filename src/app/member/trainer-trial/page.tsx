"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Loader2 } from "lucide-react";

export default function TrainerTrialPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/member/plans");
    }, [router]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-lg">
                <Dumbbell className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-foreground dark:text-white uppercase tracking-wider mb-2">
                Redirecting to My Workouts
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
                The Personal Training onboarding and Trainer Trial flow is now integrated into My Workouts.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Taking you there now...
            </div>
        </div>
    );
}
