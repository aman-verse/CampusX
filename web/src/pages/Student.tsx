import { useEffect, useState } from "react";
import api from "../api/axios";

interface MenuItem {
    id: number;
    name: string;
    price: number;
}

interface CartItem extends MenuItem {
    quantity: number;
}

export default function Student() {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    // TEMP: single canteen (for campus MVP)
    const CANTEEN_ID = 1;

    useEffect(() => {
        api.get(`/menu/${CANTEEN_ID}`)
            .then(res => setMenu(res.data))
            .catch(err => console.error("Menu load failed", err));
    }, []);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const placeOrder = async () => {
        if (cart.length === 0) {
            alert("Cart is empty");
            return;
        }

        try {
            const payload = {
                items: cart.map(i => ({
                    menu_item_id: i.id,
                    quantity: i.quantity,
                })),
            };

            const res = await api.post("/orders", payload);

            const phone = res.data.canteen_phone;

            const message = `
New Order 🍽️

Items:
${cart.map(i => `- ${i.name} x${i.quantity}`).join("\n")}

Thank you!
      `;

            const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
            window.open(url, "_blank");

            setCart([]);
        } catch (err) {
            console.error(err);
            alert("Order failed");
        }
    };

    return (
        <div style={{ padding: "30px" }}>
            <h2>Student Dashboard</h2>

            <h3>Menu</h3>
            {menu.map(item => (
                <div key={item.id}>
                    {item.name} - ₹{item.price}
                    <button onClick={() => addToCart(item)}>Add</button>
                </div>
            ))}

            <h3>Cart</h3>
            {cart.map(item => (
                <div key={item.id}>
                    {item.name} x {item.quantity}
                </div>
            ))}

            <br />
            <button onClick={placeOrder}>Place Order</button>
        </div>
    );
}
