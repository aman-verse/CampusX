import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { getAcceptedOrders, markDelivered } from "../api/delivery.api";
import type{ DeliveryOrder } from "../types/deliveryOrder";
import StatusBadge from "../components/StatusBadge";

export default function Delivery() {
    const [orders, setOrders] = useState<DeliveryOrder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            const data = await getAcceptedOrders();
            setOrders(data);
        };

        fetchOrders();
    }, []);
    const load = async () => {
        const data = await getAcceptedOrders();
        setOrders(data);
    }

    const deliver = async (id: number) => {
        setLoading(true);
        await markDelivered(id);
        await load();
        setLoading(false);
    };

    return (
        <AppLayout>
            <h2>Delivery Panel</h2>

            {orders.length === 0 && <p>No orders</p>}

            {orders.map((o) => (
                <div
                    key={o.id}
                    style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}
                >
                    <p>
                        Order #{o.id} — <StatusBadge status={o.status} />
                    </p>

                    <ul>
                        {o.items.map((i, idx) => (
                            <li key={idx}>
                                Item {i.menu_item_id} × {i.quantity}
                            </li>
                        ))}
                    </ul>

                    {o.status === "accepted" && (
                        <button onClick={() => deliver(o.id)} disabled={loading}>
                            Mark Delivered
                        </button>
                    )}
                </div>
            ))}

            {loading && <p>Updating...</p>}
        </AppLayout>
    );
}
