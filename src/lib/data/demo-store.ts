import fs from "node:fs";
import path from "node:path";
import { createDemoDB, type DemoDB } from "@/lib/demo/data";
import type {
  Customer,
  CustomerInput,
  PortalProduct,
  Product,
  ProductInput,
} from "@/lib/types";
import type { DataStore } from "./store";

/**
 * MODO DEMO (sin Supabase): base de datos local en `.demo-data/db.json`.
 * Mantiene la misma forma de datos que el esquema SQL, así el paso a
 * Supabase sólo requiere definir las variables de entorno.
 */
const DATA_DIR = path.join(process.cwd(), ".demo-data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

type Cache = { __distribuidoraDemoDB?: DemoDB };
const cache = globalThis as unknown as Cache;

function persist(): void {
  const db = cache.__distribuidoraDemoDB;
  if (!db) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // Filesystem de sólo lectura (ej. Vercel): la demo sigue en memoria.
  }
}

function load(): DemoDB {
  if (cache.__distribuidoraDemoDB) return cache.__distribuidoraDemoDB;

  let db: DemoDB;
  try {
    db = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as DemoDB;
  } catch {
    db = createDemoDB();
  }
  cache.__distribuidoraDemoDB = db;
  persist();
  return db;
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function resolvePrice(db: DemoDB, customerId: string, product: Product) {
  const override = db.customerPrices.find(
    (row) => row.customerId === customerId && row.productId === product.id,
  );
  return {
    price: override ? override.price : product.basePrice,
    hasCustomPrice: Boolean(override),
  };
}

export function createDemoStore(): DataStore {
  const db = load();

  return {
    async getOrganization() {
      return { ...db.organization };
    },

    async listCategories() {
      return db.categories.map((category) => ({ ...category }));
    },

    async listProducts(options) {
      return db.products
        .filter((product) => (options?.activeOnly ? product.active : true))
        .map((product) => ({ ...product }));
    },

    async createProduct(input: ProductInput) {
      db.products.unshift({
        id: newId("prod"),
        categoryId: input.categoryId,
        categoryName:
          db.categories.find((c) => c.id === input.categoryId)?.name ?? null,
        name: input.name,
        description: input.description,
        basePrice: input.basePrice,
        unit: input.unit,
        active: input.active,
      });
      persist();
    },

    async updateProduct(id: string, input: ProductInput) {
      const product = db.products.find((p) => p.id === id);
      if (!product) return;
      product.name = input.name;
      product.categoryId = input.categoryId;
      product.categoryName =
        db.categories.find((c) => c.id === input.categoryId)?.name ?? null;
      product.description = input.description;
      product.basePrice = input.basePrice;
      product.unit = input.unit;
      product.active = input.active;
      persist();
    },

    async deleteProduct(id: string) {
      db.products = db.products.filter((p) => p.id !== id);
      db.customerPrices = db.customerPrices.filter((p) => p.productId !== id);
      persist();
    },

    async listCustomers() {
      return db.customers.map((customer) => ({ ...customer }));
    },

    async getCustomer(id: string) {
      const customer = db.customers.find((c) => c.id === id);
      return customer ? { ...customer } : null;
    },

    async createCustomer(input: CustomerInput) {
      const customer: Customer = { id: newId("cus"), ...input };
      db.customers.push(customer);
      persist();
      return { ...customer };
    },

    async updateCustomer(id: string, input: CustomerInput) {
      const customer = db.customers.find((c) => c.id === id);
      if (!customer) return;
      Object.assign(customer, input);
      persist();
    },

    async listCustomerPrices(customerId: string) {
      return db.customerPrices
        .filter((row) => row.customerId === customerId)
        .map((row) => ({ productId: row.productId, price: row.price }));
    },

    async setCustomerPrice(
      customerId: string,
      productId: string,
      price: number | null,
    ) {
      const rows = db.customerPrices.filter(
        (row) => !(row.customerId === customerId && row.productId === productId),
      );
      if (price !== null) rows.push({ customerId, productId, price });
      db.customerPrices = rows;
      persist();
    },

    async listPortalProducts(customerId: string) {
      const products: PortalProduct[] = db.products
        .filter((product) => product.active)
        .map((product) => ({
          ...product,
          ...resolvePrice(db, customerId, product),
        }));
      return products;
    },

    async listOrders(options) {
      return db.orders
        .filter((order) =>
          options?.customerId ? order.customerId === options.customerId : true,
        )
        .map((order) => ({
          ...order,
          items: order.items.map((item) => ({ ...item })),
        }));
    },

    async getOrder(id: string) {
      const order = db.orders.find((o) => o.id === id);
      if (!order) return null;
      return { ...order, items: order.items.map((item) => ({ ...item })) };
    },

    async createOrder(input) {
      const number = `PED-${db.nextOrderNumber}`;
      db.nextOrderNumber += 1;

      const items = input.lines.map((line) => {
        const product = db.products.find((p) => p.id === line.productId);
        if (!product) throw new Error("Producto inexistente");
        const { price } = resolvePrice(db, input.customerId, product);
        return {
          id: newId("oi"),
          productId: product.id,
          name: product.name,
          unit: product.unit,
          quantity: line.quantity,
          unitPrice: price,
          subtotal: price * line.quantity,
        };
      });

      const total = items.reduce((acc, item) => acc + item.subtotal, 0);
      const order = {
        id: newId("order"),
        number,
        customerId: input.customerId,
        customerName:
          db.customers.find((c) => c.id === input.customerId)?.name ??
          "Cliente",
        status: "PENDIENTE" as const,
        total,
        notes: input.notes ?? null,
        createdAt: new Date().toISOString(),
        items,
      };

      db.orders.unshift(order);
      persist();
      return order;
    },

    async updateOrderStatus(id, status) {
      const order = db.orders.find((o) => o.id === id);
      if (!order) return;
      order.status = status;
      persist();
    },
  };
}
