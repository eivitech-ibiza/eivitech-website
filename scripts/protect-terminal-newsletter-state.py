from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    source = file_path.read_text(encoding="utf-8")
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one match in {path}, found {count}: {old[:180]!r}")
    file_path.write_text(source.replace(old, new, 1), encoding="utf-8")
    print(f"updated {path}")


replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''     WHERE id = $4
       AND (status <> 'paused' OR $1 IN ('sent', 'cancelled'))
     RETURNING status`,
''',
    '''     WHERE id = $4
       AND (
         status IN ('draft', 'scheduled', 'sending')
         OR (status = 'paused' AND $1 IN ('sent', 'cancelled'))
         OR (status = 'cancelled' AND $1 = 'sent')
       )
     RETURNING status`,
''',
)

replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''    const cancellationPending = localStatus === "paused";
    return res.status(localStatus === "sent" ? 200 : 202).json({
      ok: !cancellationPending,
      status: localStatus,
      code: cancellationPending ? "CANCEL_ACCEPTANCE_PENDING" : undefined,
      message: cancellationPending
        ? "L'invio è stato accettato, ma è già in corso una richiesta di annullamento."
        : undefined,
''',
    '''    const cancellationState = localStatus === "paused" || localStatus === "cancelled";
    return res.status(localStatus === "sent" ? 200 : 202).json({
      ok: !cancellationState,
      status: localStatus,
      code: localStatus === "cancelled"
        ? "SEND_CANCELLED_DURING_ACCEPTANCE"
        : cancellationState
          ? "CANCEL_ACCEPTANCE_PENDING"
          : undefined,
      message: localStatus === "cancelled"
        ? "Resend ha confermato l'annullamento mentre la richiesta di invio era ancora in corso."
        : cancellationState
          ? "L'invio è stato accettato, ma è già in corso una richiesta di annullamento."
          : undefined,
''',
)

replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''        const cancellationPending = recoveredStatus === "paused";
        return res.status(recoveredStatus === "sent" ? 200 : 202).json({
          ok: !cancellationPending,
          status: recoveredStatus,
          code: cancellationPending ? "CANCEL_ACCEPTANCE_PENDING" : undefined,
          message: cancellationPending
            ? "L'invio è stato accettato, ma è già in corso una richiesta di annullamento."
            : undefined,
''',
    '''        const cancellationState = recoveredStatus === "paused" || recoveredStatus === "cancelled";
        return res.status(recoveredStatus === "sent" ? 200 : 202).json({
          ok: !cancellationState,
          status: recoveredStatus,
          code: recoveredStatus === "cancelled"
            ? "SEND_CANCELLED_DURING_ACCEPTANCE"
            : cancellationState
              ? "CANCEL_ACCEPTANCE_PENDING"
              : undefined,
          message: recoveredStatus === "cancelled"
            ? "Resend ha confermato l'annullamento mentre la richiesta di invio era ancora in corso."
            : cancellationState
              ? "L'invio è stato accettato, ma è già in corso una richiesta di annullamento."
              : undefined,
''',
)

replace_once(
    "src/components/marketing/CampaignWorkspace.tsx",
    '''      if (!result.ok && result.status === "paused") {
        setNotice(tr(
          "El envío fue aceptado, pero la cancelación ya está en verificación.",
          "L’invio è stato accettato, ma l’annullamento è già in verifica.",
          "The send was accepted, but cancellation is already being verified.",
          "De verzending is geaccepteerd, maar de annulering wordt al gecontroleerd.",
        ));
      } else if (!result.ok) {
''',
    '''      if (!result.ok && result.status === "cancelled") {
        setNotice(tr(
          "Resend confirmó la cancelación antes de completar el envío.",
          "Resend ha confermato l’annullamento prima del completamento dell’invio.",
          "Resend confirmed cancellation before the send completed.",
          "Resend heeft de annulering bevestigd voordat de verzending was voltooid.",
        ));
      } else if (!result.ok && result.status === "paused") {
        setNotice(tr(
          "El envío fue aceptado, pero la cancelación ya está en verificación.",
          "L’invio è stato accettato, ma l’annullamento è già in verifica.",
          "The send was accepted, but cancellation is already being verified.",
          "De verzending is geaccepteerd, maar de annulering wordt al gecontroleerd.",
        ));
      } else if (!result.ok) {
''',
)

replace_once(
    "api/src/marketingConcurrencyIntegration.test.ts",
    '''test("cancellation claims cannot be overwritten by a queued-state reconciliation", () => {
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  const metrics = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(delivery, /status <> 'paused'/);
  assert.match(delivery, /\$1 IN \('sent', 'cancelled'\)/);
  assert.match(metrics, /campaign\.status === "paused"/);
  assert.match(metrics, /AND status = \$5/);
});
''',
    '''test("cancellation claims and terminal states cannot be overwritten by stale queued reconciliation", () => {
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  const metrics = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(delivery, /status IN \('draft', 'scheduled', 'sending'\)/);
  assert.match(delivery, /status = 'paused' AND \$1 IN \('sent', 'cancelled'\)/);
  assert.match(delivery, /status = 'cancelled' AND \$1 = 'sent'/);
  assert.match(delivery, /SEND_CANCELLED_DURING_ACCEPTANCE/);
  assert.match(metrics, /campaign\.status === "paused"/);
  assert.match(metrics, /AND status = \$5/);
});
''',
)

replace_once(
    "scripts/marketing-scheduling.test.mjs",
    '''  assert.match(workspace, /Annullamento in verifica/);
''',
    '''  assert.match(workspace, /Annullamento in verifica/);
  assert.match(workspace, /Resend ha confermato l’annullamento/);
''',
)

print("terminal newsletter state protection applied")
