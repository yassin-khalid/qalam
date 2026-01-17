import { createContext, useEffect, useState } from "react";
import { LoginCredentials } from "../types/auth";

export interface Teacher {
    id: string;
    name: string;
    email: string;
    mobile?: string;
}
export type LoginMethod = 'email' | 'mobile';

export interface AuthConfig {
    availableLoginMethods: LoginMethod[];
    requiresOtp: boolean;
    otpLength?: number;
}




export interface AuthContextType {
    isAuthenticated: boolean,
    teacher: Teacher | null,
    authConfig: AuthConfig | null,
    isLoadingConfig: boolean,
    requestOTP: (phone: string) => Promise<void>,
    login: (credentials: LoginCredentials) => Promise<void>,
    logout: () => void,
    canLoginWith: (method: LoginMethod) => boolean,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);

    useEffect(() => {
        fetchAuthConfig();
    }, []);

    const fetchAuthConfig = async () => {
        try {
            setIsLoadingConfig(true);
            const response = await fetch('/api/auth/config');
            const data = await response.json() as AuthConfig;
            setAuthConfig({ availableLoginMethods: ['mobile'], requiresOtp: true, otpLength: 6 });
        } catch (error) {
            console.error('Error fetching auth config:', error as Error);
            setAuthConfig({ availableLoginMethods: ['email'], requiresOtp: false });
        } finally {
            setIsLoadingConfig(false);
        }
    }

    const login = async (credentials: LoginCredentials) => {
        if (credentials.type === 'email') {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });
            const data = await response.json() as Teacher;
            setTeacher(data);
            localStorage.setItem('teacher', JSON.stringify(data));
            localStorage.setItem('token', response.headers.get('Authorization') ?? '');
        }
        else if (credentials.type === 'mobile') {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });
            const data = await response.json() as Teacher;
            setTeacher(data);
            localStorage.setItem('teacher', JSON.stringify(data));
            localStorage.setItem('token', response.headers.get('Authorization') ?? '');
        }
        else {
            throw new Error('Invalid login credentials');
        }
    }

    const logout = () => {
        setTeacher(null);
        localStorage.removeItem('teacher');
        localStorage.removeItem('token');
    }

    const canLoginWith = (method: LoginMethod) => {
        return authConfig?.availableLoginMethods.includes(method) ?? false;
    }

    const requestOTP = async (phone: string) => {
        if (!authConfig?.requiresOtp) {
            throw new Error('OTP is not required for this login method');
        }
    }

    const value: AuthContextType = {
        isAuthenticated: !!teacher && !!localStorage.getItem('token'),
        teacher,
        authConfig,
        isLoadingConfig,
        requestOTP,
        login,
        logout,
        canLoginWith,
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}