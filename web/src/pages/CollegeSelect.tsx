import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {api} from "../api/axios";

interface College {
    id: number;
    name: string;
}

export default function CollegeSelect() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/colleges")
            .then((res) => setColleges(res.data))
            .catch((err) => console.error("Failed to load colleges", err));
    }, []);

    const handleContinue = () => {
        if (!selectedCollege) {
            alert("Please select a college");
            return;
        }

        const college = colleges.find(c => c.id === selectedCollege);
        if (!college) return;

        localStorage.setItem("college_id", college.id.toString());
        localStorage.setItem("college_name", college.name);

        navigate("/login");
    };


    return (
        <div style={{ padding: "40px" }}>
            <h2>Select Your College</h2>

            <select
                value={selectedCollege ?? ""}
                onChange={(e) => setSelectedCollege(Number(e.target.value))}
            >
                <option value="">-- Select College --</option>
                {colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                        {college.name}
                    </option>
                ))}
            </select>

            <br /><br />

            <button onClick={handleContinue}>Continue</button>
        </div>
    );
}
