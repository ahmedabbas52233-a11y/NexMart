export interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string | number;
    images?: string[];
    slug?: string;
    category?: {
      name: string;
    };
    stock?: number;
  };
}