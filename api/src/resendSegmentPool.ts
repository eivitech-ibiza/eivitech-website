export type ResendSegmentPoolSelection = {
  availableSegmentIds: string[];
  reservedSegmentIds: ReadonlySet<string>;
  currentSegmentId?: string | null;
};

export function selectResendSegmentPool({
  availableSegmentIds,
  reservedSegmentIds,
  currentSegmentId = null,
}: ResendSegmentPoolSelection) {
  const uniqueAvailable = [...new Set(availableSegmentIds.filter(Boolean))];

  if (
    currentSegmentId
    && uniqueAvailable.includes(currentSegmentId)
    && !reservedSegmentIds.has(currentSegmentId)
  ) {
    return currentSegmentId;
  }

  return uniqueAvailable.find((segmentId) => !reservedSegmentIds.has(segmentId)) || null;
}
