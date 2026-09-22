import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Category,
  Customer,
  CustomerInput,
  Order,
  OrderItem,
  OrderStatus,
  Organization,
  PortalProduct,
  Product,
  ProductInput,
  Session,
} from "@/lib/types";
import type { DataStore } from "./store";

/**
 * Implementación Supabase (PostgreSQL + RLS).
 * La organización y el cliente se toman de la sesión autenticada:
 * ninguna consulta acepta un organization_id que venga del navegador.
 */

type Joined<T> = T | T[] | null;

/** PostgREST puede devolver una relación embebida como objeto o array. */
function joinedName(value: Joined<{ name: string }> | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0]?.name ?? null;
  return value.name;
}

type ProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  base_price: number | string;
  unit: string;
  active: boolean;
  categories: Joined<{ name: string }>;
};

type CustomerRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  total: number | string;
  notes: string | null;
  created_at: string;
  customers: Joined<{ name: string }>;
  order_items: {
    id: string;
    product_id: string | null;
    product_name: string;
    unit: string;
    quantity: number | string;
    unit_price: number | string;
    subtotal: number | string;
  }[];
};

const ORDER_SELECT =
  "id, order_number, customer_id, status, total, notes, created_at, customers(name), order_items(id, product_id, product_name, unit, quantity, unit_price, subtotal)";

const num = (value: number | string): number => Number(value);

function fail(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: joinedName(row.categories),
    name: row.name,
    description: row.description,
    basePrice: num(row.base_price),
    unit: row.unit,
    active: row.active,
  };
}

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    address: row.address,
    active: row.active,
  };
}

function mapOrder(row: OrderRow): Order {
  const items: OrderItem[] = (row.order_items ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    name: item.product_name,
    unit: item.unit,
    quantity: num(item.quantity),
    unitPrice: num(item.unit_price),
    subtotal: num(item.subtotal),
  }));

  return {
    id: row.id,
    number: row.order_number,
    customerId: row.customer_id,
    customerName: joinedName(row.customers) ?? "Cliente",
    status: row.status as OrderStatus,
    total: num(row.total),
    notes: row.notes,
    createdAt: row.created_at,
    items,
  };
}

