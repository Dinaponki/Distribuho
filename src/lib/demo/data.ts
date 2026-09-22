import type {
  Category,
  Customer,
  Order,
  OrderItem,
  Organization,
  Product,
} from "@/lib/types";

export type CustomerPriceRow = {
  customerId: string;
  productId: string;
  price: number;
};

export type DemoDB = {
  organization: Organization;
  categories: Category[];
  products: Product[];
  customers: Customer[];
  customerPrices: CustomerPriceRow[];
  orders: Order[];
  nextOrderNumber: number;
};

export const DEMO_USERS = {
  admin: {
    id: "user-admin",
    email: "admin@distribuidora.com",
    fullName: "Sofía Administradora",
    customerId: null as string | null,
  },
  client: {
    id: "user-client",
    customerId: "cus-almacen" as string | null,
    email: "cliente@almacencentral.com",
    fullName: "Martín Almacén Central",
  },
} as const;

export const ORGANIZATION: Organization = {
  id: "org-central",
  name: "Distribuidora Central",
  slug: "distribuidora-central",
};

export const CATEGORIES: Category[] = [
  { id: "cat-bebidas", name: "Bebidas" },
  { id: "cat-aguas", name: "Aguas" },
  { id: "cat-cervezas", name: "Cervezas" },
  { id: "cat-almacen", name: "Almacén" },
  { id: "cat-limpieza", name: "Limpieza" },
];

type ProductRow = [
  id: string,
  categoryId: string,
  name: string,
  description: string,
  basePrice: number,
  unit: string,
];

const PRODUCT_ROWS: ProductRow[] = [
  ["prod-01", "cat-bebidas", "Coca-Cola 2.25L", "Botella PET 2.25 litros", 4850, "unidad"],
  ["prod-02", "cat-bebidas", "Coca-Cola 1.5L", "Botella PET 1.5 litros", 3950, "unidad"],
  ["prod-03", "cat-bebidas", "Sprite 2.25L", "Botella PET 2.25 litros", 4350, "unidad"],
  ["prod-04", "cat-bebidas", "Fanta Naranja 2.25L", "Botella PET 2.25 litros", 4350, "unidad"],
  ["prod-05", "cat-bebidas", "Coca-Cola Zero 2.25L", "Botella PET 2.25 litros", 4850, "unidad"],
  ["prod-06", "cat-bebidas", "Paso de los Toros Pomelo 1.5L", "Botella PET 1.5 litros", 3200, "unidad"],
  ["prod-07", "cat-aguas", "Agua Mineral Sin Gas 1.5L x6", "Pack de 6 botellas", 6300, "pack"],
  ["prod-08", "cat-aguas", "Agua Mineral Con Gas 1.5L x6", "Pack de 6 botellas", 6300, "pack"],
  ["prod-09", "cat-aguas", "Agua Mineral 500ml x12", "Pack de 12 botellas", 7800, "pack"],
  ["prod-10", "cat-aguas", "Villa del Sur 2.25L", "Botella PET 2.25 litros", 2900, "unidad"],
  ["prod-11", "cat-cervezas", "Cerveza Quilmes 1L x24", "Caja de 24 botellas", 32800, "caja"],
  ["prod-12", "cat-cervezas", "Cerveza Brahma 1L x24", "Caja de 24 botellas", 29600, "caja"],
  ["prod-13", "cat-cervezas", "Cerveza Stella Artois 1L x24", "Caja de 24 botellas", 41500, "caja"],
  ["prod-14", "cat-cervezas", "Cerveza Corona 710ml x24", "Caja de 24 botellas", 38600, "caja"],
  ["prod-15", "cat-almacen", "Yerba Mate Playadito 1kg", "Paquete de 1 kilo", 5600, "unidad"],
  ["prod-16", "cat-almacen", "Yerba Mate Rosamonte 1kg", "Paquete de 1 kilo", 5900, "unidad"],
  ["prod-17", "cat-almacen", "Azúcar Ledesma 1kg", "Paquete de 1 kilo", 1850, "unidad"],
  ["prod-18", "cat-almacen", "Harina 000 1kg", "Paquete de 1 kilo", 1500, "unidad"],
  ["prod-19", "cat-almacen", "Fideos Matarazzo 500g", "Paquete de 500 gramos", 1750, "unidad"],
  ["prod-20", "cat-almacen", "Aceite de Girasol 1.5L", "Botella 1.5 litros", 4200, "unidad"],
  ["prod-21", "cat-limpieza", "Detergente Magistral 750ml", "Envase 750 ml", 2450, "unidad"],
  ["prod-22", "cat-limpieza", "Lavandina Ayudín 1L", "Envase 1 litro", 1900, "unidad"],
  ["prod-23", "cat-limpieza", "Rollo de Cocina x3", "Pack de 3 rollos", 3100, "pack"],
  ["prod-24", "cat-limpieza", "Papel Higiénico x4", "Pack de 4 rollos", 3300, "pack"],
  ["prod-25", "cat-limpieza", "Jabón Líquido Ala 500ml", "Envase 500 ml", 2750, "unidad"],
];

