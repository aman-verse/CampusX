import { api } from "./axios";
import type{ DeliveryOrder } from "../types/deliveryOrder";

export const getAcceptedOrders = async (): Promise<DeliveryOrder[]> => {
    const res = await api.get("/orders/delivery");
    return res.data;
};

export const markDelivered = async (orderId: number) => {
    await api.patch(`/orders/delivery/${orderId}/deliver`);
};
