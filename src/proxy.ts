import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  DEMO_SESSION_COOKIE,
  isSupabaseConfigured,
  supabaseConfig,
} from "@/lib/config";

/**
 * Proxy (ex Middleware en Next <=15): protección optimista de /admin y /portal.
 * La validación del rol se repite en cada layout de servidor (guards.ts).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAdmin = pathname.startsWith("/admin");
  const needsClient = pathname.startsWith("/portal");

  if (!needsAdmin && !needsClient) return NextResponse.next();

  const toLogin = () => {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  };

  if (!isSupabaseConfigured()) {
    const role = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    if (role !== "ADMIN" && role !== "CLIENT") return toLogin();
    if (needsAdmin && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    if (needsClient && role !== "CLIENT") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const { url, anonKey } = supabaseConfig();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return toLogin();
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/portal", "/portal/:path*"],
};
