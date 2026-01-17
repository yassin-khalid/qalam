'use client';  // ← if your framework supports this directive (TanStack Start / Vite SSR may need equivalent)

import { useLiveQuery } from '@tanstack/react-db';
import { useEffect } from 'react';
import { localStorageCollection } from '../db/localStorageCollection';

export function ClientRoot({ children }: { children: React.ReactNode }) {
    const { data: authSession = [] } = useLiveQuery(q => q.from({ session: localStorageCollection }));
    const currentSession = authSession[0];

    useEffect(() => {
        // Check existence synchronously if possible, or use try-catch
        try {
            const exists = localStorageCollection.get('current'); // or .findSync, .getOne, etc.
            if (!exists) {
                localStorageCollection.insert({
                    id: 'current',
                    teacher: { id: 'guest', name: 'Guest' },
                    token: '',
                    theme: 'light', // default theme is light
                });
            }
        } catch (err) {
            // If get throws or collection method is async → ignore or log
            console.debug("Session check failed during init", err);
        }
    }, []);


    useEffect(() => {
        if (currentSession?.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [currentSession?.theme]);

    return <>{children}</>;
}