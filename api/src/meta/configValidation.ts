export function validateMetaPixelId(value: string) {
  return /^\d{5,32}$/.test(value.trim());
}

export function normalizeMetaWebConfigInput(input: { pixelId?: unknown; enabled?: unknown }) {
  const enabled = input.enabled === true;
  const rawPixelId = typeof input.pixelId === "string" ? input.pixelId.trim() : "";
  const pixelId = rawPixelId || null;

  if (pixelId && !validateMetaPixelId(pixelId)) {
    throw new Error("A valid Meta Pixel ID is required");
  }
  if (enabled && !pixelId) {
    throw new Error("A valid Meta Pixel ID is required before enabling Meta Pixel");
  }

  return { pixelId, enabled };
}
