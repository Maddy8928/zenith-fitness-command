"use client";

import SidebarContent from './SidebarContent';

export default function MemberSidebar() {
    return (
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col bg-slate-50/50 dark:bg-background/40 backdrop-blur-md border-r border-slate-200 dark:border-primary/20 h-full">
            <SidebarContent />
        </aside>
    );
}
