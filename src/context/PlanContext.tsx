'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Types ---

export interface Exercise {
    id: string;
    name: string;
    target: string;
    sets: number | string;
    reps: string;
    rest: string;
    notes?: string;
}

export interface DayPlan {
    day: string;
    isRestDay: boolean;
    focus: string;
    exercises: Exercise[];
}

export interface WorkoutPlan {
    name: string;
    focus: string;
    duration: string;
    intensity: string;
    schedule: DayPlan[];
    // Keeping for backwards compatibility
    exercises?: Exercise[];
}

export interface MealFood {
    name: string;
    quantity: string;
}

export interface Meal {
    id: string;
    type: string;
    time: string;
    name: string;
    foods: string[] | MealFood[];
    notes?: string;
    calories?: number;
}

export interface DietPlan {
    name: string;
    goal: string;
    dailyCalories: number;
    macros: {
        protein: { target: number; current: number; label: string; color: string };
        carbs: { target: number; current: number; label: string; color: string };
        fats: { target: number; current: number; label: string; color: string };
    };
    meals: Meal[];
}

interface PlanContextType {
    workoutPlan: WorkoutPlan | null;
    dietPlan: DietPlan | null;
    assignWorkoutPlan: (plan: WorkoutPlan) => void;
    assignDietPlan: (plan: DietPlan) => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

// --- Default Data (Fallback) ---

const DEFAULT_WORKOUT: WorkoutPlan = {
    name: "HIIT Fundamentals",
    focus: "Explosive Power & Stamina",
    duration: "4 Weeks",
    intensity: "High",
    schedule: [
        { day: 'Monday', isRestDay: false, focus: 'Push & Cardio', exercises: [
            { id: '1', name: 'Barbell Bench Press', target: 'Chest', sets: 4, reps: '8-10', rest: '90s', notes: 'Focus on eccentric' },
            { id: '2', name: 'Incline Dumbbell Press', target: 'Chest', sets: 3, reps: '10-12', rest: '60s' }
        ]},
        { day: 'Tuesday', isRestDay: false, focus: 'Pull & Core', exercises: [
            { id: '3', name: 'Lat Pulldown (Wide Grip)', target: 'Lats', sets: 4, reps: '10-12', rest: '60s' },
            { id: '4', name: 'Seated Cable Rows', target: 'Mid Back', sets: 3, reps: '12-15', rest: '60s' }
        ]},
        { day: 'Wednesday', isRestDay: true, focus: '', exercises: [] },
        { day: 'Thursday', isRestDay: false, focus: 'Legs', exercises: [
            { id: '5', name: 'Barbell Squats', target: 'Legs', sets: 4, reps: '8', rest: '120s' }
        ]},
        { day: 'Friday', isRestDay: false, focus: 'Full Body HIIT', exercises: [
            { id: '6', name: 'Kettlebell Swings', target: 'Full Body', sets: 4, reps: '20', rest: '45s' }
        ]},
        { day: 'Saturday', isRestDay: true, focus: '', exercises: [] },
        { day: 'Sunday', isRestDay: true, focus: '', exercises: [] },
    ],
    exercises: [] // Fallback
};

const DEFAULT_DIET: DietPlan = {
    name: "Shred & Tone (Keto)",
    goal: "Aggressive Fat Loss",
    dailyCalories: 2200,
    macros: {
        protein: { target: 180, current: 120, label: 'Protein (g)', color: 'bg-emerald-500' },
        carbs: { target: 200, current: 150, label: 'Carbs (g)', color: 'bg-indigo-500' },
        fats: { target: 75, current: 40, label: 'Fats (g)', color: 'bg-rose-500' }
    },
    meals: [
        { id: '1', type: 'Breakfast', time: '08:00 AM', name: 'Oats & Egg Whites', foods: [{name: 'Oatmeal', quantity: '1 cup'}, {name: 'Egg Whites', quantity: '4'}, {name: 'Whole Egg', quantity: '1'}, {name: 'Blueberries', quantity: '1/2 cup'}], calories: 350 },
        { id: '2', type: 'Lunch', time: '01:00 PM', name: 'Chicken Rice Bowl', foods: [{name: 'Grilled Chicken Breast', quantity: '150g'}, {name: 'Jasmine Rice', quantity: '100g'}, {name: 'Mixed Green Salad', quantity: '1 bowl'}, {name: 'Olive Oil', quantity: '1 tbsp'}], calories: 550 },
        { id: '3', type: 'Snack', time: '04:30 PM', name: 'Energy Snack', foods: [{name: 'Banana', quantity: '1'}, {name: 'Whey Protein', quantity: '1 scoop'}, {name: 'Black Coffee', quantity: '1 cup'}], calories: 220 },
        { id: '4', type: 'Dinner', time: '08:00 PM', name: 'Lean Fish & Veggies', foods: [{name: 'Baked Tilapia', quantity: '200g'}, {name: 'Sweet Potato', quantity: '150g'}, {name: 'Asparagus', quantity: '1 bunch'}, {name: 'Avocado', quantity: '1/2'}], calories: 480 }
    ]
};

import { useNotifications } from './NotificationContext';

export const PlanProvider = ({ children }: { children: ReactNode }) => {
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [dietPlan, setDietPlan] = useState<WorkoutPlan | any | null>(null); // Using any for dietPlan for now as per prev definition or update it
    const { addNotification } = useNotifications();

    useEffect(() => {
        // Load from localStorage
        const savedWorkout = localStorage.getItem('zenith_workout_plan');
        const savedDiet = localStorage.getItem('zenith_diet_plan');

        if (savedWorkout) {
            setWorkoutPlan(JSON.parse(savedWorkout));
        } else {
            setWorkoutPlan(DEFAULT_WORKOUT);
        }

        if (savedDiet) {
            setDietPlan(JSON.parse(savedDiet));
        } else {
            setDietPlan(DEFAULT_DIET);
        }
    }, []);

    const assignWorkoutPlan = (plan: WorkoutPlan) => {
        setWorkoutPlan(plan);
        localStorage.setItem('zenith_workout_plan', JSON.stringify(plan));
        
        addNotification({
            type: 'WORKOUT',
            title: 'New Workout Plan Assigned',
            message: `Your trainer has assigned the "${plan.name}" routine to your dashboard. Check it out and start your session!`,
        });
    };

    const assignDietPlan = (plan: DietPlan) => {
        setDietPlan(plan);
        localStorage.setItem('zenith_diet_plan', JSON.stringify(plan));

        addNotification({
            type: 'DIET',
            title: 'Diet Plan Updated',
            message: `Your nutrition strategy has been updated to "${plan.name}". View your daily macros and meal schedule.`,
        });
    };

    return (
        <PlanContext.Provider value={{ workoutPlan, dietPlan, assignWorkoutPlan, assignDietPlan }}>
            {children}
        </PlanContext.Provider>
    );
};

export const usePlan = () => {
    const context = useContext(PlanContext);
    if (context === undefined) {
        throw new Error('usePlan must be used within a PlanProvider');
    }
    return context;
};
