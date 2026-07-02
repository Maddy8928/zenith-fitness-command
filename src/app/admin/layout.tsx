'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import TopNav from '@/components/admin/TopNav';
import BottomNav from '@/components/admin/BottomNav';
import SidebarContent from '@/components/admin/SidebarContent';
import AdminProtected from '@/components/admin/AdminProtected';
import { NotificationProvider } from '@/context/NotificationContext';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isBottomMenuOpen, setIsBottomMenuOpen] = useState(false);

    return (
        <AdminProtected>
            <NotificationProvider>
                <div className="flex h-screen overflow-hidden bg-background">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <TopNav onMenuTrigger={() => setIsMobileMenuOpen(true)} />
                        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 scroll-smooth">
                            <div className="max-w-7xl mx-auto w-full">
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
                            <SheetDescription>Navigation links for the admin portal</SheetDescription>
                        </div>
                        <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
                    </SheetContent>
                </Sheet>

                {/* Bottom Sheet Drawer (Bottom Nav More Button) */}
                <Sheet open={isBottomMenuOpen} onOpenChange={setIsBottomMenuOpen}>
                    <SheetContent side="bottom" className="p-0 rounded-t-[2rem] border-t border-slate-200 dark:border-primary/20 bg-background/95 backdrop-blur-xl max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="sr-only">
                            <SheetTitle>Explore Menu</SheetTitle>
                            <SheetDescription>Bottom sheet navigation links for the admin portal</SheetDescription>
                        </div>
                        <SidebarContent variant="bottom-sheet" onItemClick={() => setIsBottomMenuOpen(false)} />
                    </SheetContent>
                </Sheet>
            </NotificationProvider>
        </AdminProtected>
    );
}
