export type UserRole = "student" | "vendor" | "admin";

export interface User {
    id: number;
    email: string;
    role: UserRole;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}
