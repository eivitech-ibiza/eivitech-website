import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { track } from "@/lib/tracking";

type Props = {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogImage?: string;
  trackAs?: Parameters<typeof track>[0];
  trackPayload?: Record<string, unknown>;
};

export function SEO({ title, description, path, jsonLd, ogImage, trackAs = "page_view", trackPayload }: Props) {
  useEffect(() => {
    track(trackAs, { path, ...trackPayload });
  }, [path, trackAs, trackPayload]);

  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={path} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={path} />
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
}
