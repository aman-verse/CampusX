import { api } from "./axios";

export interface Canteen {
    id: number;
    name: string;
    college_id: number;
    vendor_phone: string;
}

export const getCanteens = async (
    collegeId: number
): Promise<Canteen[]> => {
    const res = await api.get(`/canteens/${collegeId}`);
    return res.data;
};
