export interface AssignedMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    membershipId: string;
    trainerId: string;
    trainerName: string;
    status: 'Active' | 'Pending' | 'New';
    hasWorkoutPlan: boolean;
    assignedWorkoutPlanName?: string;
    assignedDietPlanName?: string;
    joinDate: string;
    paymentDate: string;
    height: number;
    currentWeight: number;
    goalWeight: number;
    fitnessGoal: string;
    benchPressPR: number;
    squatPR: number;
    deadliftPR: number;
    attendanceCount: number;
    streak: number;
    lastCheckIn: string;
    avatar: string;
}

// --- WORKOUT TYPES ---
export interface ExerciseItem {
    id: string;
    name: string;
    target: string;
    sets: number;
    reps: string;
    weight?: string;
    rest: string;
    notes: string;
}

export interface WorkoutTemplate {
    id: string;
    title: string;
    targetGoal: string; // 'Muscle Gain' | 'Fat Loss' | 'Strength' | 'Endurance' | 'HYROX'
    duration: string;
    sessionsPerWeek: number;
    intensity: string;
    description: string;
    tags: string[];
    exercises: ExerciseItem[];
}

export interface AssignedWorkout {
    id: string;
    memberId: string;
    memberName: string;
    memberEmail: string;
    templateId: string;
    title: string;
    targetGoal: string;
    duration: string;
    assignedDate: string;
    status: 'Active' | 'In Progress' | 'Completed';
    progress: number;
    exercises: ExerciseItem[];
}

// --- DIET TYPES ---
export interface MealItem {
    id: string;
    type: 'Breakfast' | 'Lunch' | 'Pre-Workout' | 'Dinner' | 'Snack';
    time: string;
    name: string;
    foods: string[];
    calories: number;
}

export interface DietTemplate {
    id: string;
    title: string;
    targetGoal: string; // 'Weight Loss' | 'Hypertrophy' | 'Maintenance' | 'Keto' | 'Plant-Based'
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
    waterIntake: string; // e.g. "3.5 Liters / Day"
    supplements: string[];
    duration: string;
    tags: string[];
    notes: string;
    meals: MealItem[];
}

export interface AssignedDiet {
    id: string;
    memberId: string;
    memberName: string;
    memberEmail: string;
    templateId: string;
    title: string;
    targetGoal: string;
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
    assignedDate: string;
    activeDuration: string;
    status: 'Active' | 'Completed';
    waterIntake: string;
    supplements: string[];
    notes: string;
    meals: MealItem[];
}

export const ASSIGNED_MEMBERS_STORAGE_KEY = 'zenith_trainer_assigned_members';
export const WORKOUT_TEMPLATES_KEY = 'zenith_workout_templates_v2';
export const ASSIGNED_WORKOUTS_KEY = 'zenith_assigned_workouts_v2';
export const DIET_TEMPLATES_KEY = 'zenith_diet_templates_v2';
export const ASSIGNED_DIETS_KEY = 'zenith_assigned_diets_v2';

