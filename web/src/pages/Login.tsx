export default function Login() {
    const collegeId = localStorage.getItem("college_id");
    const collegeName = localStorage.getItem("college_name");

    return (
        <div style={{ padding: "40px" }}>
            <h2>Login</h2>
            <p><strong>College:</strong> {collegeName}</p>
            <p><strong>College ID:</strong> {collegeId}</p>

            <p>Google Login button yahin aayega</p>
        </div>
    );
}
