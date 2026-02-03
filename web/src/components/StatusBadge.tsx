interface Props {
    status: "placed" | "accepted" | "rejected" | "delivered";
}

export default function StatusBadge({ status }: Props) {
    const map: Record<Props["status"], string> = {
        placed: "🆕 New",
        accepted: "🍳 Accepted",
        rejected: "❌ Rejected",
        delivered: "✅ Delivered",
    };

    return <strong>{map[status]}</strong>;
}
