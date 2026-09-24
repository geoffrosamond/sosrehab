import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/layout";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { Button } from "@/components/ui/button";
import { services, site } from "@/lib/site";
import { canonicalUrl, pageHead } from "@/lib/site-metadata";
import {
  breadcrumbStructuredData,
  jsonLdScript,
  serviceStructuredData,
} from "@/lib/structured-data";

export const Route = createFileRoute("/services/$slug")({
  head: ({ params }) => {
    const service = services.find((s) => s.slug === params.slug);
    if (!service) return {};
    const siteUrl = canonicalUrl("/");
    return {
      ...pageHead(
        `${service.title} | Sydney Occupational Services`,
        `${service.summary} Available across Greater Sydney and NSW through Sydney Occupational Services.`,
        `/services/${encodeURIComponent(service.slug)}`,
      ),
      scripts: siteUrl
        ? [
            jsonLdScript(serviceStructuredData(service, siteUrl)),
            jsonLdScript(
              breadcrumbStructuredData(
                [
                  { name: "Home", path: "/" },
                  { name: "Services", path: "/services" },
                  { name: service.title, path: `/services/${service.slug}` },
                ],
                siteUrl,
              ),
            ),
          ]
        : [],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const service = services.find((s) => s.slug === slug);
  if (!service) throw notFound();

  return (
    <SiteLayout>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link to="/" className="hover:text-ink">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link to="/services" className="hover:text-ink">Services</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{service.title}</span>
        </nav>
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs uppercase tracking-[0.18em] text-teal">{service.audience}</p>
            <h1 className="mt-3 text-4xl sm:text-5xl">{service.title}</h1>
            <p className="mt-5 text-lg text-muted">{service.summary}</p>
            <div className="mt-6 space-y-4 text-ink-soft leading-relaxed">
              {service.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Button asChild className="mt-8">
              <Link to="/downloads">Prepare a referral</Link>
            </Button>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <ResponsiveImage
              src={service.image}
              sizes="(min-width: 1024px) 450px, 100vw"
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
        <div className="mt-16 grid gap-12 border-t border-line pt-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            <section aria-labelledby="referral-heading">
              <h2 id="referral-heading" className="font-display text-3xl">
                When to request {service.title.toLowerCase()}
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">{service.referral}</p>
            </section>
            <section aria-labelledby="process-heading">
              <h2 id="process-heading" className="font-display text-3xl">
                How it works
              </h2>
              <ol className="mt-5 space-y-4">
                {service.process.map((step, index) => (
                  <li key={step} className="flex gap-4 leading-relaxed text-ink-soft">
                    <span className="font-display text-xl text-teal" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
            <section aria-labelledby="report-heading">
              <h2 id="report-heading" className="font-display text-3xl">
                What you receive
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">{service.deliverable}</p>
            </section>
            <section aria-labelledby="questions-heading">
              <h2 id="questions-heading" className="font-display text-3xl">
                Common questions
              </h2>
              <dl className="mt-5 divide-y divide-line border-t border-line">
                {service.questions.map(({ question, answer }) => (
                  <div key={question} className="py-5">
                    <dt className="font-display text-xl">{question}</dt>
                    <dd className="mt-2 leading-relaxed text-ink-soft">{answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-line bg-surface p-6">
              <h2 className="font-display text-2xl">Ready to discuss a referral?</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{service.nextStep}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Servicing {site.regions}. Booking and report timing depend on the referral scope and
                location.
              </p>
              <Button asChild className="mt-6">
                <Link to="/downloads">Prepare a referral</Link>
              </Button>
              <p className="mt-4 text-sm text-muted">
                Or call{" "}
                <a className="text-teal-deep underline" href={site.phoneHref}>
                  {site.phone}
                </a>{" "}
                to discuss the request.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </SiteLayout>
  );
}
