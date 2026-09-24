import { createFileRoute } from "@tanstack/react-router";
import { LocationsPage } from "@/components/site/locations-page";
import { canonicalUrl, pageHead } from "@/lib/site-metadata";
import { breadcrumbStructuredData, jsonLdScript } from "@/lib/structured-data";

export const Route = createFileRoute("/locations")({
  head: () => {
    const siteUrl = canonicalUrl("/");
    return {
      ...pageHead(
        "Locations & Service Areas | Sydney Occupational Services",
        "Find Sydney Occupational Services in Parramatta. Our workplace rehabilitation consultants serve Greater Sydney, the Hunter and Wollongong.",
        "/locations",
      ),
      scripts: siteUrl
        ? [
            jsonLdScript(
              breadcrumbStructuredData(
                [
                  { name: "Home", path: "/" },
                  { name: "Locations", path: "/locations" },
                ],
                siteUrl,
              ),
            ),
          ]
        : [],
    };
  },
  component: LocationsPage,
});
