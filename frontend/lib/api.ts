import type {
  User,
  AuthResponse,
  College,
  Canteen,
  MenuItem,
  Order,
  CreateOrderPayload,
  UserRole,
  Vendor
} from "./types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://campusx-43j7.onrender.com"

class ApiClient {

  private token: string | null = null

  //////////////////////////////////////////////////
  // TOKEN
  //////////////////////////////////////////////////

  setToken(token: string | null) {
    this.token = token

    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("access_token", token)
      } else {
        localStorage.removeItem("access_token")
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token

    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token")
    }

    return null
  }

  //////////////////////////////////////////////////
  // CORE REQUEST
  //////////////////////////////////////////////////

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {

    const token =
      this.getToken() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null)

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers
    }

    if (token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)

      const message =
        typeof errorData?.detail === "string"
          ? errorData.detail
          : typeof errorData?.error === "string"
            ? errorData.error
            : JSON.stringify(errorData)

      throw new Error(message || "Request failed")
    }

    return response.json()
  }

  //////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////

  async googleLogin(
    idToken: string,
    collegeId: number
  ): Promise<AuthResponse> {

    return this.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        id_token: idToken,
        college_id: collegeId
      })
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/users/me")
  }

  logout() {
    this.setToken(null)

    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("selected_college_id")
      localStorage.removeItem("selected_canteen_id")
    }
  }

  //////////////////////////////////////////////////
  // COLLEGES
  //////////////////////////////////////////////////

  async getColleges(): Promise<College[]> {
    return this.request<College[]>("/colleges/")
  }

  //////////////////////////////////////////////////
  // CANTEENS
  //////////////////////////////////////////////////

  async getAllCanteens(): Promise<Canteen[]> {
    return this.request<Canteen[]>("/canteens/")
  }

  async getCanteensByCollege(
    collegeId: number
  ): Promise<Canteen[]> {

    return this.request<Canteen[]>(
      `/canteens/college/${collegeId}`
    )
  }

  //////////////////////////////////////////////////
  // MENU
  //////////////////////////////////////////////////

  async getMenuByCanteen(
    canteenId: number
  ): Promise<MenuItem[]> {

    return this.request<MenuItem[]>(`/menu/${canteenId}`)
  }

  //////////////////////////////////////////////////
  // STUDENT ORDERS
  //////////////////////////////////////////////////

  async createOrder(
    payload: CreateOrderPayload
  ): Promise<{ order_id: number; status: string; whatsapp_url?: string }> {

    return this.request<{ order_id: number; status: string; whatsapp_url?: string }>("/orders/", {
      method: "POST",
      body: JSON.stringify(payload)
    })
  }

  async getMyOrders(): Promise<Order[]> {
    return this.request<Order[]>("/orders/my")
  }

  async rejectOrder(id: number) {
    return this.request(`/orders/vendor/${id}/reject`, {
      method: "PATCH"
    })
  }

  async deleteMenuItem(id: number) {
    return this.request(`/menu/${id}`, {
      method: "DELETE"
    })
  }
  //////////////////////////////////////////////////
  // VENDOR
  //////////////////////////////////////////////////

  async getVendorOrders(): Promise<Order[]> {
    return this.request<Order[]>("/orders/vendor")
  }

  async acceptOrder(orderId: number): Promise<Order> {
    return this.request<Order>(
      `/orders/vendor/${orderId}/accept`,
      { method: "PATCH" }
    )
  }

  async getVendorOrderHistory(): Promise<Order[]> {
    return this.request("/orders/vendor/history")
  }

  async getVendorCanteen(): Promise<Canteen> {
    return this.request("/canteens/vendor")
  }

  //////////////////////////////////////////////////
  // DELIVERY
  //////////////////////////////////////////////////

  async markOrderDelivered(orderId: number): Promise<Order> {
    return this.request<Order>(
      `/orders/delivery/${orderId}/deliver`,
      { method: "PATCH" }
    )
  }

  //////////////////////////////////////////////////
  // ADMIN
  //////////////////////////////////////////////////

  async getAllOrders(): Promise<Order[]> {
    return this.request<Order[]>("/admin/orders")
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>("/admin/users")
  }

  async getAdminCanteens(): Promise<Canteen[]> {
    return this.request<Canteen[]>("/admin/canteens")
  }

  async updateUserRole(
    email: string,
    role: UserRole
  ): Promise<User> {

    return this.request<User>("/admin/users/role", {
      method: "PATCH",
      body: JSON.stringify({
        email,
        role
      })
    })
  }

  async allowExternalEmail(
    email: string,
    allowed: boolean
  ) {

    return this.request("/admin/users/external-email", {
      method: "PATCH",
      body: JSON.stringify({
        email,
        allowed
      })
    })
  }

  //////////////////////////////////////////////////
  // VENDORS
  //////////////////////////////////////////////////

  async getVendors(): Promise<Vendor[]> {
    return this.request<Vendor[]>("/vendors")
  }

  async createVendor(data: Partial<Vendor>): Promise<Vendor> {
    return this.request<Vendor>("/vendors", {
      method: "POST",
      body: JSON.stringify(data)
    })
  }

  async deleteVendor(vendorId: number) {
    return this.request(`/vendors/${vendorId}`, {
      method: "DELETE"
    })
  }

  //////////////////////////////////////////////////
  // SUPERADMIN
  //////////////////////////////////////////////////

  async getAdmins(): Promise<User[]> {
    return this.request<User[]>("/superadmin/admins")
  }

  async getSuperadminColleges(): Promise<College[]> {
    return this.request<College[]>("/superadmin/colleges")
  }
  async updatesuperadmin(email: string, role: string, external_email_allowed: boolean): Promise<User> {
    return this.request("/superadmin/users/role", {
      method: "POST",
      body: JSON.stringify({ email, role, external_email_allowed }),
    })
  }

  async createsuperadminCollege(data: {
    name: string
    allowed_domains: string
    allow_external_emails: boolean
  }) {
    return this.request("/superadmin/colleges", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteUser(userId: number) {
    return this.request(`/superadmin/users/${userId}`, {
      method: "DELETE",
    })
  }

}

export const api = new ApiClient()