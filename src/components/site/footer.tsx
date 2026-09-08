import { Link } from "@tanstack/react-router";
import { nav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-hero text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-2xl tracking-tight">
            Sydney Occupational Services
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/70">
            SIRA-accredited workplace rehabilitation across Greater Sydney, the
            Hunter and Wollongong. Founded in 2004.
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="text-xs uppercase tracking-[0.16em] text-cream/50">
            Visit
          </p>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-cream">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="text-xs uppercase tracking-[0.16em] text-cream/50">
            Referrals
          </p>
          <p className="mt-3 text-sm text-cream/80">
            {site.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <p className="mt-3 text-sm">
            <a className="hover:underline" href={site.phoneHref}>
              {site.phone}
            </a>
            <br />
            <a className="hover:underline" href={site.emailHref}>
              {site.email}
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-cream/45 sm:px-6">
          <span>© {new Date().getFullYear()} Sydney Occupational Services</span>
          <span>sosrehab.com.au</span>
        </div>
      </div>
    </footer>
  );
}
