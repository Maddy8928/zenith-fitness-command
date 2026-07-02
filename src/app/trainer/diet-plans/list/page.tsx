'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    ChevronLeft,
    Search,
    PlusCircle,
    MoreHorizontal,
    Edit,
    Trash2,
    UserPlus,
    Leaf,
    Flame,
    Beef,
    Fish,
    ArrowUpDown,
    LayoutGrid,
    List
} from 'lucide-react';

export default function DietPlansListPanel() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, isLoading]);

    if (isLoading || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN')) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Diet Data...</div>;
    }

    const dietPlans = [
        {
            id: 1,
            name: 'Shred & Tone (Keto)',
            goal: 'Fat Loss',
            rating: 4.8,
            duration: '12 Weeks',
            assigned: 15,
            calories: 1800,
            macros: { protein: 40, carbs: 10, fats: 50 },
            tags: ['Keto', 'High Fat', 'Low Carb'],
            icon: Flame
        },
        {
            id: 2,
            name: 'Muscle Builder Pro',
            goal: 'Hypertrophy',
            rating: 4.9,
            duration: '16 Weeks',
            assigned: 24,
            calories: 3200,
            macros: { protein: 35, carbs: 45, fats: 20 },
            tags: ['High Carb', 'Bulking', 'High Protein'],
            icon: Beef
        },
        {
            id: 3,
            name: 'Mediterranean Wellness',
            goal: 'Maintenance',
            rating: 4.7,
            duration: 'Ongoing',
            assigned: 8,
            calories: 2200,
            macros: { protein: 25, carbs: 45, fats: 30 },
            tags: ['Balanced', 'Heart Healthy', 'Pescatarian'],
            icon: Fish
        },
        {
            id: 4,
            name: 'Plant-Based Power',
            goal: 'Endurance',
            rating: 4.6,
            duration: '8 Weeks',
            assigned: 12,
            calories: 2600,
            macros: { protein: 20, carbs: 55, fats: 25 },
            tags: ['Vegan', 'High Carb', 'Plant Protein'],
            icon: Leaf
        },
        {
            id: 5,
            name: 'High Carb Performance',
            goal: 'Athletic Prep',
            rating: 4.5,
            duration: '4 Weeks',
            assigned: 5,
            calories: 3500,
            macros: { protein: 20, carbs: 60, fats: 20 },
            tags: ['Carb Loading', 'Athletes', 'Pre-Competition'],
            icon: Flame
        }
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
                                Diet Plans Directory
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Detailed tabular view of all your nutrition programs.
                            </p>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white rounded-lg h-10 w-10" asChild>
                                    <Link href="/trainer/diet-plans">
                                        <LayoutGrid className="w-4 h-4" />
                                    </Link>
                                </Button>
                                <Button variant="secondary" size="icon" className="bg-slate-800 text-white shadow-sm rounded-lg h-10 w-10 pointer-events-none">
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                            <Button className="flex-1 md:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-900/20 px-6 h-12 rounded-xl font-medium">
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Create Plan
                            </Button>
                        </div>
                    </header>
                </div>

                {/* Table Section */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/60 overflow-hidden">
                    <div className="p-4 border-b border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/30">
                        <div className="relative w-full sm:max-w-md border-0 bg-transparent">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Filter plans by name or goal..."
                                className="pl-9 h-10 bg-slate-900/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-950/50 hover:bg-slate-950/50">
                                    <TableRow className="border-slate-800/50 hover:bg-transparent">
                                        <TableHead className="w-[300px] text-slate-400 font-medium">Program Name</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Target Goal</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Duration</TableHead>
                                        <TableHead className="text-slate-400 font-medium text-center">Calories</TableHead>
                                        <TableHead className="text-slate-400 font-medium text-center">Macro Split (P/C/F)</TableHead>
                                        <TableHead className="text-slate-400 font-medium text-center">
                                            <div className="flex justify-center items-center cursor-pointer hover:text-slate-300">
                                                Assigned <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right text-slate-400 font-medium">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dietPlans.map((plan) => (
                                        <TableRow key={plan.id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                                                        <plan.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-200 font-semibold table-cell">{plan.name}</span>
                                                        <div className="text-xs text-slate-500 mt-1 flex gap-1 invisible group-hover:visible transition-all">
                                                            {plan.tags.slice(0, 2).map(tag => (
                                                                <span key={tag} className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700 font-normal">
                                                    {plan.goal}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                {plan.duration}
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-emerald-400 font-medium">
                                                {plan.calories} kcal
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 w-full max-w-[120px] mx-auto">
                                                    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-800">
                                                        <div className="bg-rose-500" style={{ width: `${plan.macros.protein}%` }} />
                                                        <div className="bg-blue-500" style={{ width: `${plan.macros.carbs}%` }} />
                                                        <div className="bg-amber-500" style={{ width: `${plan.macros.fats}%` }} />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                                        <span className="text-rose-400/80">{plan.macros.protein}%</span>
                                                        <span className="text-blue-400/80">{plan.macros.carbs}%</span>
                                                        <span className="text-amber-400/80">{plan.macros.fats}%</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20 px-2">
                                                    {plan.assigned} clients
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                        <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer">
                                                            <UserPlus className="mr-2 h-4 w-4" /> Allocate to Client
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" /> Edit Program
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                        <DropdownMenuItem className="text-rose-400 focus:text-rose-300 focus:bg-rose-500/10 cursor-pointer">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Archive Plan
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
