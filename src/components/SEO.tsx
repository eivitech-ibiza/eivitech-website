import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { track } from "@/lib/tracking";
import { absoluteUrl, canonicalUrl as buildCanonicalUrl } from "@/lib/siteUrl";

type Props = {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogImage?: string;
  trackAs?: Parameters<typeof track>[0];
  trackPayload?: Record<string, unknown>;
  noIndex?: boolean;
  ogType?: "website" | "article";
};

const DEFAULT_OG_IMAGE = "/media/hero/eivitech-ibiza-ristrutturazione-villa-mediterranea-top-banner.webp";

export function SEO({
  title,
  description,
  path,
  jsonLd,
  ogImage,
  trackAs = "page_view",
  trackPayload,
  noIndex = false,
  ogType = "website",
}: Props) {
  useEffect(() => {
    track(trackAs, { path, ...trackPayload });
  }, [path, trackAs, trackPayload]);

  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const canonicalUrl = buildCanonicalUrl(path);
  const socialImage = absoluteUrl(ogImage || DEFAULT_OG_IMAGE);
  const robots = noIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Eivitech Ibiza" />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={socialImage} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
}
