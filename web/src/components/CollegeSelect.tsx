import { useEffect, useState } from "react";
import { getColleges } from "../api/college.api";
import type{ College } from "../types/college";

export default function CollegeSelect({
    onSelect,
}: {
    onSelect: (id: number) => void;
}) {
    const [colleges, setColleges] = useState<College[]>([]);

    useEffect(() => {
        getColleges().then(setColleges);
    }, []);

    return (
        <select onChange={(e) => onSelect(Number(e.target.value))}>
            <option value="">Select College</option>
            {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.name}
                </option>
            ))}
        </select>
    );
}
