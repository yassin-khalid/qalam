
// db/sessionHelpers.ts
import z from 'zod';
import { localStorageCollection } from '../db/localStorageCollection';
import { AuthSession, authSessionSchema } from '../types/auth';

const DEFAULT_SESSION = {
    id: 'current',
    teacher: { id: 'guest', name: 'Guest' },
    token: '',
    theme: 'light',
} as const;

export function updateTheme(theme: 'light' | 'dark') {
    try {
        // Try to update existing session
        localStorageCollection.update('current', (draft) => {
            draft.theme = theme;
        });
    } catch (error) {
        // Session doesn't exist, create it with the new theme
        localStorageCollection.insert({
            ...DEFAULT_SESSION,
            theme,
        });
    } finally {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }
}

// Generic upsert helper
export function upsertSession(updates: Partial<AuthSession>) {
    try {
        localStorageCollection.update('current', (draft) => {
            Object.assign(draft, updates);
        });
    } catch {
        // Create with defaults + updates
        localStorageCollection.insert({
            ...DEFAULT_SESSION,
            ...updates,
        });
    }
}