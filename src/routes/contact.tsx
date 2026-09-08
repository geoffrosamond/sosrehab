import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { site, team } from "@/lib/site";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <SiteLayout>
      <main className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.18em] text-teal">Contact</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">
            Working with you for a better outcome.
          </h1>
          <p className="mt-5 text-muted leading-relaxed">
            General enquiries and referrals land with the directors. If the
            matter is urgent, call.
          </p>

          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-faint">
                Phone
              </dt>
              <dd className="mt-1">
                <a className="hover:underline" href={site.phoneHref}>
                  {site.phone}
                </a>
                <span className="block text-muted">Fax {site.fax}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-faint">
                Email
              </dt>
              <dd className="mt-1">
                <a className="hover:underline" href={site.emailHref}>
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-faint">
                Head office
              </dt>
              <dd className="mt-1 text-ink-soft">
                {site.addressLines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
                <span className="mt-2 block text-muted">
                  Servicing {site.regions}
                </span>
              </dd>
            </div>
          </dl>

          <ul className="mt-10 space-y-4">
            {team.map((p) => (
              <li key={p.slug} className="border-t border-line pt-4">
                <p className="font-display text-lg">{p.name}</p>
                <p className="text-sm text-muted">{p.role.split(",")[0]}</p>
                <p className="mt-1 text-sm">
                  <a className="hover:underline" href={p.mobileHref}>
                    {p.mobile}
                  </a>
                  {" · "}
                  <a className="hover:underline" href={`mailto:${p.email}`}>
                    {p.email}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="rounded-xl border border-line bg-surface p-6 shadow-soft sm:p-8">
            {sent ? (
              <div>
                <h2 className="font-display text-2xl">Received.</h2>
                <p className="mt-3 text-muted leading-relaxed">
                  This preview stores the message on this device only. For a
                  live referral, email {site.email} or call {site.phone}.
                </p>
                <Button className="mt-6" type="button" onClick={() => setSent(false)}>
                  Send another
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={onSubmit}>
                <h2 className="font-display text-2xl">Write to us</h2>
                <Field label="Name" name="name" required />
                <Field label="Organisation" name="org" />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" />
                <label className="block">
                  <span className="mb-1.5 block text-sm text-muted">Message</span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-ink outline-none focus:border-teal"
                  />
                </label>
                <Button type="submit" size="lg">
                  Send message
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="h-11 w-full rounded-lg border border-line bg-cream px-3 text-ink outline-none focus:border-teal"
      />
    </label>
  );
}
