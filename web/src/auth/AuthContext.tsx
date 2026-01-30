import { createContext, useState } from "react";

type AuthState = {
    token: string | null;
    collegeId: number | null;
    setToken: (t: string | null) => void;
    setCollegeId: (id: number) => void;
};

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );
    const [collegeId, setCollegeId] = useState<number | null>(
        Number(localStorage.getItem("collegeId")) || null
    );

    const saveToken = (t: string | null) => {
        setToken(t);
        if (t) localStorage.setItem("token", t);
        else localStorage.removeItem("token");
    };

    const saveCollegeId = (id: number) => {
        setCollegeId(id);
        localStorage.setItem("collegeId", String(id));
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                collegeId,
                setToken: saveToken,
                setCollegeId: saveCollegeId,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
