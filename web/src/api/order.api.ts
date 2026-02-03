import { api } from "./axios";
import type{ OrderCreate, OrderResponse } from "../types/order";

export const placeOrder = async (
    data: OrderCreate
): Promise<OrderResponse> => {
    const res = await api.post("/orders/", data);
    return res.data;
};