// Default initial seed members for trainers
export const DEFAULT_ASSIGNED_MEMBERS: AssignedMember[] = [
    {
        id: 'mem-1',
        name: 'Alex Thompson',
        email: 'alex.t@example.com',
        phone: '+1 (555) 123-4567',
        membershipId: 'NX-2026-9041',
        trainerId: 'marcus-johnson',
        trainerName: 'Marcus Johnson',
        status: 'Active',
        hasWorkoutPlan: true,
        assignedWorkoutPlanName: 'Shred & Tone 90-Day',
        assignedDietPlanName: 'Shred & Tone (Keto)',
        joinDate: 'Jan 15, 2026',
        paymentDate: '2026-01-15T00:00:00.000Z',
        height: 180,
        currentWeight: 78,
        goalWeight: 72,
        fitnessGoal: 'Weight Loss & Powerlifting',
        benchPressPR: 100,
        squatPR: 140,
        deadliftPR: 175,
        attendanceCount: 18,
        streak: 5,
        lastCheckIn: '2 days ago',
        avatar: 'AT'
    },
    {
        id: 'mem-2',
        name: 'Jessica Miller',
        email: 'j.miller@example.com',
        phone: '+1 (555) 987-6543',
        membershipId: 'NX-2026-4401',
        trainerId: 'sarah-chen',
        trainerName: 'Sarah Chen',
        status: 'Active',
        hasWorkoutPlan: true,
        assignedWorkoutPlanName: 'Powerbuilding V2',
        assignedDietPlanName: 'Muscle Builder Pro',
        joinDate: 'Feb 02, 2026',
        paymentDate: '2026-02-02T00:00:00.000Z',
        height: 168,
        currentWeight: 62,
        goalWeight: 65,
        fitnessGoal: 'Muscle Gain & Hypertrophy',
        benchPressPR: 55,
        squatPR: 85,
        deadliftPR: 110,
        attendanceCount: 12,
        streak: 3,
        lastCheckIn: 'Today',
        avatar: 'JM'
    },
    {
        id: 'mem-3',
        name: 'David Garcia',
        email: 'david.g88@example.com',
        phone: '+1 (555) 456-7890',
        membershipId: 'NX-2026-1189',
        trainerId: 'michael-rivers',
        trainerName: 'Michael Rivers',
        status: 'Active',
        hasWorkoutPlan: true,
        assignedWorkoutPlanName: 'Beginner Full Body Split',
        assignedDietPlanName: 'Plant-Based Power',
        joinDate: 'Feb 28, 2026',
        paymentDate: '2026-02-28T00:00:00.000Z',
        height: 175,
        currentWeight: 70,
        goalWeight: 68,
        fitnessGoal: 'Endurance & Mobility',
        benchPressPR: 75,
        squatPR: 100,
        deadliftPR: 120,
        attendanceCount: 22,
        streak: 8,
        lastCheckIn: 'Yesterday',
        avatar: 'DG'
    }
];

// --- SEED WORKOUT TEMPLATES ---
export const DEFAULT_WORKOUT_TEMPLATES: WorkoutTemplate[] = [
    {
        id: 'wt-1',
        title: 'Shred & Tone 90-Day',
        targetGoal: 'Fat Loss',
        duration: '12 Weeks',
        sessionsPerWeek: 4,
        intensity: 'Moderate',
        tags: ['Hypertrophy', 'Fat Loss'],
        description: 'A comprehensive full-body program designed for effective fat loss while maintaining muscle mass.',
        exercises: [
            { id: '1', name: 'Barbell Squats', target: 'Quads & Glutes', sets: 4, reps: '8-10', weight: '75kg', rest: '90s', notes: 'Focus on depth and knee tracking.' },
            { id: '2', name: 'Dumbbell Bench Press', target: 'Chest', sets: 3, reps: '10-12', weight: '24kg', rest: '60s', notes: 'Slight pause at full extension.' },
            { id: '3', name: 'Bent Over Rows', target: 'Back', sets: 3, reps: '10-12', weight: '50kg', rest: '60s', notes: 'Keep torso at 45 degrees.' },
            { id: '4', name: 'Romanian Deadlifts', target: 'Hamstrings', sets: 3, reps: '12-15', weight: '60kg', rest: '60s', notes: 'Hinge at hips, stretch hamstrings.' }
        ]
    },
    {
        id: 'wt-2',
        title: 'Powerbuilding V2',
        targetGoal: 'Strength',
        duration: '8 Weeks',
        sessionsPerWeek: 5,
        intensity: 'High',
        tags: ['Strength', 'Powerlifting'],
        description: 'Advanced Push/Pull/Legs split focusing on heavy compound lifts combined with targeted accessory work.',
        exercises: [
            { id: '1', name: 'Barbell Deadlift', target: 'Posterior Chain', sets: 5, reps: '3-5', weight: '140kg', rest: '180s', notes: 'Brace core hard before pull.' },
            { id: '2', name: 'Overhead Press', target: 'Shoulders', sets: 4, reps: '5-8', weight: '55kg', rest: '120s', notes: 'Strict press, no leg drive.' },
            { id: '3', name: 'Weighted Pull-ups', target: 'Lats', sets: 4, reps: '6-8', weight: '+10kg', rest: '90s', notes: 'Full hang at bottom.' }
        ]
    },
    {
        id: 'wt-3',
        title: 'HYROX Athletic Conditioning',
        targetGoal: 'HYROX',
        duration: '6 Weeks',
        sessionsPerWeek: 5,
        intensity: 'High',
        tags: ['HYROX', 'Endurance', 'Conditioning'],
        description: 'High tempo race preparation mixing Sled Push, Wall Balls, Burpees, and SkiErg intervals.',
        exercises: [
            { id: '1', name: 'Sled Push', target: 'Legs & Conditioning', sets: 4, reps: '50m', weight: '100kg', rest: '60s', notes: 'Explosive drive.' },
            { id: '2', name: 'Wall Ball Shots', target: 'Full Body', sets: 4, reps: '20', weight: '9kg', rest: '45s', notes: 'Squat below parallel.' },
            { id: '3', name: 'SkiErg Intervals', target: 'Cardio', sets: 5, reps: '500m', weight: 'Pace 1:45', rest: '90s', notes: 'Powerful lat drive.' }
        ]
    }
];

