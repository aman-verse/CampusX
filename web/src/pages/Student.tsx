import { useEffect, useState } from "react";
import CollegeSelect from "../components/CollegeSelect";
import MenuList from "../components/MenuList";
import { getCanteens } from "../api/canteen.api";
import { getMenu } from "../api/menu.api";
import { placeOrder } from "../api/order.api";
import type{ Canteen } from "../types/canteen";
import type{ MenuItem } from "../types/menu";
import AppLayout  from "../layouts/AppLayout";


export default function Student() {
    const [collegeId, setCollegeId] = useState<number | null>(null);
    const [canteens, setCanteens] = useState<Canteen[]>([]);
    const [canteenId, setCanteenId] = useState<number | null>(null);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        if (collegeId) {
            getCanteens(collegeId).then(setCanteens);
        }
    }, [collegeId]);

    useEffect(() => {
        if (canteenId) {
            getMenu(canteenId).then(setMenu);
        }
    }, [canteenId]);

    const handleOrder = async (menuItemId: number) => {
        if (!canteenId) return;

        setLoading(true);
        setMessage("");

        try {
            const res = await placeOrder({
                canteen_id: canteenId,
                items: [{ menu_item_id: menuItemId, quantity: 1 }],
            });
            setMessage(`✅ Order placed (status: ${res.status})`);
        } catch (err) {
            console.error(err);
            setMessage("❌ Order failed (check login or try again)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <h2>Student Panel</h2>

            <CollegeSelect onSelect={setCollegeId} />

            {canteens.length > 0 && (
                <>
                    <h3>Select Canteen</h3>
                    {canteens.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setCanteenId(c.id)}
                            style={{ display: "block", marginBottom: 8 }}
                        >
                            {c.name}
                        </button>
                    ))}
                </>
            )}

            {menu.length > 0 && (
                <>
                    <h3>Menu</h3>
                    <MenuList items={menu} onOrder={handleOrder} />
                </>
            )}

            {loading && <p>⏳ Placing order...</p>}
            {message && <p>{message}</p>}
        </AppLayout>
    );
}
