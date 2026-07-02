'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/trainer/Sidebar';
import TopNav from '@/components/trainer/TopNav';
import BottomNav from '@/components/trainer/BottomNav';
import SidebarContent from '@/components/trainer/SidebarContent';
import TrainerProtected from '@/components/trainer/TrainerProtected';
import { NotificationProvider } from '@/context/NotificationContext';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export default function TrainerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isBottomMenuOpen, setIsBottomMenuOpen] = useState(false);

    return (
        <TrainerProtected>
            <NotificationProvider>
                <div className="flex h-screen overflow-hidden bg-black text-white">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <TopNav onMenuTrigger={() => setIsMobileMenuOpen(true)} />
                        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 scroll-smooth relative">
                            {/* Background Ambient Glow for Trainer Area */}
                            <div className="fixed inset-0 pointer-events-none z-0">
                                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle,_hsl(var(--accent)/0.03),_transparent_60%)] blur-3xl opacity-50 dark:opacity-100"></div>
                                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_hsl(var(--accent)/0.03),_transparent_60%)] blur-3xl opacity-50 dark:opacity-100"></div>
                            </div>
                            <div className="max-w-7xl mx-auto w-full relative z-10">
                                {children}
                            </div>
                        </main>
                        <BottomNav onMoreClick={() => setIsBottomMenuOpen(true)} />
                    </div>
                </div>

                {/* Left Sidebar Drawer (Top Nav Hamburger) */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 w-64 border-r border-slate-200 dark:border-primary/20">
                        <div className="sr-only">
                            <SheetTitle>Menu</SheetTitle>
                            <SheetDescription>Navigation links for the trainer portal</SheetDescription>
                        </div>
                        <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
                    </SheetContent>
                </Sheet>

                {/* Bottom Sheet Drawer (Bottom Nav More Button) */}
                <Sheet open={isBottomMenuOpen} onOpenChange={setIsBottomMenuOpen}>
                    <SheetContent side="bottom" className="p-0 rounded-t-[2rem] border-t border-slate-200 dark:border-primary/20 bg-background/95 backdrop-blur-xl max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="sr-only">
                            <SheetTitle>Explore Menu</SheetTitle>
                            <SheetDescription>Bottom sheet navigation links for the trainer portal</SheetDescription>
                        </div>
                        <SidebarContent variant="bottom-sheet" onItemClick={() => setIsBottomMenuOpen(false)} />
                    </SheetContent>
                </Sheet>
            </NotificationProvider>
        </TrainerProtected>
    );
}
