-- ============================================================================
--  Distribuidora B2B — Esquema de datos (PostgreSQL / Supabase)
--  Ejecutar UNA vez en: Supabase Dashboard > SQL Editor
--  Luego ejecutar: supabase/seed.sql
-- ============================================================================
create extension if not exists pgcrypto;

-- ORGANIZATIONS (multi-tenant: todas las entidades cuelgan de acá)
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.customers (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,
  company          text,
  email            text,
  phone            text,
  address          text,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);
create index if not exists customers_org_idx on public.customers(organization_id);

-- USERS (perfil de negocio ligado a auth.users)
create table if not exists public.users (
  id               uuid primary key references auth.users(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  customer_id      uuid references public.customers(id) on delete set null,
  email            text not null,
  full_name        text not null,
  role             text not null check (role in ('ADMIN', 'CLIENT')),
  created_at       timestamptz not null default now()
);
create index if not exists users_org_idx on public.users(organization_id);

create table if not exists public.categories (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists categories_org_idx on public.categories(organization_id);

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  category_id      uuid references public.categories(id) on delete set null,
  name             text not null,
  description      text,
  base_price       numeric(12,2) not null default 0,
  unit             text not null default 'unidad',
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);
create index if not exists products_org_idx on public.products(organization_id);

-- Precio por cliente; si no hay fila se usa products.base_price
create table if not exists public.customer_prices (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  customer_id      uuid not null references public.customers(id) on delete cascade,
  product_id       uuid not null references public.products(id) on delete cascade,
  price            numeric(12,2) not null,
  unique (customer_id, product_id)
);
create index if not exists customer_prices_org_idx on public.customer_prices(organization_id);

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  customer_id      uuid not null references public.customers(id) on delete restrict,
  order_number     text not null default ('PED-' || nextval('public.order_number_seq')),
  status           text not null default 'PENDIENTE'
                     check (status in ('PENDIENTE','CONFIRMADO','EN_PREPARACION','EN_REPARTO','ENTREGADO')),
  total            numeric(12,2) not null default 0,
  notes            text,
  created_at       timestamptz not null default now()
);
create index if not exists orders_org_idx on public.orders(organization_id);
create index if not exists orders_customer_idx on public.orders(customer_id);

-- Snapshot de nombre/precio al momento del pedido
create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_id       uuid references public.products(id) on delete set null,
  product_name     text not null,
  unit             text not null default 'unidad',
  quantity         numeric(12,2) not null check (quantity > 0),
  unit_price       numeric(12,2) not null,
  subtotal         numeric(12,2) not null
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ============================================================================
--  HELPERS PARA RLS (security definer: evita recursión al leer public.users)
-- ============================================================================
create or replace function public.current_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.users where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.current_customer_id()
returns uuid language sql stable security definer set search_path = public as $$
  select customer_id from public.users where id = auth.uid()
$$;

create or replace function public.is_org_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'ADMIN' from public.users where id = auth.uid()), false)
$$;

-- ¿El pedido es visible para el usuario actual?
create or replace function public.can_see_order(p_order_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.orders o
    where o.id = p_order_id
      and o.organization_id = public.current_org_id()
      and (public.is_org_admin() or o.customer_id = public.current_customer_id())
  )
$$;

-- ============================================================================
--  ROW LEVEL SECURITY — aislamiento por organization_id
-- ============================================================================
alter table public.organizations   enable row level security;
alter table public.customers       enable row level security;
alter table public.users           enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.customer_prices enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;

-- organizations: cada usuario ve sólo su distribuidora
drop policy if exists organizations_select on public.organizations;
create policy organizations_select on public.organizations
  for select using (id = public.current_org_id());

-- users: el propio perfil, o todos los de la org si es ADMIN
drop policy if exists users_select on public.users;
create policy users_select on public.users
  for select using (id = auth.uid() or (organization_id = public.current_org_id() and public.is_org_admin()));

-- customers: ADMIN ve todos; CLIENT sólo su propia ficha
drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers
  for select using (
    organization_id = public.current_org_id()
    and (public.is_org_admin() or id = public.current_customer_id())
  );
drop policy if exists customers_write on public.customers;
create policy customers_write on public.customers
  for all using (organization_id = public.current_org_id() and public.is_org_admin())
  with check (organization_id = public.current_org_id() and public.is_org_admin());

-- categories: lectura para miembros de la org, escritura sólo ADMIN
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
  for select using (organization_id = public.current_org_id());
drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories
  for all using (organization_id = public.current_org_id() and public.is_org_admin())
  with check (organization_id = public.current_org_id() and public.is_org_admin());

-- products: CLIENT sólo ve activos; ADMIN gestiona todo
drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select using (
    organization_id = public.current_org_id()
    and (public.is_org_admin() or active)
  );
drop policy if exists products_write on public.products;
create policy products_write on public.products
  for all using (organization_id = public.current_org_id() and public.is_org_admin())
  with check (organization_id = public.current_org_id() and public.is_org_admin());

-- customer_prices: ADMIN todo; CLIENT sólo sus precios
drop policy if exists customer_prices_select on public.customer_prices;
create policy customer_prices_select on public.customer_prices
  for select using (
    organization_id = public.current_org_id()
    and (public.is_org_admin() or customer_id = public.current_customer_id())
  );
drop policy if exists customer_prices_write on public.customer_prices;
create policy customer_prices_write on public.customer_prices
  for all using (organization_id = public.current_org_id() and public.is_org_admin())
  with check (organization_id = public.current_org_id() and public.is_org_admin());

-- orders: ADMIN ve todos los de su org; CLIENT sólo los propios
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select using (
    organization_id = public.current_org_id()
    and (public.is_org_admin() or customer_id = public.current_customer_id())
  );
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert with check (
    organization_id = public.current_org_id()
    and (public.is_org_admin() or customer_id = public.current_customer_id())
  );
drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders
  for update using (organization_id = public.current_org_id() and public.is_org_admin())
  with check (organization_id = public.current_org_id() and public.is_org_admin());
drop policy if exists orders_delete on public.orders;
create policy orders_delete on public.orders
  for delete using (organization_id = public.current_org_id() and public.is_org_admin());

-- order_items: accesibles sólo a través de un pedido visible
drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items
  for select using (public.can_see_order(order_id));
drop policy if exists order_items_insert on public.order_items;
create policy order_items_insert on public.order_items
  for insert with check (
    organization_id = public.current_org_id() and public.can_see_order(order_id)
  );
drop policy if exists order_items_write on public.order_items;
create policy order_items_write on public.order_items
  for all using (public.is_org_admin() and organization_id = public.current_org_id())
  with check (public.is_org_admin() and organization_id = public.current_org_id());
