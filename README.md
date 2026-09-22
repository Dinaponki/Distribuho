# Portal B2B de pedidos para distribuidoras (DEMO)

Demo comercial de una plataforma de pedidos mayoristas: cada distribuidora tiene su organización, sus clientes ven el catálogo con **sus propios precios**, hacen pedidos online y la distribuidora los gestiona desde un panel con estados (pendiente → entregado).

- **Modo demo local:** sin configurar nada, la app funciona con datos de ejemplo (`.demo-data/db.json`). Ideal para mostrar en 5 minutos.
- **Modo Supabase:** al definir las variables de entorno, usa PostgreSQL real con RLS y Supabase Auth.

## Puesta en marcha

```bash
npm install
npm run dev          # modo demo local, sin configuración
```

## Demo con Supabase

1. Crear un proyecto en [Supabase](https://supabase.com) y copiar las credenciales.
2. En `.env.local` (y en Vercel) configurar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

3. Ejecutar en el **SQL Editor** de Supabase: `supabase/schema.sql` y luego `supabase/seed.sql` (datos: organización, categorías, productos, clientes, precios y pedidos demo).
4. Para los **usuarios demo** (Supabase Auth no se puede seedear por SQL de forma segura), configurar temporalmente la clave de servicio — solo para el seed, nunca en el cliente:

```env
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

5. Crear los usuarios demo (idempotente):

```bash
npm run seed:demo
```

6. Iniciar la aplicación:

```bash
npm run dev
```

### Credenciales demo

```text
Admin:
admin@distribuidora.com
demo1234

Cliente:
cliente@almacencentral.com
demo1234
```

> ⚠️ Credenciales exclusivamente de **demostración**. No usar en producción.

El botón **"Entrar como distribuidora"** inicia sesión como admin y lleva a `/admin`; el botón **"Entrar como cliente"** entra como cliente de "Almacén Central" y lleva a `/portal`.

## Variables de entorno

| Variable | Dónde | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | URL del proyecto (pública) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Clave anónima, respeta RLS (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo local / CLI del seed | **Nunca en Vercel, nunca con `NEXT_PUBLIC_`**. Ignora RLS: solo para `npm run seed:demo` |
| `DEMO_ADMIN_EMAIL` / `DEMO_CLIENT_EMAIL` / `DEMO_PASSWORD` | Opcional | Personaliza los usuarios demo |

La service role key **no se usa en la app**: el runtime de Next.js solo necesita las dos variables públicas; RLS se encarga del aislamiento multi-tenant.

## Deploy en Vercel

1. Importar el repo y configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Project Settings → Environment Variables.
2. Ejecutar `schema.sql`, `seed.sql` y `npm run seed:demo` (este último desde tu máquina con la service role key en `.env.local`).
3. Deploy.

## Scripts

```bash
npm run dev         # desarrollo
npm run build       # build de producción
npm run lint        # eslint
npx tsc --noEmit    # typescript
npm run seed:demo   # crea/actualiza los usuarios demo en Supabase Auth
```
