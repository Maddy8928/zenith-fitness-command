'use client';

import { redirect } from 'next/navigation';

export default function WorkoutPlansRedirect() {
    redirect('/trainer/plans');
}