export const PRODUCTS: Product[] = PRODUCT_ROWS.map(
  ([id, categoryId, name, description, basePrice, unit]) => ({
    id,
    categoryId,
    categoryName: CATEGORIES.find((c) => c.id === categoryId)?.name ?? null,
    name,
    description,
    basePrice,
    unit,
    active: true,
  }),
);

export const CUSTOMERS: Customer[] = [
  {
    id: "cus-almacen",
    name: "Almacén Central",
    company: "Almacén Central SRL",
    email: "compras@almacencentral.com",
    phone: "+54 11 4555-1200",
    address: "Av. Rivadavia 4520, CABA",
    active: true,
  },
  {
    id: "cus-elsol",
    name: "Kiosco El Sol",
    company: "El Sol Kiosco",
    email: "elsol@gmail.com",
    phone: "+54 11 4666-7788",
    address: "Av. Mitre 1220, Lanús",
    active: true,
  },
  {
    id: "cus-norte",
    name: "Supermercado Norte",
    company: "Norte Supermercados SA",
    email: "pedidos@supernorte.com.ar",
    phone: "+54 11 4777-9010",
    address: "Ruta 8 km 24, San Miguel",
    active: true,
  },
];

export const CUSTOMER_PRICES: CustomerPriceRow[] = [
  { customerId: "cus-almacen", productId: "prod-01", price: 4550 },
  { customerId: "cus-almacen", productId: "prod-02", price: 3700 },
  { customerId: "cus-almacen", productId: "prod-07", price: 5900 },
  { customerId: "cus-almacen", productId: "prod-11", price: 30500 },
  { customerId: "cus-almacen", productId: "prod-15", price: 5200 },
  { customerId: "cus-almacen", productId: "prod-17", price: 1700 },
  { customerId: "cus-almacen", productId: "prod-21", price: 2300 },
  { customerId: "cus-norte", productId: "prod-01", price: 4600 },
  { customerId: "cus-norte", productId: "prod-12", price: 27900 },
];

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function buildItem(
  id: string,
  productId: string,
  quantity: number,
  unitPrice: number,
): OrderItem {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) throw new Error(`Producto demo inexistente: ${productId}`);
  return {
    id,
    productId,
    name: product.name,
    unit: product.unit,
    quantity,
    unitPrice,
    subtotal: quantity * unitPrice,
  };
}

function buildOrder(order: Omit<Order, "total">): Order {
  return {
    ...order,
    total: order.items.reduce((acc, item) => acc + item.subtotal, 0),
  };
}

export const ORDERS: Order[] = [
  buildOrder({
    id: "order-1",
    number: "PED-1001",
    customerId: "cus-almacen",
    customerName: "Almacén Central",
    status: "PENDIENTE",
    notes: "Entregar antes de las 12",
    createdAt: hoursAgo(2),
    items: [
      buildItem("oi-01", "prod-01", 12, 4550),
      buildItem("oi-02", "prod-11", 2, 30500),
      buildItem("oi-03", "prod-15", 10, 5200),
    ],
  }),
  buildOrder({
    id: "order-2",
    number: "PED-1002",
    customerId: "cus-almacen",
    customerName: "Almacén Central",
    status: "ENTREGADO",
    notes: null,
    createdAt: hoursAgo(24 * 3),
    items: [
      buildItem("oi-04", "prod-07", 4, 5900),
      buildItem("oi-05", "prod-17", 12, 1700),
      buildItem("oi-06", "prod-21", 6, 2300),
    ],
  }),
  buildOrder({
    id: "order-3",
    number: "PED-1003",
    customerId: "cus-elsol",
    customerName: "Kiosco El Sol",
    status: "EN_REPARTO",
    notes: "Tocar timbre del depósito",
    createdAt: hoursAgo(24),
    items: [
      buildItem("oi-07", "prod-02", 12, 3950),
      buildItem("oi-08", "prod-03", 6, 4350),
    ],
  }),
  buildOrder({
    id: "order-4",
    number: "PED-1004",
    customerId: "cus-norte",
    customerName: "Supermercado Norte",
    status: "CONFIRMADO",
    notes: null,
    createdAt: hoursAgo(5),
    items: [
      buildItem("oi-09", "prod-12", 3, 27900),
      buildItem("oi-10", "prod-24", 10, 3300),
    ],
  }),
];

export function createDemoDB(): DemoDB {
  return {
    organization: { ...ORGANIZATION },
    categories: CATEGORIES.map((c) => ({ ...c })),
    products: PRODUCTS.map((p) => ({ ...p })),
    customers: CUSTOMERS.map((c) => ({ ...c })),
    customerPrices: CUSTOMER_PRICES.map((p) => ({ ...p })),
    orders: ORDERS.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })) })),
    nextOrderNumber: 1005,
  };
}

