'use client';

import { useEffect } from 'react';
import { localStorageCollection } from '../db/localStorageCollection';
// import { useTheme } from '../hooks/useTheme';

export function ClientRoot({ children }: { children: React.ReactNode }) {
    // const theme = useTheme()

    useEffect(() => {
        // Check existence synchronously if possible, or use try-catch
        try {
            const exists = localStorageCollection.get('current');
            if (!exists) {
                const newSession = localStorageCollection.insert({
                    id: 'current',
                    teacher: { id: 'guest', name: 'Guest' },
                    token: '',
                    theme: 'light', // default theme is light
                });
                console.log("error", newSession.error)
            }
        } catch (err) {
            // If get throws or collection method is async → ignore or log
            console.debug("Session check failed during init", err);
        }
    }, []);


    // useEffect(() => {
    //     if (theme === 'dark') {
    //         document.documentElement.classList.add('dark');
    //     } else {
    //         document.documentElement.classList.remove('dark');
    //     }
    // }, [theme]);

    return <>{children}</>;
}

