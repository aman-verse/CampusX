import type {
  User,
  AuthResponse,
  College,
  Canteen,
  MenuItem,
  Order,
  CreateOrderPayload,
} from "./types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://campusx-43j7.onrender.com"

class ApiClient {
  private token: string | null = null

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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
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

  // Auth endpoints
  async googleLogin(idToken: string, collegeId: number): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        id_token: idToken,   // ✅ FIXED
        college_id: collegeId,
      }),
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

  // College endpoints
  async getColleges(): Promise<College[]> {
    return this.request<College[]>("/colleges/")
  }

  // Canteen endpoints
  async getCanteensByCollege(collegeId: number): Promise<Canteen[]> {
    return this.request<Canteen[]>(`/canteens/college/${collegeId}`)
  }


  // Menu endpoints
  async getMenuByCanteen(canteenId: number): Promise<MenuItem[]> {
    return this.request<MenuItem[]>(`/menu/${canteenId}`)
  }

  // Order endpoints
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    return this.request<Order>("/orders/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async getMyOrders(): Promise<Order[]> {
    return this.request<Order[]>("/orders/my")
  }

  async getOrderById(orderId: number): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}`)
  }

  // Vendor endpoints
  async getVendorOrders(): Promise<Order[]> {
    return this.request<Order[]>("/orders/vendor")
  }

  async acceptOrder(orderId: number): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/accept`, {
      method: "PUT",
    })
  }

  async rejectOrder(orderId: number): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/reject`, {
      method: "PUT",
    })
  }

  async markOrderDelivered(orderId: number): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/deliver`, {
      method: "PUT",
    })
  }

  // Admin endpoints
  async getAllOrders(): Promise<Order[]> {
    return this.request<Order[]>("/orders/")
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>("/users/")
  }
}

export const api = new ApiClient()
