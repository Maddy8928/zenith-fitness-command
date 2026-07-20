
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import QueryProvider from "@/components/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { FeedbackProvider } from "@/context/FeedbackContext";
import { OrderProvider } from "@/context/OrderContext";
import { PlanProvider } from "@/context/PlanContext";
import { NotificationProvider } from "@/context/NotificationContext";
import LoadingScreen from "@/components/LoadingScreen";

export const metadata: Metadata = {
    title: "Flex Gym Command",
    description: "Next Generation Fitness Platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased">
                {/* Global Luxury Loading Animation */}
                <LoadingScreen />

                <ThemeProvider defaultTheme="dark" storageKey="zenith-theme">
                    <AuthProvider>
                        <NotificationProvider>
                            <PlanProvider>
                                <OrderProvider>
                                    <FeedbackProvider>
                                        <TooltipProvider>
                                            <QueryProvider>
                                                {children}
                                                <Toaster />
                                                <Sonner />
                                            </QueryProvider>
                                        </TooltipProvider>
                                    </FeedbackProvider>
                                </OrderProvider>
                            </PlanProvider>
                        </NotificationProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
