import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { track } from "@/lib/tracking";
import {
  CURRENT_LANGUAGE,
  htmlLocaleByLanguage,
  openGraphLocaleByLanguage,
  tr,
} from "@/lib/i18n";
import {
  ORGANIZATION_ID,
  breadcrumbJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { absoluteUrl, canonicalUrl as buildCanonicalUrl } from "@/lib/siteUrl";

type Props = {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogImage?: string;
  ogImageAlt?: string;
  ogImageType?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  trackAs?: Parameters<typeof track>[0];
  trackPayload?: Record<string, unknown>;
  noIndex?: boolean;
  ogType?: "website" | "article";
};

const DEFAULT_OG_IMAGE = "/media/social/eivitech-og-brand-preview-v1.png";

function breadcrumbTitle(title: string) {
  return title
    .replace(/\s*[|–]\s*Eivitech(?:\s+Ibiza)?\s*$/i, "")
    .trim();
}

function getBreadcrumbItems(path: string, title: string) {
  if (path === "/") return [];

  const home = { name: "Eivitech", path: "/" };
  const current = { name: breadcrumbTitle(title), path };

  if (path.startsWith("/servicios/")) {
    return [
      home,
      { name: tr("Servicios", "Servizi", "Services", "Diensten"), path: "/servicios" },
      current,
    ];
  }

  if (path.startsWith("/transformations/")) {
    return [
      home,
      {
        name: tr("Transformaciones", "Trasformazioni", "Transformations", "Transformaties"),
        path: "/transformations",
      },
      current,
    ];
  }

  return [home, current];
}

function enrichStructuredData(block: Record<string, unknown>, canonicalUrl: string) {
  const type = block["@type"];
  const pageId = `${canonicalUrl}#webpage`;

  if (type === "CreativeWork") {
    return {
      ...block,
      "@id": block["@id"] || `${canonicalUrl}#project`,
      mainEntityOfPage: block.mainEntityOfPage || { "@id": pageId },
      creator: block.creator || { "@id": ORGANIZATION_ID },
    };
  }

  if (type === "Service") {
    return {
      ...block,
      "@id": block["@id"] || `${canonicalUrl}#service`,
      url: block.url || canonicalUrl,
      mainEntityOfPage: block.mainEntityOfPage || { "@id": pageId },
      provider: block.provider || { "@id": ORGANIZATION_ID },
    };
  }

  return block;
}

export function SEO({
  title,
  description,
  path,
  jsonLd,
  ogImage,
  ogImageAlt,
  ogImageType,
  ogImageWidth,
  ogImageHeight,
  trackAs = "page_view",
  trackPayload,
  noIndex = false,
  ogType = "website",
}: Props) {
  useEffect(() => {
    track(trackAs, { path, ...trackPayload });
  }, [path, trackAs, trackPayload]);

  const suppliedBlocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const canonicalUrl = buildCanonicalUrl(path);
  const usesDefaultSocialImage = !ogImage;
  const socialImage = absoluteUrl(ogImage || DEFAULT_OG_IMAGE);
  const socialImageAlt = ogImageAlt || title;
  const socialImageType = ogImageType || (usesDefaultSocialImage ? "image/png" : "image/webp");
  const socialImageWidth = ogImageWidth || (usesDefaultSocialImage ? 1200 : undefined);
  const socialImageHeight = ogImageHeight || (usesDefaultSocialImage ? 630 : undefined);
  const robots = noIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const breadcrumbs = getBreadcrumbItems(path, title);
  const pageBlocks = noIndex
    ? []
    : [
        webPageJsonLd({
          title,
          description,
          path,
          inLanguage: htmlLocaleByLanguage[CURRENT_LANGUAGE],
          image: socialImage,
        }),
        ...(path === "/" ? [websiteJsonLd()] : []),
        ...(breadcrumbs.length > 1 ? [breadcrumbJsonLd(breadcrumbs)] : []),
      ];
  const blocks = [
    ...pageBlocks,
    ...suppliedBlocks.map((block) => enrichStructuredData(block, canonicalUrl)),
  ];
  const alternateLocales = Object.entries(openGraphLocaleByLanguage)
    .filter(([language]) => language !== CURRENT_LANGUAGE)
    .map(([, locale]) => locale);

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
      <meta property="og:locale" content={openGraphLocaleByLanguage[CURRENT_LANGUAGE]} />
      {alternateLocales.map((locale) => (
        <meta key={locale} property="og:locale:alternate" content={locale} />
      ))}
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:secure_url" content={socialImage} />
      <meta property="og:image:type" content={socialImageType} />
      {socialImageWidth && <meta property="og:image:width" content={String(socialImageWidth)} />}
      {socialImageHeight && <meta property="og:image:height" content={String(socialImageHeight)} />}
      <meta property="og:image:alt" content={socialImageAlt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={socialImage} />
      <meta name="twitter:image:alt" content={socialImageAlt} />
      {blocks.map((block, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
