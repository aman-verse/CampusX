import { useEffect, useState } from "react";
import api from "../api/axios";

interface OrderItem {
    name: string;
    quantity: number;
}

interface Order {
    id: number;
    status: string;
    items: OrderItem[];
    created_at: string;
}

export default function Vendor() {
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchOrders = () => {
        api.get("/orders/vendor")
            .then(res => setOrders(res.data))
            .catch(err => console.error("Failed to load orders", err));
    };

    useEffect(() => {
        fetchOrders(); // initial load

        const interval = setInterval(() => {
            fetchOrders();
        }, 10000); // ⏱️ polling every 10 sec

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: "30px" }}>
            <h2>Vendor Dashboard</h2>

            {orders.length === 0 && <p>No orders yet</p>}

            {orders.map(order => (
                <div
                    key={order.id}
                    style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        marginBottom: "10px"
                    }}
                >
                    <h4>Order #{order.id}</h4>
                    <p>Status: {order.status}</p>

                    <ul>
                        {order.items.map((item, idx) => (
                            <li key={idx}>
                                {item.name} × {item.quantity}
                            </li>
                        ))}
                    </ul>

                    <small>
                        {new Date(order.created_at).toLocaleString()}
                    </small>
                </div>
            ))}
        </div>
    );
}
