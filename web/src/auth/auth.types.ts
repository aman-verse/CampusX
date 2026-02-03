import type { User } from "../types/auth";

export interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}
