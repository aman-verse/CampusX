import { api } from "./axios";
import type{ VendorOrder } from "../types/vendorOrder";

export const getVendorOrders = async (): Promise<VendorOrder[]> => {
    const res = await api.get("/orders/vendor");
    return res.data;
};

export const acceptOrder = async (orderId: number) => {
    await api.patch(`/orders/vendor/${orderId}/accept`);
};

export const rejectOrder = async (orderId: number) => {
    await api.patch(`/orders/vendor/${orderId}/reject`);
};
