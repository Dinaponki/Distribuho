"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type CartProduct = {
  id: string;
  name: string;
  unit: string;
  price: number;
};

export type CartLine = CartProduct & {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  online: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (product: CartProduct) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
  quantityOf: (productId: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

const MAX_QUANTITY = 9999;
const EMPTY_LINES: CartLine[] = [];

const noopSubscribe = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;
const isOnline = () => navigator.onLine;

function clampQuantity(value: unknown): number {
  const quantity = Math.trunc(Number(value));
  if (!Number.isFinite(quantity) || quantity < 1) return 1;
  return Math.min(MAX_QUANTITY, quantity);
}

function parseLines(raw: string | null): CartLine[] {
  if (!raw) return EMPTY_LINES;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_LINES;

    const lines = parsed.flatMap<CartLine>((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const stored = entry as Partial<CartLine>;
      if (typeof stored.productId !== "string" || typeof stored.name !== "string") {
        return [];
      }
      return [
        {
          id: stored.productId,
          productId: stored.productId,
          name: stored.name,
          unit: typeof stored.unit === "string" ? stored.unit : "unidad",
          price: Number(stored.price) || 0,
          quantity: clampQuantity(stored.quantity),
        },
      ];
    });

    return lines.length > 0 ? lines : EMPTY_LINES;
  } catch {
    return EMPTY_LINES;
  }
}

/**
 * Carrito persistido en localStorage, modelado como store externo
 * (useSyncExternalStore): se restaura sin romper la hidratación y sin
 * sincronización offline compleja.
 */
type CartStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => CartLine[];
  getServerSnapshot: () => CartLine[];
  add: (product: CartProduct) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  reconcile: (catalog: CartProduct[]) => void;
};

function createCartStore(key: string): CartStore {
  let lines: CartLine[] = EMPTY_LINES;
  let loaded = false;
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const persist = () => {
    try {
      window.localStorage.setItem(key, JSON.stringify(lines));
    } catch {
      // Sin persistencia (modo privado): el carrito vive en memoria
    }
  };

  const update = (next: CartLine[]) => {
    lines = next;
    persist();
    emit();
  };

  const ensureLoaded = () => {
    if (loaded) return;
    loaded = true;
    try {
      lines = parseLines(window.localStorage.getItem(key));
    } catch {
      lines = EMPTY_LINES;
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
      if (event.key !== key) return;
      lines = parseLines(event.newValue);
      loaded = true;
      emit();
    });
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      ensureLoaded();
      return lines;
    },
    getServerSnapshot: () => EMPTY_LINES,

    add(product) {
      ensureLoaded();
      const existing = lines.find((line) => line.productId === product.id);
      if (existing) {
        update(
          lines.map((line) =>
            line.productId === product.id
              ? { ...line, quantity: clampQuantity(line.quantity + 1) }
              : line,
          ),
        );
        return;
      }
      update([...lines, { ...product, productId: product.id, quantity: 1 }]);
    },

    setQuantity(productId, quantity) {
      ensureLoaded();
      if (quantity < 1) {
        update(lines.filter((line) => line.productId !== productId));
        return;
      }
      update(
        lines.map((line) =>
          line.productId === productId
            ? { ...line, quantity: clampQuantity(quantity) }
            : line,
        ),
      );
    },

    remove(productId) {
      ensureLoaded();
      update(lines.filter((line) => line.productId !== productId));
    },

    clear() {
      loaded = true;
      update(EMPTY_LINES);
    },

    /** Descarta productos dados de baja y refresca los precios vigentes. */
    reconcile(catalog) {
      ensureLoaded();
      const byId = new Map(catalog.map((product) => [product.id, product]));
      let changed = false;

      const next = lines.flatMap<CartLine>((line) => {
        const product = byId.get(line.productId);
        if (!product) {
          changed = true;
          return [];
        }
        if (
          product.price !== line.price ||
          product.name !== line.name ||
          product.unit !== line.unit
        ) {
          changed = true;
          return [{ ...product, productId: product.id, quantity: line.quantity }];
        }
        return [line];
      });

      if (changed) update(next);
    },
  };
}

function subscribeOnline(listener: () => void) {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}

export function CartProvider({
  organizationId,
  customerId,
  catalog,
  children,
}: {
  organizationId: string;
  customerId: string | null;
  catalog: CartProduct[];
  children: ReactNode;
}) {
  const key = `distribuidora.cart.v1.${organizationId}.${customerId ?? "anon"}`;
  const store = useMemo(() => createCartStore(key), [key]);

  const lines = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  // false durante SSR/hidratación, true una vez montado en el navegador
  const hydrated = useSyncExternalStore(noopSubscribe, alwaysTrue, alwaysFalse);
  const online = useSyncExternalStore(subscribeOnline, isOnline, alwaysTrue);

  const [isOpen, setIsOpen] = useState(false);

  // Mantiene el carrito alineado con el catálogo vigente del cliente
  useEffect(() => {
    store.reconcile(catalog);
  }, [catalog, store]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((acc, line) => acc + line.quantity, 0);
    const subtotal = lines.reduce(
      (acc, line) => acc + line.quantity * line.price,
      0,
    );

    return {
      lines,
      count,
      subtotal,
      hydrated,
      online,
      isOpen,
      openCart,
      closeCart,
      addLine: store.add,
      setQuantity: store.setQuantity,
      removeLine: store.remove,
      clear: store.clear,
      quantityOf: (productId: string) =>
        lines.find((line) => line.productId === productId)?.quantity ?? 0,
    };
  }, [hydrated, isOpen, lines, online, store]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return context;
}

