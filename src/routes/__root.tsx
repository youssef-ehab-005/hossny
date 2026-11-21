import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "../lib/store";
import { AuthProvider } from "../lib/auth";
import { I18nProvider } from "../lib/i18n";
import { supabase } from "../integrations/supabase/client";
import { useRealtimeSync } from "../lib/useRealtimeSync";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import { BrandHead } from "../components/BrandHead";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-[7rem] leading-none text-gradient-gold">404</p>
        <h2 className="mt-2 font-display text-2xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-background hover:bg-gold hover:text-gold-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-5 py-2.5 text-xs font-medium uppercase tracking-wider hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Off Track — Modern Luxury Fashion & Essentials" },
      {
        name: "description",
        content:
          "Off Track is a modern luxury fashion house. Shop refined womenswear, menswear, shoes and accessories crafted from premium materials with timeless minimalist design.",
      },
      { name: "author", content: "Off Track" },
      { property: "og:title", content: "Off Track — Modern Luxury Fashion & Essentials" },
      {
        property: "og:description",
        content:
          "Off Track is a modern luxury fashion house. Shop refined womenswear, menswear, shoes and accessories crafted from premium materials with timeless minimalist design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Off Track — Modern Luxury Fashion & Essentials" },
      { name: "twitter:description", content: "Off Track is a modern luxury fashion house. Shop refined womenswear, menswear, shoes and accessories crafted from premium materials with timeless minimalist design." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/db02172d-1b49-4985-b4f0-0d722b4b9cff/id-preview-8eaa8a60--8bcdaf27-f656-40cb-9a64-b5b405b3f320.lovable.app-1783463234231.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/db02172d-1b49-4985-b4f0-0d722b4b9cff/id-preview-8eaa8a60--8bcdaf27-f656-40cb-9a64-b5b405b3f320.lovable.app-1783463234231.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeSync />
      <I18nProvider>
        <AuthProvider>
          <StoreProvider>
            <BrandHead />
            <Header />
            <main className="min-h-screen">
              <Outlet />
            </main>
            <Footer />
            <CartDrawer />
          </StoreProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

function RealtimeSync() {
  useRealtimeSync();
  return null;
}

