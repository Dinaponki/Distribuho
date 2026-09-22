import type {
  Category,
  Customer,
  CustomerInput,
  CustomerPrice,
  NewOrderLine,
  Order,
  OrderStatus,
  Organization,
  PortalProduct,
  Product,
  ProductInput,
} from "@/lib/types";

/**
 * Contrato único de acceso a datos.
 * Implementaciones: `demo-store.ts` (local) y `supabase-store.ts` (RLS).
 * La organización activa se resuelve desde la sesión, nunca desde el cliente.
 */
export interface DataStore {
  getOrganization(): Promise<Organization | null>;

  listCategories(): Promise<Category[]>;

  /** activeOnly = true → catálogo visible para el cliente final. */
  listProducts(options?: { activeOnly?: boolean }): Promise<Product[]>;
  createProduct(input: ProductInput): Promise<void>;
  updateProduct(id: string, input: ProductInput): Promise<void>;
  deleteProduct(id: string): Promise<void>;

  listCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | null>;
  createCustomer(input: CustomerInput): Promise<Customer>;
  updateCustomer(id: string, input: CustomerInput): Promise<void>;

  listCustomerPrices(customerId: string): Promise<CustomerPrice[]>;
  /** price = null → elimina el precio propio y vuelve al precio base. */
  setCustomerPrice(
    customerId: string,
    productId: string,
    price: number | null,
  ): Promise<void>;

  /** Productos con el precio que le corresponde a ese cliente. */
  listPortalProducts(customerId: string): Promise<PortalProduct[]>;

  listOrders(options?: { customerId?: string }): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  createOrder(input: {
    customerId: string;
    lines: NewOrderLine[];
    notes?: string | null;
  }): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
}

export type CreateOrderInput = Parameters<DataStore["createOrder"]>[0];