// --- SEED DIET TEMPLATES ---
export const DEFAULT_DIET_TEMPLATES: DietTemplate[] = [
    {
        id: 'dt-1',
        title: 'Shred & Tone (Keto)',
        targetGoal: 'Weight Loss',
        calories: 1800,
        macros: { protein: 150, carbs: 30, fats: 120 },
        waterIntake: '4.0 Liters / Day',
        supplements: ['Whey Isolate', 'Omega-3', 'Electrolyte Complex'],
        duration: '4 Weeks',
        tags: ['Keto', 'Low Carb', 'High Fat'],
        notes: 'Maintain strict ketosis under 30g net carbs per day.',
        meals: [
            { id: '1', type: 'Breakfast', time: '08:00 AM', name: 'Egg & Avocado Plate', foods: ['3 Whole Eggs', '1/2 Avocado', '1 cup Spinach cooked in Olive Oil'], calories: 420 },
            { id: '2', type: 'Lunch', time: '01:00 PM', name: 'Grilled Salmon Bowl', foods: ['180g Grilled Salmon', 'Mixed Greens Salad', '2 tbsp Olive Oil Dressing'], calories: 550 },
            { id: '3', type: 'Pre-Workout', time: '04:30 PM', name: 'Keto Fuel Shake', foods: ['1 Scoop Whey Isolate', '1 tbsp Almond Butter', 'Unsweetened Almond Milk'], calories: 250 },
            { id: '4', type: 'Dinner', time: '08:00 PM', name: 'Steak & Broccoli', foods: ['200g Ribeye Steak', 'Steamed Broccoli with Butter'], calories: 580 }
        ]
    },
    {
        id: 'dt-2',
        title: 'Muscle Builder Pro',
        targetGoal: 'Hypertrophy',
        calories: 3200,
        macros: { protein: 200, carbs: 400, fats: 90 },
        waterIntake: '3.5 Liters / Day',
        supplements: ['Creatine Monohydrate (5g)', 'Whey Protein', 'Multivitamin'],
        duration: '12 Weeks',
        tags: ['High Carb', 'High Protein'],
        notes: 'Surplus nutrition designed to maximize clean lean muscle gains.',
        meals: [
            { id: '1', type: 'Breakfast', time: '08:00 AM', name: 'Oatmeal & Eggs Power Breakfast', foods: ['1.5 cups Oatmeal', '4 Egg Whites', '2 Whole Eggs', '1 Banana'], calories: 750 },
            { id: '2', type: 'Lunch', time: '01:00 PM', name: 'Chicken & Jasmine Rice Bowl', foods: ['220g Chicken Breast', '2 cups Jasmine Rice', 'Steamed Asparagus'], calories: 850 },
            { id: '3', type: 'Pre-Workout', time: '04:30 PM', name: 'Carb & Protein Booster', foods: ['1 Large Sweet Potato', '1 Scoop Protein Shake'], calories: 450 },
            { id: '4', type: 'Dinner', time: '08:00 PM', name: 'Lean Beef & Sweet Potato', foods: ['250g 90% Lean Ground Beef', '200g Roasted Sweet Potato', 'Green Beans'], calories: 800 },
            { id: '5', type: 'Snack', time: '10:00 PM', name: 'Bedtime Protein', foods: ['1 cup Greek Yogurt', '1 tbsp Honey', 'Handful Almonds'], calories: 350 }
        ]
    }
];

