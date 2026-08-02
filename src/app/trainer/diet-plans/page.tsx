'use client';

import { redirect } from 'next/navigation';

export default function DietPlansRedirect() {
    redirect('/trainer/plans');
}
