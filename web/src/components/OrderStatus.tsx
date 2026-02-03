interface Props {
    status: "placed" | "accepted" | "rejected" | "delivered";
}

export function OrderStatus({ status }: Props) {
    const map = {
        placed: "🕒 Waiting for vendor",
        accepted: "🍳 Preparing",
        rejected: "❌ Rejected by vendor",
        delivered: "✅ Delivered",
    };

    return <p>{map[status]}</p>;
}
