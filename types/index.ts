import { Product, Category, CartItem, User } from "@prisma/client";

/**
 * Extended Product type with category included.
 * Used when fetching products with their category data.
 */
export type ProductWithCategory = Product & {
  category: Category;
};

/**
 * Cart item with full product details.
 * Used in cart page and cart store.
 */
export type CartItemWithProduct = CartItem & {
  product: ProductWithCategory;
};

/**
 * Safe user type (excludes password hash).
 * Used in client-side components and API responses.
 */
export type SafeUser = Omit<User, "password">;

/**
 * Product filter parameters for search/filtering.
 */
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}

/**
 * API response wrapper for consistent error handling.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Cart action types for the cart store.
 */
export type CartAction = 
  | { type: "ADD_ITEM"; payload: { productId: string; quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_ITEMS"; payload: CartItemWithProduct[] };
