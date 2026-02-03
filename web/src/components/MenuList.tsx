import type{ MenuItem } from "../types/menu";

export default function MenuList({
    items,
    onOrder,
}: {
    items: MenuItem[];
    onOrder: (menuItemId: number) => void;
}) {
    return (
        <ul>
            {items.map((item) => (
                <li key={item.id} style={{ marginBottom: 10 }}>
                    <strong>{item.name}</strong> – ₹{item.price}
                    <br />
                    <button onClick={() => onOrder(item.id)}>
                        Order
                    </button>
                </li>
            ))}
        </ul>
    );
}
