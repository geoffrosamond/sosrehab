import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { services, site } from "@/lib/site";
import { pageHead } from "@/lib/site-metadata";

export const Route = createFileRoute("/downloads")({
  head: () => pageHead(
    "Workplace Rehabilitation Referral | Sydney Occupational Services",
    "Complete and download a workplace rehabilitation referral for Sydney Occupational Services. Email or fax the form for NSW return-to-work support.",
    "/downloads",
  ),
  component: ReferralPage,
});

function ReferralPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const lines = [
      "SYDNEY OCCUPATIONAL SERVICES — WORKPLACE REHABILITATION REFERRAL",
      "",
      ...Array.from(data.entries()).map(([k, v]) => `${k}: ${String(v)}`),
      "",
      `Send to ${site.email} or fax ${site.fax}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SOS-workplace-rehab-referral.txt";
    a.click();
    URL.revokeObjectURL(url);
    setSent(true);
  }

  return (
    <SiteLayout>
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs uppercase tracking-[0.18em] text-teal">Referrals</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">
          Referral for workplace rehabilitation.
        </h1>
        <p className="mt-5 text-muted leading-relaxed">
          Complete the form and download a referral letter to email{" "}
          <a className="text-teal-deep underline" href={site.emailHref}>
            {site.email}
          </a>{" "}
          or fax {site.fax}. Same-week commencement on most files.
        </p>

        {sent ? (
          <div className="mt-10 rounded-xl border border-line bg-surface p-8">
            <h2 className="font-display text-2xl">Referral file ready.</h2>
            <p className="mt-3 text-muted">
              Attach the downloaded file to an email and send it to the
              referrals inbox. Call {site.phone} if the worker needs to be seen
              this week.
            </p>
            <Button className="mt-6" type="button" onClick={() => setSent(false)}>
              Start another referral
            </Button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-10 space-y-4 rounded-xl border border-line bg-surface p-6 shadow-soft sm:p-8"
          >
            <Row label="Referrer name" name="Referrer" required />
            <Row label="Organisation / agent" name="Organisation" required />
            <Row label="Referrer email" name="Referrer email" type="email" required />
            <Row label="Referrer phone" name="Referrer phone" type="tel" />
            <Row label="Worker name" name="Worker name" required />
            <Row label="Claim number" name="Claim number" />
            <Row label="Employer" name="Employer" />
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted">Service requested</span>
              <select
                name="Service"
                className="h-11 w-full rounded-lg border border-line bg-cream px-3 text-ink outline-none focus:border-teal"
                defaultValue={services[0].title}
              >
                {services.map((s) => (
                  <option key={s.slug}>{s.title}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted">
                Injury / reason for referral
              </span>
              <textarea
                name="Reason"
                rows={5}
                required
                className="w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-ink outline-none focus:border-teal"
              />
            </label>
            <Button type="submit" size="lg">
              Download referral
            </Button>
          </form>
        )}
      </main>
    </SiteLayout>
  );
}

function Row({
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
