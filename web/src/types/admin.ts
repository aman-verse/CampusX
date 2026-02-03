export interface CreateCanteenPayload {
    name: string;
    college_id: number;
    vendor_phone: string;
}

export interface AssignVendorPayload {
    user_id: number;
    canteen_id: number;
}
