import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthConfig, authConfigSchema } from "../types/auth";

interface AuthContextValue {
    config: AuthConfig | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<AuthConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchConfig = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Config`,
            );
            if (!response.ok) {
                throw new Error(`Auth config request failed (${response.status})`);
            }
            const json = (await response.json()) as { data: unknown };
            setConfig(authConfigSchema.parse(json.data));
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to load auth config"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchConfig();
    }, [fetchConfig]);

    return (
        <AuthContext.Provider value={{ config, isLoading, error, refetch: () => void fetchConfig() }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
