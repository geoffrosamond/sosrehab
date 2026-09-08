import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export const Route = createFileRoute("/locations")({ component: LocationsPage });

const regions = [
  {
    name: "Greater Sydney",
    copy: "Workplace visits, assessments and training across metropolitan Sydney from the Parramatta head office.",
  },
  {
    name: "Hunter",
    copy: "On-site services through the Hunter — industrial, logistics and public-sector employers included.",
  },
  {
    name: "Wollongong",
    copy: "Illawarra coverage for scheme files that need a consultant who will actually attend the site.",
  },
];

export function LocationsPage() {
  return (
    <SiteLayout>
      <main>
        <section className="relative isolate overflow-hidden bg-hero text-cream">
          <img
            src="/images/parramatta.jpg"
            alt="3 Parramatta Square"
            className="absolute inset-0 size-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-hero/55" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <p className="text-xs uppercase tracking-[0.18em] text-cream/70">
              Locations
            </p>
            <h1 className="mt-3 max-w-xl text-4xl sm:text-5xl">
              Head office in Parramatta. Sites wherever the work is.
            </h1>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-3xl">Parramatta Square</h2>
            <p className="mt-4 leading-relaxed text-muted">
              {site.addressLines.join(", ")}
            </p>
            <p className="mt-3 text-muted">Servicing {site.regions}.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a
                  href="https://maps.google.com/?q=Level+14+3+Parramatta+Square+153+Macquarie+Street+Parramatta+NSW+2150"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Maps
                </a>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/contact">Contact</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 lg:col-span-7">
            {regions.map((r) => (
              <article
                key={r.name}
                className="rounded-xl border border-line bg-surface p-5 shadow-soft"
              >
                <h3 className="font-display text-xl">{r.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{r.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
