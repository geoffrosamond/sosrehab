import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/layout";
import { services } from "@/lib/site";

export const Route = createFileRoute("/services")({ component: ServicesPage });

function ServicesPage() {
  return (
    <SiteLayout>
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs uppercase tracking-[0.18em] text-teal">Services</p>
        <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">
          Assessment, training and return to work.
        </h1>
        <p className="mt-5 max-w-2xl text-muted leading-relaxed">
          Eight services built around the NSW workers compensation scheme —
          from the first workplace visit to a durable discharge.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group grid overflow-hidden rounded-xl border border-line bg-surface shadow-soft sm:grid-cols-[11rem_1fr]"
            >
              <img
                src={s.image}
                alt=""
                className="h-44 w-full object-cover sm:h-full"
              />
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-faint">
                  {s.audience}
                </p>
                <h2 className="mt-2 font-display text-2xl leading-snug">
                  {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {s.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </SiteLayout>
  );
}
