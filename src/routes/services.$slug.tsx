import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/site";

export const Route = createFileRoute("/services/$slug")({
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const service = services.find((s) => s.slug === slug);
  if (!service) throw notFound();

  return (
    <SiteLayout>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" /> All services
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs uppercase tracking-[0.18em] text-teal">
              {service.audience}
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl">{service.title}</h1>
            <p className="mt-5 text-lg text-muted">{service.summary}</p>
            <div className="mt-6 space-y-4 text-ink-soft leading-relaxed">
              {service.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Button asChild className="mt-8">
              <Link to="/downloads">Refer this service</Link>
            </Button>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <img
              src={service.image}
              alt=""
              className="aspect-4/3 w-full rounded-xl object-cover"
            />
            <ul className="mt-5 space-y-3 rounded-xl border border-line bg-surface p-5">
              {service.outcomes.map((o) => (
                <li key={o} className="text-sm leading-relaxed text-ink-soft">
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
