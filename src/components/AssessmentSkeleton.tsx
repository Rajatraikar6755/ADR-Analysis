import React from 'react';
import { Skeleton } from './ui/skeleton';

export const AssessmentSkeleton = () => {
    return (
        <div className="space-y-6 p-6 border rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>

            <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};
