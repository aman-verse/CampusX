// ================= USER TYPES =================

export type UserRole =
  | "student"
  | "vendor"
  | "admin"
  | "superadmin"
  | "delivery"

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  phone?: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

//////////////////////////////////////////////////

// ================= COLLEGE TYPES =================

export interface College {
  id: number
  name: string
  allowed_domains: string
  allow_external_emails: boolean
}

//////////////////////////////////////////////////

// ================= VENDOR TYPES =================

export interface Vendor {
  id: number
  name: string
  description: string
  location: string
  image_url?: string
  rating: number
  is_open: boolean
}

//////////////////////////////////////////////////

// ================= CANTEEN TYPES =================

export interface Canteen {
  id: number
  name: string
  college_id: number
  vendor_email: string
  vendor_phone: string
  image_url?: string
  rating?: number
  status?: "open" | "closed" | "busy"
}

//////////////////////////////////////////////////

// ================= MENU TYPES =================

export interface MenuItem {
  id: number
  name: string
  price: number
  canteen_id: number
  image_url?: string
}

//////////////////////////////////////////////////

// ================= ORDER TYPES =================

export type OrderStatus =
  | "placed"
  | "accepted"
  | "rejected"
  | "delivered"

export interface OrderItem {
  quantity: number
  menu_item: {
    id: number
    name: string
    price: number
  }
}

export interface Order {
  id: number
  token: number
  status: OrderStatus
  created_at: string
  user_id: number
  canteen: {
    id: number
    name: string
  }
  phone: string
  address: string
  total_amount: number
  items: OrderItem[]
}


export interface CreateOrderPayload {
  canteen_id: number
  phone: string
  address: string
  items: OrderItem[]
}

//////////////////////////////////////////////////

// ================= CART TYPES =================

export interface CartItem {
  menu_item_id: number
  name: string
  price: number
  quantity: number
  canteen_id: number
}