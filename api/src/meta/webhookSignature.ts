import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyMetaWebhookSignature(body: Buffer, signatureHeader: string | undefined, appSecret: string | undefined) {
  if (!signatureHeader || !appSecret || !signatureHeader.startsWith("sha256=")) return false;
  const providedHex = signatureHeader.slice("sha256=".length);
  if (!/^[a-f0-9]{64}$/i.test(providedHex)) return false;

  const expected = Buffer.from(createHmac("sha256", appSecret).update(body).digest("hex"), "hex");
  const provided = Buffer.from(providedHex, "hex");
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}
