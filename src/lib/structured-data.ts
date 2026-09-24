import { site, type Service } from "./site";

export function jsonLdScript(data: object) {
  return {
    type: "application/ld+json",
    // Inline script content must not contain an HTML closing tag.
    children: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export function siteIdentity(siteUrl: string) {
  const businessId = `${siteUrl}#business`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": businessId,
        name: site.name,
        url: siteUrl,
        telephone: site.phone,
        email: site.email,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: site.phone,
          email: site.email,
          contactType: "referrals",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: site.addressLines.slice(0, 2).join(", "),
          addressLocality: "Parramatta",
          addressRegion: "NSW",
          postalCode: "2150",
          addressCountry: "AU",
        },
        areaServed: ["Greater Sydney", "Hunter", "Wollongong"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        name: site.name,
        url: siteUrl,
        publisher: { "@id": businessId },
      },
    ],
  };
}

export function serviceStructuredData(service: Service, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}services/${service.slug}#service`,
    url: `${siteUrl}services/${service.slug}`,
    name: service.title,
    description: service.summary,
    serviceType: service.title,
    provider: { "@id": `${siteUrl}#business` },
    audience: {
      "@type": "Audience",
      audienceType: service.audience,
    },
    areaServed: ["Greater Sydney", "Hunter", "Wollongong"],
  };
}

export function breadcrumbStructuredData(items: { name: string; path: string }[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).href,
    })),
  };
}