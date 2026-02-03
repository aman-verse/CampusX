export interface VendorOrderItem {
    menu_item_id: number;
    quantity: number;
}

export interface VendorOrder {
    id: number;
    status: "placed" | "accepted" | "rejected" | "delivered";
    items: VendorOrderItem[];
}
