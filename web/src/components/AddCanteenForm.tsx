import { useState } from "react";
import { createCanteen } from "../api/admin.api";

interface Props {
    collegeId: number;
    onDone: () => void;
}

export default function AddCanteenForm({ collegeId, onDone }: Props) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!name || !phone) return;

        setLoading(true);
        await createCanteen({
            name,
            college_id: collegeId,
            vendor_phone: phone,
        });
        setLoading(false);
        setName("");
        setPhone("");
        onDone();
    };

    return (
        <div>
            <h4>Add Canteen</h4>

            <input
                placeholder="Canteen name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                placeholder="Vendor phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />

            <button onClick={submit} disabled={loading}>
                {loading ? "Adding..." : "Add"}
            </button>
        </div>
    );
}