export function createSupabaseStore(
  client: SupabaseClient,
  session: Session,
): DataStore {
  const orgId = session.organizationId;

  return {
    async getOrganization() {
      const { data, error } = await client
        .from("organizations")
        .select("id, name, slug")
        .eq("id", orgId)
        .maybeSingle<Organization>();
      fail(error, "No se pudo leer la organización");
      return data ?? null;
    },

    async listCategories() {
      const { data, error } = await client
        .from("categories")
        .select("id, name")
        .eq("organization_id", orgId)
        .order("sort_order", { ascending: true });
      fail(error, "No se pudieron leer las categorías");
      return (data ?? []) as Category[];
    },

    async listProducts(options) {
      let query = client
        .from("products")
        .select("id, category_id, name, description, base_price, unit, active, categories(name)")
        .eq("organization_id", orgId)
        .order("name", { ascending: true });

      if (options?.activeOnly) query = query.eq("active", true);

      const { data, error } = await query;
      fail(error, "No se pudieron leer los productos");
      return ((data ?? []) as ProductRow[]).map(mapProduct);
    },

    async createProduct(input: ProductInput) {
      const { error } = await client.from("products").insert({
        organization_id: orgId,
        category_id: input.categoryId,
        name: input.name,
        description: input.description,
        base_price: input.basePrice,
        unit: input.unit,
        active: input.active,
      });
      fail(error, "No se pudo crear el producto");
    },

    async updateProduct(id: string, input: ProductInput) {
      const { error } = await client
        .from("products")
        .update({
          category_id: input.categoryId,
          name: input.name,
          description: input.description,
          base_price: input.basePrice,
          unit: input.unit,
          active: input.active,
        })
        .eq("id", id)
        .eq("organization_id", orgId);
      fail(error, "No se pudo actualizar el producto");
    },

    async deleteProduct(id: string) {
      const { error } = await client
        .from("products")
        .delete()
        .eq("id", id)
        .eq("organization_id", orgId);
      fail(error, "No se pudo eliminar el producto");
    },

    async listCustomers() {
      const { data, error } = await client
        .from("customers")
        .select("id, name, company, email, phone, address, active")
        .eq("organization_id", orgId)
        .order("name", { ascending: true });
      fail(error, "No se pudieron leer los clientes");
      return ((data ?? []) as CustomerRow[]).map(mapCustomer);
    },

    async getCustomer(id: string) {
      const { data, error } = await client
        .from("customers")
        .select("id, name, company, email, phone, address, active")
        .eq("organization_id", orgId)
        .eq("id", id)
        .maybeSingle<CustomerRow>();
      fail(error, "No se pudo leer el cliente");
      return data ? mapCustomer(data) : null;
    },

    async createCustomer(input: CustomerInput) {
      const { data, error } = await client
        .from("customers")
        .insert({ organization_id: orgId, ...input })
        .select("id, name, company, email, phone, address, active")
        .single<CustomerRow>();
      fail(error, "No se pudo crear el cliente");
      return mapCustomer(data as CustomerRow);
    },

    async updateCustomer(id: string, input: CustomerInput) {
      const { error } = await client
        .from("customers")
        .update({ ...input })
        .eq("id", id)
        .eq("organization_id", orgId);
      fail(error, "No se pudo actualizar el cliente");
    },

    async listCustomerPrices(customerId: string) {
      const { data, error } = await client
        .from("customer_prices")
        .select("product_id, price")
        .eq("organization_id", orgId)
        .eq("customer_id", customerId);
      fail(error, "No se pudieron leer los precios del cliente");
      const rows = (data ?? []) as {
        product_id: string;
        price: number | string;
      }[];
      return rows.map((row) => ({
        productId: row.product_id,
        price: num(row.price),
      }));
    },

    async listPortalProducts(customerId: string) {
      const products = await this.listProducts({ activeOnly: true });
      const prices = await this.listCustomerPrices(customerId);

      return products.map<PortalProduct>((product) => {
        const override = prices.find((row) => row.productId === product.id);
        return {
          ...product,
          price: override ? override.price : product.basePrice,
          hasCustomPrice: Boolean(override),
        };
      });
    },

    async setCustomerPrice(
      customerId: string,
      productId: string,
      price: number | null,
    ) {
      if (price === null) {
        const { error } = await client
          .from("customer_prices")
          .delete()
          .eq("organization_id", orgId)
          .eq("customer_id", customerId)
          .eq("product_id", productId);
        fail(error, "No se pudo quitar el precio especial");
        return;
      }

      const { error } = await client.from("customer_prices").upsert(
        {
          organization_id: orgId,
          customer_id: customerId,
          product_id: productId,
          price,
        },
        { onConflict: "customer_id,product_id" },
      );
      fail(error, "No se pudo guardar el precio especial");
    },

    async listOrders(options) {
      let query = client
        .from("orders")
        .select(ORDER_SELECT)
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (options?.customerId) {
        query = query.eq("customer_id", options.customerId);
      }

      const { data, error } = await query;
      fail(error, "No se pudieron leer los pedidos");
      return ((data ?? []) as unknown as OrderRow[]).map(mapOrder);
    },

    async getOrder(id: string) {
      const { data, error } = await client
        .from("orders")
        .select(ORDER_SELECT)
        .eq("organization_id", orgId)
        .eq("id", id)
        .maybeSingle();
      fail(error, "No se pudo leer el pedido");
      return data ? mapOrder(data as unknown as OrderRow) : null;
    },

    async createOrder(input) {
      const productIds = input.lines.map((line) => line.productId);

      // Los precios SIEMPRE se resuelven en el servidor (nunca los manda el cliente)
      const { data: productRows, error: productsError } = await client
        .from("products")
        .select("id, name, unit, base_price, active")
        .eq("organization_id", orgId)
        .in("id", productIds);
      fail(productsError, "No se pudieron validar los productos");

      const prices = await this.listCustomerPrices(input.customerId);

      const items = input.lines.map((line) => {
        const product = (
          (productRows ?? []) as {
            id: string;
            name: string;
            unit: string;
            base_price: number | string;
          }[]
        ).find((row) => row.id === line.productId);
        if (!product) throw new Error("Producto inexistente en el pedido");

        const override = prices.find((row) => row.productId === line.productId);
        const unitPrice = override ? override.price : num(product.base_price);
        const quantity = Math.max(1, Math.trunc(line.quantity));

        return {
          product_id: product.id,
          product_name: product.name,
          unit: product.unit,
          quantity,
          unit_price: unitPrice,
          subtotal: unitPrice * quantity,
        };
      });

      const total = items.reduce((acc, item) => acc + item.subtotal, 0);

      const { data: orderRow, error: orderError } = await client
        .from("orders")
        .insert({
          organization_id: orgId,
          customer_id: input.customerId,
          status: "PENDIENTE",
          total,
          notes: input.notes ?? null,
        })
        .select(ORDER_SELECT)
        .single();
      fail(orderError, "No se pudo crear el pedido");

      const orderId = (orderRow as unknown as OrderRow).id;
      const { error: itemsError } = await client.from("order_items").insert(
        items.map((item) => ({
          organization_id: orgId,
          order_id: orderId,
          ...item,
        })),
      );
      fail(itemsError, "No se pudieron guardar los ítems del pedido");

      return mapOrder(orderRow as unknown as OrderRow);
    },

    async updateOrderStatus(id: string, status: OrderStatus) {
      const { error } = await client
        .from("orders")
        .update({ status })
        .eq("id", id)
        .eq("organization_id", orgId);
      fail(error, "No se pudo actualizar el estado del pedido");
    },
  };
}


