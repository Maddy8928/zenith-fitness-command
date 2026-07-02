'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Types ---

export interface Exercise {
    id: string;
    name: string;
    target: string;
    sets: number;
    reps: string;
    rest: string;
    notes: string;
}

export interface WorkoutPlan {
    name: string;
    focus: string;
    duration: string;
    intensity: string;
    exercises: Exercise[];
}

export interface Meal {
    id: string;
    type: string;
    time: string;
    name: string;
    foods: string[];
    calories: number;
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
    duration: "45-60 min",
    intensity: "High",
    exercises: [
        { id: '1', name: 'Barbell Bench Press', target: 'Chest, Triceps', sets: 4, reps: '8-10', rest: '90s', notes: 'Focus on eccentric control. Keep elbows tucked.' },
        { id: '2', name: 'Incline Dumbbell Press', target: 'Upper Chest', sets: 3, reps: '10-12', rest: '60s', notes: 'Slight pause at the bottom.' },
        { id: '3', name: 'Lat Pulldown (Wide Grip)', target: 'Lats, Back', sets: 4, reps: '10-12', rest: '60s', notes: 'Pull to upper chest. Squeeze at the bottom.' },
        { id: '4', name: 'Seated Cable Rows', target: 'Mid Back', sets: 3, reps: '12-15', rest: '60s', notes: 'Keep chest proud, do not use momentum.' },
        { id: '5', name: 'Overhead Tricep Extension', target: 'Triceps', sets: 3, reps: '15', rest: '45s', notes: 'Keep elbows pointing forward.' }
    ]
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
        { id: '1', type: 'Breakfast', time: '08:00 AM', name: 'Oats & Egg Whites', foods: ['1 cup Oatmeal', '4 Egg Whites', '1 Whole Egg', '1/2 cup Blueberries'], calories: 350 },
        { id: '2', type: 'Lunch', time: '01:00 PM', name: 'Chicken Rice Bowl', foods: ['150g Grilled Chicken Breast', '100g Jasmine Rice', 'Mixed Green Salad', '1 tbsp Olive Oil'], calories: 550 },
        { id: '3', type: 'Pre-Workout', time: '04:30 PM', name: 'Energy Snack', foods: ['1 Banana', '1 scoop Whey Protein', 'Black Coffee'], calories: 220 },
        { id: '4', type: 'Dinner', time: '08:00 PM', name: 'Lean Fish & Veggies', foods: ['200g Baked Tilapia', '150g Sweet Potato', 'Asparagus', 'Avocado Slice'], calories: 480 }
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
