import { api } from "./axios";
import type{ College } from "../types/college";

export const getColleges = async (): Promise<College[]> => {
    const res = await api.get("/colleges/");
    return res.data;
};
