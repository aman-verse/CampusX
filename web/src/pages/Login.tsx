import { GoogleLogin } from "@react-oauth/google";
import type { GoogleCredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

interface JwtPayload {
    role: string;
}

export default function Login() {
    const navigate = useNavigate();
    // const collegeId = localStorage.getItem("college_id");

    const handleGoogleSuccess = async (credentialResponse: GoogleCredentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            const collegeId = localStorage.getItem("college_id");

            const res = await api.post("/auth/google", {
                id_token: idToken,
                college_id: Number(collegeId),
            });

            const token = res.data.access_token;
            localStorage.setItem("token", token);

            const decoded: JwtPayload = jwtDecode(token);

            if (decoded.role === "admin") {
                navigate("/admin");
            } else if (decoded.role === "vendor") {
                navigate("/vendor");
            } else {
                navigate("/student");
            }

        } catch (err) {
            console.error(err);
            alert("Login failed");
        }
    };

    return (
        <div style={{ padding: "40px" }}>
            <h2>Login with Google</h2>

            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google Login Failed")}
            />
        </div>
    );
}
