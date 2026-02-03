import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { getColleges, getCanteensByCollege } from "../api/admin.api";
import type{ College } from "../types/college";
import type{ Canteen } from "../types/canteen";
import AddCanteenForm from "../components/AddCanteenForm";
import AssignVendor from "../components/AssignVendor";

export default function Admin() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [collegeId, setCollegeId] = useState<number | null>(null);
    const [canteens, setCanteens] = useState<Canteen[]>([]);

    useEffect(() => {
        getColleges().then(setColleges);
    }, []);

    useEffect(() => {
        if (collegeId) {
            getCanteensByCollege(collegeId).then(setCanteens);
        }
    }, [collegeId]);

    return (
        <AppLayout>
            <h2>Admin Panel</h2>

            <h3>Colleges</h3>
            {colleges.map((c) => (
                <button
                    key={c.id}
                    onClick={() => setCollegeId(c.id)}
                    style={{ display: "block", marginBottom: 8 }}
                >
                    {c.name}
                </button>
            ))}

            {collegeId && (
                <AddCanteenForm
                    collegeId={collegeId}
                    onDone={() => {
                        if (collegeId) {
                            getCanteensByCollege(collegeId).then(setCanteens);
                        }
                    }}
                />
            )}

            {canteens.map((c) => (
                <div key={c.id} style={{ marginBottom: 16 }}>
                    <strong>{c.name}</strong>
                    <AssignVendor canteenId={c.id} />
                </div>
            ))}

            {canteens.length > 0 && (
                <>
                    <h3>Canteens</h3>
                    <ul>
                        {canteens.map((c) => (
                            <li key={c.id}>
                                {c.name} — 📞 {c.vendor_phone}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </AppLayout>
    );
}
