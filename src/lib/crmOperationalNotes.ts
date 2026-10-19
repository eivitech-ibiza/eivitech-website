/** An existing CRM activity returned by the authenticated lead details API. */
export type CrmActivityWithNotes = {
  id: string;
  title: string;
  created_at: string;
  notes: string | null;
};

export type CrmOperatorNote = {
  id: string;
  title: string;
  createdAt: string;
  note: string;
};

/**
 * Workflow notes have a structured preamble ending in "Nota: <typed text>".
 * Show the typed text prominently, without losing multiline data or
 * treating machine-generated metadata as a handwritten note.
 */
export function splitCrmActivityNotes(notes: string | null | undefined): {
  operatorNote: string | null;
  details: string | null;
} {
  const normalized = notes?.replace(/\r\n?/g, "\n").trim() || "";
  if (!normalized) return { operatorNote: null, details: null };

  const marker = normalized.match(/(?:^|\n)Nota:[ \t]*/);
  if (!marker || marker.index === undefined) {
    return { operatorNote: null, details: normalized };
  }

  const details = normalized.slice(0, marker.index).trim() || null;
  const operatorNote = normalized.slice(marker.index + marker[0].length).trim() || null;
  return { operatorNote, details };
}

/** Every previously saved operator note, newest first; no database changes. */
export function collectCrmOperatorNotes(activities: CrmActivityWithNotes[]): CrmOperatorNote[] {
  return activities
    .map((activity) => ({ activity, note: splitCrmActivityNotes(activity.notes).operatorNote }))
    .filter((item): item is { activity: CrmActivityWithNotes; note: string } => Boolean(item.note))
    .sort((left, right) => {
      const t1 = Date.parse(left.activity.created_at);
      const t2 = Date.parse(right.activity.created_at);
      return (Number.isNaN(t2) ? 0 : t2) - (Number.isNaN(t1) ? 0 : t1);
    })
    .map(({ activity, note }) => ({
      id: activity.id, title: activity.title, createdAt: activity.created_at, note,
    }));
}
