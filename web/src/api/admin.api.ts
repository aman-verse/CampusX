import { api } from "./axios";
import type{ CreateCanteenPayload, AssignVendorPayload } from "../types/admin";
import type{ College } from "../types/college";
import type{ Canteen } from "../types/canteen";
import type{ User } from "../types/user";

export const getColleges = async (): Promise<College[]> => {
    const res = await api.get("/colleges/");
    return res.data;
};

export const getCanteensByCollege = async (
    collegeId: number
): Promise<Canteen[]> => {
    const res = await api.get(`/canteens/${collegeId}`);
    return res.data;
};

export const createCanteen = async (
    payload: CreateCanteenPayload
) => {
    await api.post("/admin/canteens", payload);
};

export const assignVendor = async (
    payload: AssignVendorPayload
) => {
    await api.post("/admin/assign-vendor", payload);
};

export const getVendors = async (): Promise<User[]> => {
    const res = await api.get("/admin/vendors");
    return res.data;
};