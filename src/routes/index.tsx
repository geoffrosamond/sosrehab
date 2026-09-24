import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/layout";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { Button } from "@/components/ui/button";
import { services, site, team } from "@/lib/site";
import { pageHead } from "@/lib/site-metadata";

export const Route = createFileRoute("/")({
  head: () => pageHead(
    "Sydney Occupational Services",
    "SIRA-accredited workplace rehabilitation in NSW. Assessments, return to work, ergonomics and training across Greater Sydney, Hunter and Wollongong.",
    "/",
  ),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero text-cream">
        <ResponsiveImage
          src="/images/hero.jpg"
          sizes="100vw"
          priority
          alt="Occupational therapist meeting a worker to plan a return to work"
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-linear-to-r from-hero via-hero/80 to-hero/25" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-12 lg:py-32">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.22em] text-cream/70">
              SIRA-accredited · NSW workers compensation
            </p>
            <h1 className="mt-5 font-display text-4xl tracking-tight sm:text-6xl">
              Workplace rehabilitation services in NSW.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/80">
              Sydney Occupational Services returns injured workers to durable
              employment. Senior consultants. Cost-effective files. Every NSW
              scheme agent.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="cream" size="lg">
                <Link to="/downloads">Send a referral</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="border-cream/30 text-cream hover:bg-cream/10 hover:text-cream">
                <Link to="/services">View services</Link>
              </Button>
            </div>
          </div>
          <aside className="flex flex-col justify-end gap-4 lg:col-span-4 lg:col-start-9">
            <Stat label="Established" value="2004" />
            <Stat label="Coverage" value="Sydney · Hunter · Wollongong" />
            <Stat label="Referrals" value={site.phone} href={site.phoneHref} />
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-teal">
            Why SOS
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl">
            Compare the team you use now. It may save time and money.
          </h2>
          <p className="mt-5 text-muted leading-relaxed">
            We provide assessment, training and rehabilitation with a focus on
            the WorkCover NSW scheme. The same directors who founded the firm
            in 2004 still carry files — and still answer the phone.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Senior ownership",
              copy: "Greg Weir and Matthew Holdt remain in service delivery. Files are not passed to a junior bench.",
            },
            {
              title: "Scheme fluency",
              copy: "Every NSW workers compensation agent. National employers. Specialist treatment networks.",
            },
            {
              title: "Evidence first",
              copy: "Ergonomics, functional testing and vocational options grounded in the actual job and labour market.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-line bg-surface p-6 shadow-soft"
            >
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-bg-warm/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-teal">
                Services
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl">What we do</h2>
            </div>
            <Link
              to="/services"
              className="hidden items-center gap-1 text-sm text-teal-deep sm:inline-flex"
            >
              All services <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="group overflow-hidden rounded-xl border border-line bg-surface shadow-soft"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <ResponsiveImage
                    src={s.image}
                    sizes="(min-width: 1024px) 260px, (min-width: 640px) 50vw, 100vw"
                    alt=""
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg leading-snug">{s.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{s.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-teal">
            Directors
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl">
            Two occupational therapists. One practice.
          </h2>
          <p className="mt-5 text-muted leading-relaxed">
            Greg Weir and Matthew Holdt built SOS after years inside scheme
            agents, national employers and clinical rehab. The firm is still
            the size of its caseload — not a franchise.
          </p>
          <Button asChild className="mt-7" variant="ink">
            <Link to="/team">Meet the team</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {team.map((p) => (
            <Link
              key={p.slug}
              to="/team/$slug"
              params={{ slug: p.slug }}
              className="overflow-hidden rounded-xl border border-line bg-surface"
            >
              <ResponsiveImage
                src={p.image}
                sizes="(min-width: 1024px) 260px, 50vw"
                alt={p.name}
                className="aspect-3/4 w-full object-cover object-top"
              />
              <div className="p-4">
                <p className="font-display text-lg">{p.name}</p>
                <p className="text-sm text-muted">{p.role.split(",")[0]}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-hero text-cream">
        <ResponsiveImage
          src="/images/parramatta.jpg"
          sizes="100vw"
          alt="Parramatta Square office precinct"
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-hero/70" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-cream/60">
              Head office
            </p>
            <h2 className="mt-3 text-3xl">Parramatta Square</h2>
            <p className="mt-3 text-cream/75">
              {site.addressLines.join(", ")}. Servicing {site.regions}.
            </p>
          </div>
          <Button asChild variant="cream">
            <Link to="/locations">Find us</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-[11px] uppercase tracking-[0.16em] text-cream/55">{label}</p>
      <p className="mt-1 font-display text-xl">{value}</p>
    </>
  );
  const className = "rounded-lg border border-cream/15 bg-hero/50 p-4 backdrop-blur-sm";
  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return <div className={className}>{inner}</div>;
}
