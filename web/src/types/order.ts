export interface OrderItemCreate {
    menu_item_id: number;
    quantity: number;
}

export interface OrderCreate {
    canteen_id: number;
    items: OrderItemCreate[];
}

export interface OrderResponse {
    id: number;
    status: string;
}
