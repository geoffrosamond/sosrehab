import { SiteLayout } from "@/components/site/layout";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { services } from "@/lib/site";
import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { breadcrumbStructuredData, jsonLdScript } from "@/lib/structured-data";
import { canonicalUrl, pageHead } from "@/lib/site-metadata";

export const Route = createFileRoute("/services")({
  head: ({ match, matches }) => {
    if (matches.at(-1)?.routeId !== match.routeId) return {};
    const siteUrl = canonicalUrl("/");
    return {
      ...pageHead(
        "Workplace Rehabilitation Services | Sydney Occupational Services",
        "Explore NSW workplace rehabilitation, return-to-work programs, functional capacity, vocational and ergonomic assessments, and manual handling training.",
        "/services",
      ),
      scripts: siteUrl
        ? [
            jsonLdScript(
              breadcrumbStructuredData(
                [
                  { name: "Home", path: "/" },
                  { name: "Services", path: "/services" },
                ],
                siteUrl,
              ),
            ),
          ]
        : [],
    };
  },
  component: ServicesPage,
});

function ServicesPage() {
  const matchRoute = useMatchRoute();
  if (!matchRoute({ to: "/services", fuzzy: false })) return <Outlet />;

  return (
    <SiteLayout>
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Services</span>
        </nav>
        <p className="text-xs uppercase tracking-[0.18em] text-teal">Services</p>
        <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">
          Assessment, training and return to work.
        </h1>
        <p className="mt-5 max-w-2xl text-muted leading-relaxed">
          Eight services built around the NSW workers compensation scheme — from the first workplace
          visit to a durable discharge.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group grid overflow-hidden rounded-xl border border-line bg-surface shadow-soft sm:grid-cols-[11rem_1fr]"
            >
              <ResponsiveImage
                src={s.image}
                sizes="(min-width: 640px) 176px, 100vw"
                alt=""
                className="h-44 w-full object-cover sm:h-full"
              />
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">{s.audience}</p>
                <h2 className="mt-2 font-display text-2xl leading-snug">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </SiteLayout>
  );
}
