import { useEffect, useState } from "react";
import { assignVendor, getVendors } from "../api/admin.api";
import type{ User } from "../types/user";

interface Props {
    canteenId: number;
}

export default function AssignVendor({ canteenId }: Props) {
    const [vendors, setVendors] = useState<User[]>([]);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        getVendors().then(setVendors);
    }, []);

    const submit = async () => {
        if (!userId) return;

        await assignVendor({
            user_id: userId,
            canteen_id: canteenId,
        });

        alert("Vendor assigned");
    };

    return (
        <div>
            <h4>Assign Vendor</h4>

            <select onChange={(e) => setUserId(Number(e.target.value))}>
                <option value="">Select vendor</option>
                {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                        {v.email}
                    </option>
                ))}
            </select>

            <button onClick={submit}>Assign</button>
        </div>
    );
}
