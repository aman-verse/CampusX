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
  created_at: string
  picture?: string
  external_email_allowed?: boolean
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
}

//////////////////////////////////////////////////

// ================= MENU TYPES =================

export interface MenuItem {
  id: number
  name: string
  price: number
  canteen_id: number
}

//////////////////////////////////////////////////

// ================= ORDER TYPES =================

export type OrderStatus =
  | "placed"
  | "accepted"
  | "rejected"
  | "delivered"

export interface OrderItem {
  menu_item_id: number
  quantity: number
}

export interface Order {
  id: number
  status: OrderStatus
  created_at: string
  user_id: number
  canteen_id: number
  items: OrderItem[]
}

export interface CreateOrderPayload {
  canteen_id: number
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