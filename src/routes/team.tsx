import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/layout";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { team } from "@/lib/site";
import { pageHead } from "@/lib/site-metadata";

export const Route = createFileRoute("/team")({
  head: () => pageHead(
    "Rehabilitation Consultants & Directors | Sydney Occupational Services",
    "Meet the directors and senior rehabilitation consultants at Sydney Occupational Services, delivering hands-on return-to-work support across NSW.",
    "/team",
  ),
  component: TeamPage,
});

function TeamPage() {
  return (
    <SiteLayout>
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs uppercase tracking-[0.18em] text-teal">Team</p>
        <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">
          Directors and senior rehabilitation consultants.
        </h1>
        <p className="mt-5 max-w-2xl text-muted leading-relaxed">
          Founded by Greg Weir and Matt Holdt. A Sydney-wide team of
          rehabilitation consultants, led from the file — not from a call
          centre.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {team.map((p) => (
            <Link
              key={p.slug}
              to="/team/$slug"
              params={{ slug: p.slug }}
              className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft"
            >
              <ResponsiveImage
                src={p.image}
                sizes="(min-width: 768px) 540px, 100vw"
                alt={p.name}
                className="aspect-4/5 w-full object-cover object-top sm:aspect-4/3"
              />
              <div className="p-6">
                <h2 className="font-display text-2xl">{p.name}</h2>
                <p className="mt-1 text-sm text-muted">{p.role}</p>
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                  {p.bio[0]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </SiteLayout>
  );
}
