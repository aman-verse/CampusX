export interface DeliveryOrderItem {
    menu_item_id: number;
    quantity: number;
}

export interface DeliveryOrder {
    id: number;
    status: "accepted" | "delivered";
    items: DeliveryOrderItem[];
}
