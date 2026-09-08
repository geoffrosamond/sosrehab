import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/layout";
import { team } from "@/lib/site";

export const Route = createFileRoute("/team/$slug")({
  component: PersonPage,
});

function PersonPage() {
  const { slug } = Route.useParams();
  const person = team.find((p) => p.slug === slug);
  if (!person) throw notFound();

  return (
    <SiteLayout>
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link
            to="/team"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
          >
            <ArrowLeft className="size-4" /> Team
          </Link>
          <img
            src={person.image}
            alt={person.name}
            className="mt-6 aspect-3/4 w-full rounded-xl object-cover object-top"
          />
        </div>
        <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
          <p className="text-xs uppercase tracking-[0.18em] text-teal">
            {person.role}
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{person.name}</h1>
          <div className="mt-6 space-y-4 leading-relaxed text-ink-soft">
            {person.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {person.languages ? (
            <p className="mt-5 text-sm text-muted">
              Languages: {person.languages}
            </p>
          ) : null}
          <div className="mt-8 space-y-1 text-sm">
            <p>
              <a className="text-teal-deep hover:underline" href={person.mobileHref}>
                {person.mobile}
              </a>
            </p>
            <p>
              <a
                className="text-teal-deep hover:underline"
                href={`mailto:${person.email}`}
              >
                {person.email}
              </a>
            </p>
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
