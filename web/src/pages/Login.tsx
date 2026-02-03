import GoogleLogin from "../auth/GoogleLogin";

export default function Login() {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>CampusX Login</h2>

                <p style={styles.subtitle}>
                    Login with your college verified Google account
                </p>

                {/* ✅ Google Login Button */}
                <GoogleLogin />
            </div>
        </div>
    );
}

/* --- simple inline styles (no UI lib, safe) --- */
const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f6f8",
    },
    card: {
        background: "#fff",
        padding: "2rem",
        borderRadius: "10px",
        width: "320px",
        textAlign: "center" as const,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    },
    title: {
        marginBottom: "0.5rem",
    },
    subtitle: {
        fontSize: "0.9rem",
        color: "#666",
        marginBottom: "1.5rem",
    },
};
