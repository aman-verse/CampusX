import { api } from "./axios";
import type{ MenuItem } from "../types/menu";

export const getMenu = async (
  canteenId: number
): Promise<MenuItem[]> => {
  const res = await api.get(`/menu/${canteenId}`);
  return res.data;
};
