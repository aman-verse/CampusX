import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import {
    getVendorOrders,
    acceptOrder,
    rejectOrder,
} from "../api/vendor.api";
import type { VendorOrder } from "../types/vendorOrder";
import StatusBadge from "../components/StatusBadge";
import { openWhatsApp } from "../utils/whatsapp";

export default function Vendor() {
    const [orders, setOrders] = useState<VendorOrder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await getVendorOrders();
                setOrders(data);
            } catch (err) {
                console.error(err);
            }
        };

        loadOrders();
    }, []);

    const handleAccept = async (id: number) => {
        setLoading(true);
        await acceptOrder(id);
        const data = await getVendorOrders();
        setOrders(data);
        setLoading(false);
    };

    const handleReject = async (id: number) => {
        setLoading(true);
        await rejectOrder(id);
        const data = await getVendorOrders();
        setOrders(data);
        setLoading(false);
    };

    return (
        <AppLayout>
            <h2>Vendor Panel</h2>

            {orders.length === 0 && <p>No orders yet</p>}
            {orders.map((o) => (
                <div
                    key={o.id}
                    style={{
                        border: "1px solid #ddd",
                        padding: 12,
                        marginBottom: 12,
                    }}
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

                    {o.status === "placed" && (
                        <>
                            <button onClick={() => handleAccept(o.id)}>Accept</button>
                            <button onClick={() => handleReject(o.id)}>Reject</button>
                            <button onClick={() => openWhatsApp("91XXXXXXXXXX", o.id)}>
                                WhatsApp
                            </button>
                        </>
                    )}
                </div>
            ))}

            {loading && <p>Updating...</p>}
        </AppLayout>
    );
}
