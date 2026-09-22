export type Role = "ADMIN" | "CLIENT";

export type OrderStatus =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "EN_PREPARACION"
  | "EN_REPARTO"
  | "ENTREGADO";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDIENTE",
  "CONFIRMADO",
  "EN_PREPARACION",
  "EN_REPARTO",
  "ENTREGADO",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  EN_REPARTO: "En reparto",
  ENTREGADO: "Entregado",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as string[]).includes(value);
}

export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  basePrice: number;
  unit: string;
  active: boolean;
};

/** Producto ya resuelto para un cliente: precio propio o base. */
export type PortalProduct = Product & {
  price: number;
  hasCustomPrice: boolean;
};

export type Customer = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
};

export type CustomerPrice = {
  productId: string;
  price: number;
};

export type OrderItem = {
  id: string;
  productId: string | null;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
};

export type ProductInput = {
  name: string;
  categoryId: string | null;
  description: string | null;
  basePrice: number;
  unit: string;
  active: boolean;
};

export type CustomerInput = {
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
};

export type NewOrderLine = {
  productId: string;
  quantity: number;
};

export type Session = {
  mode: "demo" | "supabase";
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  organizationId: string;
  organizationName: string;
  customerId: string | null;
  customerName: string | null;
};
