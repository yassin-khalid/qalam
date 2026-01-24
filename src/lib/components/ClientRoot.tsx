'use client';

import { useEffect } from 'react';
// import { localStorageCollection } from '../db/localStorageCollection';
import { useTheme } from '../hooks/useTheme';

export function ClientRoot({ children }: { children: React.ReactNode }) {
    const theme = useTheme()

    // useEffect(() => {
    //     // Check existence synchronously if possible, or use try-catch
    //     try {
    //         const exists = localStorageCollection.get('current');
    //         if (!exists) {
    //             // Only create default session if it doesn't exist
    //             // Don't overwrite existing data
    //             const newSession = localStorageCollection.insert({
    //                 id: 'current',
    //                 teacher: { id: 'guest', name: 'Guest' },
    //                 token: '',
    //                 theme: 'light', // default theme is light
    //             });
    //             if (newSession.error) {
    //                 console.error("Failed to initialize session:", newSession.error);
    //             }
    //         } else {
    //             // Ensure existing session has all required fields
    //             // If token exists, preserve it
    //             const current = exists;
    //             if (!current.teacher || !current.theme) {
    //                 localStorageCollection.update('current', (draft) => {
    //                     if (!draft.teacher) {
    //                         draft.teacher = { id: 'guest', name: 'Guest' };
    //                     }
    //                     if (!draft.theme) {
    //                         draft.theme = 'light';
    //                     }
    //                 });
    //             }
    //         }
    //     } catch (err) {
    //         // If get throws or collection method is async → ignore or log
    //         console.debug("Session check failed during init", err);
    //     }
    // }, []);


    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return <>{children}</>;
}

