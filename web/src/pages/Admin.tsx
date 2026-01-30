import { useEffect, useState } from "react";
import api from "../api/axios";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface College {
    id: number;
    name: string;
    allowed_domains: string;
    allow_external_emails: boolean;
}

export default function Admin() {
    const [users, setUsers] = useState<User[]>([]);
    const [colleges, setColleges] = useState<College[]>([]);

    const fetchUsers = () => {
        api.get("/admin/users")
            .then(res => setUsers(res.data))
            .catch(err => console.error("Failed to load users", err));
    };

    const fetchColleges = () => {
        api.get("/colleges")
            .then(res => setColleges(res.data))
            .catch(err => console.error("Failed to load colleges", err));
    };

    useEffect(() => {
        fetchUsers();
        fetchColleges();
    }, []);

    const updateRole = (userId: number, role: string) => {
        api.patch(`/admin/users/${userId}/role`, { role })
            .then(() => fetchUsers())
            .catch(() => alert("Role update failed"));
    };

    const toggleExternalEmail = (college: College) => {
        api.patch(`/admin/colleges/${college.id}`, {
            allowed_domains: college.allowed_domains,
            allow_external_emails: !college.allow_external_emails,
        })
            .then(() => fetchColleges())
            .catch(() => alert("College update failed"));
    };

    return (
        <div style={{ padding: "30px" }}>
            <h2>Admin Dashboard</h2>

            <h3>Users</h3>
            {users.map(user => (
                <div key={user.id} style={{ marginBottom: "8px" }}>
                    {user.name} ({user.email}) — <b>{user.role}</b>
                    <select
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        style={{ marginLeft: "10px" }}
                    >
                        <option value="student">student</option>
                        <option value="vendor">vendor</option>
                        <option value="admin">admin</option>
                        <option value="delivery">delivery</option>
                    </select>
                </div>
            ))}

            <hr />

            <h3>Colleges</h3>
            {colleges.map(college => (
                <div key={college.id} style={{ marginBottom: "10px" }}>
                    <b>{college.name}</b><br />
                    Domains: {college.allowed_domains}<br />
                    External Emails:{" "}
                    <b>{college.allow_external_emails ? "Allowed" : "Blocked"}</b>
                    <br />
                    <button onClick={() => toggleExternalEmail(college)}>
                        Toggle External Email
                    </button>
                </div>
            ))}
        </div>
    );
}
