import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteLayout } from "@/components/site/layout";
import { canonicalUrl } from "@/lib/site-metadata";
import { jsonLdScript, siteIdentity } from "@/lib/structured-data";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => {
    const siteUrl = canonicalUrl("/");
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#2A6B58" },
      ],
      scripts: siteUrl ? [jsonLdScript(siteIdentity(siteUrl))] : [],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
        {
          rel: "preload",
          href: "/fonts/fraunces-latin.woff2",
          as: "font",
          type: "font/woff2",
          crossOrigin: "anonymous",
        },
        {
          rel: "preload",
          href: "/fonts/source-sans-3-latin.woff2",
          as: "font",
          type: "font/woff2",
          crossOrigin: "anonymous",
        },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-teal">404</p>
        <h1 className="mt-3 font-display text-4xl">Page not found</h1>
        <p className="mt-4 text-muted">
          That address is not on the SOS site. Try services, team or contact.
        </p>
        <a href="/" className="mt-8 inline-block text-teal-deep underline">
          Back home
        </a>
      </main>
    </SiteLayout>
  ),
  component: () => (
    <html lang="en-AU" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
