import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import {   authSessionSchema } from "../types/auth";

export const localStorageCollection = createCollection(
    localStorageCollectionOptions( {
        id: 'auth-session',
        storageKey: 'app_auth_session',
        schema: authSessionSchema,
        getKey: (item) => item.id,
    })
)