// --- SEED ASSIGNED WORKOUTS ---
export const DEFAULT_ASSIGNED_WORKOUTS: AssignedWorkout[] = [
    {
        id: 'aw-1',
        memberId: 'mem-1',
        memberName: 'Alex Thompson',
        memberEmail: 'alex.t@example.com',
        templateId: 'wt-1',
        title: 'Shred & Tone 90-Day',
        targetGoal: 'Fat Loss',
        duration: '12 Weeks',
        assignedDate: 'Jan 15, 2026',
        status: 'Active',
        progress: 75,
        exercises: DEFAULT_WORKOUT_TEMPLATES[0].exercises
    },
    {
        id: 'aw-2',
        memberId: 'mem-2',
        memberName: 'Jessica Miller',
        memberEmail: 'j.miller@example.com',
        templateId: 'wt-2',
        title: 'Powerbuilding V2',
        targetGoal: 'Strength',
        duration: '8 Weeks',
        assignedDate: 'Feb 02, 2026',
        status: 'Active',
        progress: 40,
        exercises: DEFAULT_WORKOUT_TEMPLATES[1].exercises
    }
];

// --- SEED ASSIGNED DIETS ---
export const DEFAULT_ASSIGNED_DIETS: AssignedDiet[] = [
    {
        id: 'ad-1',
        memberId: 'mem-1',
        memberName: 'Alex Thompson',
        memberEmail: 'alex.t@example.com',
        templateId: 'dt-1',
        title: 'Shred & Tone (Keto)',
        targetGoal: 'Weight Loss',
        calories: 1800,
        macros: DEFAULT_DIET_TEMPLATES[0].macros,
        assignedDate: 'Jan 15, 2026',
        activeDuration: '4 Weeks',
        status: 'Active',
        waterIntake: '4.0 Liters / Day',
        supplements: DEFAULT_DIET_TEMPLATES[0].supplements,
        notes: DEFAULT_DIET_TEMPLATES[0].notes,
        meals: DEFAULT_DIET_TEMPLATES[0].meals
    },
    {
        id: 'ad-2',
        memberId: 'mem-2',
        memberName: 'Jessica Miller',
        memberEmail: 'j.miller@example.com',
        templateId: 'dt-2',
        title: 'Muscle Builder Pro',
        targetGoal: 'Hypertrophy',
        calories: 3200,
        macros: DEFAULT_DIET_TEMPLATES[1].macros,
        assignedDate: 'Feb 02, 2026',
        activeDuration: '12 Weeks',
        status: 'Active',
        waterIntake: '3.5 Liters / Day',
        supplements: DEFAULT_DIET_TEMPLATES[1].supplements,
        notes: DEFAULT_DIET_TEMPLATES[1].notes,
        meals: DEFAULT_DIET_TEMPLATES[1].meals
    }
];

