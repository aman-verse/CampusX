// User types
export type UserRole = "student" | "vendor" | "admin"

export interface User {
  id: number
  name: string
  email: string
  password?: string | null
  role: UserRole
}

export interface AuthResponse {
  access_token: string
  user: User
}

// College types
export interface College {
  id: number
  name: string
  allowed_domains: string
  allow_external_emails: boolean
}

// Canteen types
export interface Canteen {
  id: number
  name: string
  college_id: number
  vendor_email: string
  vendor_phone: string
}

// Menu types
export interface MenuItem {
  id: number
  name: string
  price: number
  canteen_id: number
}

// Order types
export type OrderStatus = "placed" | "accepted" | "rejected" | "delivered"

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

// Cart types (client-side only)
export interface CartItem {
  menu_item_id: number
  name: string
  price: number
  quantity: number
  canteen_id: number
}
