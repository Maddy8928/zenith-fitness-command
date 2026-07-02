'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlan, DietPlan } from '@/context/PlanContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Search,
    Filter,
    PlusCircle,
    ChevronLeft,
    Utensils,
    Flame,
    MoreVertical,
    Clock,
    Star,
    LayoutGrid,
    List
} from 'lucide-react';

export default function DietPlansPanel() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { assignDietPlan } = usePlan();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, isLoading]);

    if (isLoading || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN')) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Diet Plans...</div>;
    }

    const handleAssign = (plan: any) => {
        // Map trainer plan format to member plan format
        const formattedPlan: DietPlan = {
            name: plan.title,
            goal: plan.target,
            dailyCalories: plan.calories,
            macros: {
                protein: { target: plan.macros.p, current: Math.floor(plan.macros.p * 0.7), label: 'Protein (g)', color: 'bg-emerald-500' },
                carbs: { target: plan.macros.c, current: Math.floor(plan.macros.c * 0.7), label: 'Carbs (g)', color: 'bg-indigo-500' },
                fats: { target: plan.macros.f, current: Math.floor(plan.macros.f * 0.7), label: 'Fats (g)', color: 'bg-rose-500' }
            },
            meals: [
                { id: '1', type: 'Breakfast', time: '08:00 AM', name: 'Standard Morning Fuel', foods: ['High protein oats', '3 Egg whites'], calories: Math.floor(plan.calories * 0.2) },
                { id: '2', type: 'Lunch', time: '01:00 PM', name: 'Balanced Meal Box', foods: ['Grilled protein', 'Complex carbs', 'Steamed veg'], calories: Math.floor(plan.calories * 0.35) },
                { id: '3', type: 'Pre-Workout', time: '04:30 PM', name: 'Energy Boost', foods: ['Fruit', 'Shake'], calories: Math.floor(plan.calories * 0.15) },
                { id: '4', type: 'Dinner', time: '08:00 PM', name: 'Recovery Meal', foods: ['Lean protein', 'Fiber rich veggies'], calories: Math.floor(plan.calories * 0.3) }
            ]
        };

        assignDietPlan(formattedPlan);
        toast.success(`Successfully assigned "${plan.title}" to client dashboard`, {
            description: "Member's nutritional dashboard has been updated.",
            className: "bg-slate-900 border-emerald-500/50 text-white",
        });
    };

    const dietPlans = [
        {
            id: 1,
            title: 'Shred & Tone (Keto)',
            target: 'Weight Loss',
            calories: 1800,
            macros: { p: 150, c: 30, f: 120 },
            assignedCount: 8,
            tags: ['Keto', 'Low Carb', 'High Fat'],
            rating: 4.8,
            duration: '4 Weeks'
        },
        {
            id: 2,
            title: 'Muscle Builder Pro',
            target: 'Hypertrophy',
            calories: 3200,
            macros: { p: 200, c: 400, f: 90 },
            assignedCount: 15,
            tags: ['High Carb', 'High Protein'],
            rating: 4.9,
            duration: '12 Weeks'
        },
        {
            id: 3,
            title: 'Plant-Based Power',
            target: 'Maintenance',
            calories: 2400,
            macros: { p: 130, c: 300, f: 75 },
            assignedCount: 5,
            tags: ['Vegan', 'Balanced'],
            rating: 4.7,
            duration: '8 Weeks'
        },
        {
            id: 4,
            title: 'Lean Bulk Fundamentals',
            target: 'Muscle Gain',
            calories: 2800,
            macros: { p: 180, c: 350, f: 80 },
            assignedCount: 12,
            tags: ['Balanced', 'High Protein'],
            rating: 4.6,
            duration: '10 Weeks'
        }
    ];

    const recentActivity = [
        { id: 1, client: 'Alex Thompson', action: 'completed Day 4 of', plan: 'Shred & Tone', time: '2h ago', avatar: 'AT' },
        { id: 2, client: 'Sarah Johnson', action: 'started the', plan: 'Plant-Based Power', time: '5h ago', avatar: 'SJ' },
        { id: 3, client: 'Michael Chen', action: 'logged meals for', plan: 'Muscle Builder Pro', time: '1d ago', avatar: 'MC' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header & Navigation */}
                <div className="flex flex-col gap-4">
                    <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2" asChild>
                        <Link href="/trainer">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Dashboard
                        </Link>
                    </Button>

                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent pb-1">
                                Diet Plans Manager
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Manage and assign nutritional programs for your clients.
                            </p>
                        </div>

                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-900/20 px-6 h-12 rounded-xl text-lg font-medium">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Create Plan
                        </Button>
                    </header>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Search, Filters, & View Toggle */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <Input
                                        placeholder="Search diet plans by name, tags, or target..."
                                        className="pl-10 h-12 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" className="h-12 px-6 bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl">
                                    <Filter className="w-5 h-5 mr-2" />
                                    Filters
                                </Button>
                            </div>

                            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 h-12 items-center">
                                <Button variant="secondary" size="icon" className="bg-slate-800 text-white shadow-sm rounded-lg h-10 w-10 pointer-events-none">
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white rounded-lg h-10 w-10" asChild>
                                    <Link href="/trainer/diet-plans/list">
                                        <List className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Diet Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                            {dietPlans.map((plan) => (
                                <Card key={plan.id} className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 hover:border-emerald-500/30 transition-all duration-300 group flex flex-col h-full overflow-hidden">
                                    <CardHeader className="pb-4 relative">
                                        <div className="absolute top-0 right-0 p-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">
                                                {plan.target}
                                            </Badge>
                                            <div className="flex items-center text-amber-400 text-xs font-medium bg-slate-800/50 px-2 py-0.5 rounded-full">
                                                <Star className="w-3 h-3 mr-1 fill-amber-400" />
                                                {plan.rating}
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                            {plan.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-3 text-slate-400 mt-2">
                                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-slate-500" /> {plan.duration}</span>
                                            <span className="flex items-center"><Utensils className="w-4 h-4 mr-1 text-slate-500" /> {plan.assignedCount} Active</span>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-grow pb-2">
                                        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400 text-sm font-medium flex items-center">
                                                    <Flame className="w-4 h-4 mr-1.5 text-rose-500" />
                                                    Daily Target
                                                </span>
                                                <span className="font-bold text-white">{plan.calories} <span className="text-slate-500 font-normal text-sm">kcal</span></span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                                                <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                    <span className="text-emerald-400 font-bold">{plan.macros.p}g</span>
                                                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Protein</span>
                                                </div>
                                                <div className="flex flex-col items-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                                    <span className="text-blue-400 font-bold">{plan.macros.c}g</span>
                                                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Carbs</span>
                                                </div>
                                                <div className="flex flex-col items-center p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                                    <span className="text-amber-400 font-bold">{plan.macros.f}g</span>
                                                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Fats</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {plan.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="bg-slate-800/80 text-slate-300 font-normal hover:bg-slate-700">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-4 border-t border-slate-800/50 flex flex-col gap-3">
                                        <Button 
                                            onClick={() => handleAssign(plan)}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold uppercase tracking-wider h-10 rounded-xl"
                                        >
                                            Assign to Member
                                        </Button>
                                        <Button variant="ghost" className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all font-medium rounded-xl h-10">
                                            View Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">

                        {/* Quick Actions */}
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                            <CardHeader>
                                <CardTitle className="text-lg text-white">Meal Library</CardTitle>
                                <CardDescription>Manage individual recipes</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start h-12 bg-slate-950/50 border-slate-800 text-slate-300 hover:text-white group">
                                    <Utensils className="w-5 h-5 mr-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                    Browse Recipes
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-12 bg-slate-950/50 border-slate-800 text-slate-300 hover:text-white group">
                                    <PlusCircle className="w-5 h-5 mr-3 text-slate-500 group-hover:text-teal-400 transition-colors" />
                                    Add Custom Food
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60">
                            <CardHeader>
                                <CardTitle className="text-lg text-white">Client Activity</CardTitle>
                                <CardDescription>Diet-related updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex gap-3 relative">
                                            {/* Decorative timeline line */}
                                            <div className="absolute left-4 top-10 bottom-[-16px] w-px bg-slate-800 last-of-type:hidden"></div>

                                            <Avatar className="h-8 w-8 border border-slate-700 relative z-10 bg-slate-950">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${activity.client}&backgroundColor=0f172a&textColor=cbd5e1`} />
                                                <AvatarFallback className="bg-slate-800 text-xs">{activity.avatar}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm leading-snug">
                                                    <span className="font-medium text-slate-200">{activity.client}</span>{' '}
                                                    <span className="text-slate-400">{activity.action}</span>{' '}
                                                    <span className="font-medium text-emerald-400">{activity.plan}</span>
                                                </p>
                                                <p className="text-xs text-slate-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