// --- MEMBER HELPER FUNCTIONS ---
export function getAssignedMembers(): AssignedMember[] {
    if (typeof window === 'undefined') return DEFAULT_ASSIGNED_MEMBERS;
    try {
        const saved = localStorage.getItem(ASSIGNED_MEMBERS_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to load assigned members", e);
    }
    return DEFAULT_ASSIGNED_MEMBERS;
}

export function saveAssignedMembers(members: AssignedMember[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(ASSIGNED_MEMBERS_STORAGE_KEY, JSON.stringify(members));
        window.dispatchEvent(new Event('storage'));
    } catch (e) {
        console.error("Failed to save assigned members", e);
    }
}

export function autoAssignMemberToTrainer(params: {
    memberId?: string;
    memberName: string;
    memberEmail: string;
    trainerId: string;
    trainerName: string;
    phone?: string;
}): AssignedMember {
    const currentList = getAssignedMembers();
    let profileData: any = {};
    try {
        const savedProfile = localStorage.getItem('flex_fitness_profile_v2');
        if (savedProfile) {
            profileData = JSON.parse(savedProfile);
        }
    } catch (e) {}

    const existingIdx = currentList.findIndex(
        m => m.email.toLowerCase() === params.memberEmail.toLowerCase() || m.id === params.memberId
    );

    const newMember: AssignedMember = {
        id: params.memberId || `mem-${Date.now()}`,
        name: params.memberName,
        email: params.memberEmail,
        phone: params.phone || '+1 (555) 019-2831',
        membershipId: 'NX-2026-9041',
        trainerId: params.trainerId,
        trainerName: params.trainerName,
        status: 'New',
        hasWorkoutPlan: false,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        paymentDate: new Date().toISOString(),
        height: profileData.height || 175,
        currentWeight: profileData.currentWeight || 80,
        goalWeight: profileData.goalWeight || 75,
        fitnessGoal: profileData.fitnessGoal || 'Muscle Gain',
        benchPressPR: profileData.benchPressPR || 85,
        squatPR: profileData.squatPR || 110,
        deadliftPR: profileData.deadliftPR || 135,
        attendanceCount: 1,
        streak: 1,
        lastCheckIn: 'Just Now',
        avatar: params.memberName.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'
    };

    if (existingIdx >= 0) {
        currentList[existingIdx] = {
            ...currentList[existingIdx],
            trainerId: params.trainerId,
            trainerName: params.trainerName,
            status: currentList[existingIdx].hasWorkoutPlan ? 'Active' : 'New',
            paymentDate: new Date().toISOString(),
        };
        saveAssignedMembers(currentList);
        return currentList[existingIdx];
    } else {
        const updatedList = [newMember, ...currentList];
        saveAssignedMembers(updatedList);
        return newMember;
    }
}

export function assignWorkoutPlanToMember(memberId: string, planName: string) {
    const members = getAssignedMembers();
    const updated = members.map(m => {
        if (m.id === memberId || m.email.toLowerCase() === memberId.toLowerCase()) {
            return {
                ...m,
                status: 'Active' as const,
                hasWorkoutPlan: true,
                assignedWorkoutPlanName: planName,
            };
        }
        return m;
    });
    saveAssignedMembers(updated);
}

// --- WORKOUT TEMPLATE & ASSIGNMENT HELPERS ---
export function getWorkoutTemplates(): WorkoutTemplate[] {
    if (typeof window === 'undefined') return DEFAULT_WORKOUT_TEMPLATES;
    try {
        const saved = localStorage.getItem(WORKOUT_TEMPLATES_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_WORKOUT_TEMPLATES;
}

export function saveWorkoutTemplates(templates: WorkoutTemplate[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(WORKOUT_TEMPLATES_KEY, JSON.stringify(templates));
        window.dispatchEvent(new Event('storage'));
    } catch (e) {}
}

export function getAssignedWorkouts(): AssignedWorkout[] {
    if (typeof window === 'undefined') return DEFAULT_ASSIGNED_WORKOUTS;
    try {
        const saved = localStorage.getItem(ASSIGNED_WORKOUTS_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ASSIGNED_WORKOUTS;
}

export function saveAssignedWorkouts(assignments: AssignedWorkout[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(ASSIGNED_WORKOUTS_KEY, JSON.stringify(assignments));
        window.dispatchEvent(new Event('storage'));
    } catch (e) {}
}

// --- DIET TEMPLATE & ASSIGNMENT HELPERS ---
export function getDietTemplates(): DietTemplate[] {
    if (typeof window === 'undefined') return DEFAULT_DIET_TEMPLATES;
    try {
        const saved = localStorage.getItem(DIET_TEMPLATES_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_DIET_TEMPLATES;
}

export function saveDietTemplates(templates: DietTemplate[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(DIET_TEMPLATES_KEY, JSON.stringify(templates));
        window.dispatchEvent(new Event('storage'));
    } catch (e) {}
}

export function getAssignedDiets(): AssignedDiet[] {
    if (typeof window === 'undefined') return DEFAULT_ASSIGNED_DIETS;
    try {
        const saved = localStorage.getItem(ASSIGNED_DIETS_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ASSIGNED_DIETS;
}

export function saveAssignedDiets(assignments: AssignedDiet[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(ASSIGNED_DIETS_KEY, JSON.stringify(assignments));
        window.dispatchEvent(new Event('storage'));
    } catch (e) {}
}
