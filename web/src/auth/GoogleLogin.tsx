import { GoogleLogin as GoogleBtn } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useAuth } from "./useAuth";
import { api } from "../api/axios";
import type{ AuthResponse } from "../types/auth";
import { useNavigate } from "react-router-dom";

export default function GoogleLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSuccess = async (res: CredentialResponse) => {
        try {
            if (!res.credential) {
                console.error("No credential from Google");
                return;
            }

            const response = await api.post<AuthResponse>("/auth/google", {
                token: res.credential,
            });

            console.log("AUTH RESPONSE 👉", response.data);

            login(response.data.access_token, response.data.user);

            const role = response.data.user.role;

            if (role === "admin") navigate("/admin");
            else if (role === "vendor") navigate("/vendor");
            else navigate("/student");

        } catch (err) {
            console.error("Google login failed 👉", err);
            alert("Login failed. Check console.");
        }
    };
    return <GoogleBtn onSuccess={onSuccess} onError={() => console.error("Google Login Failed")} />;
}
