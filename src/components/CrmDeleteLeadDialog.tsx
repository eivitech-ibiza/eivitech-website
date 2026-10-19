import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { tr } from "@/lib/i18n";

type Props = {
  leadId: string;
  name: string;
  email: string;
  busy: boolean;
  onDelete: () => Promise<void>;
};

/**
 * Requiring an exact email confirmation makes accidental deletion of a real
 * customer much harder than a single native confirm() click.
 */
export function CrmDeleteLeadDialog({ leadId, name, email, busy, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [typedEmail, setTypedEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmed = typedEmail.trim().toLowerCase() === email.trim().toLowerCase();
  const disabled = busy || submitting;
  const inputId = `delete-lead-confirm-${leadId}`;

  function changeOpen(nextOpen: boolean) {
    if (submitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setTypedEmail("");
      setError(null);
    }
  }

  async function confirmDeletion() {
    if (!confirmed || disabled) return;
    setSubmitting(true);
    setError(null);
    try {
      await onDelete();
      setOpen(false);
      setTypedEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : tr(
        "No se ha podido eliminar el contacto. Inténtalo de nuevo.",
        "Impossibile eliminare il contatto. Riprova.",
        "Could not delete the contact. Please retry.",
        "Kan het contact niet verwijderen. Probeer het opnieuw.",
      ));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={changeOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={disabled || !email}
          className="inline-flex items-center gap-2 rounded-sm border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={tr(`Eliminar del CRM a ${name}`, `Elimina ${name} dal CRM`, `Delete ${name} from CRM`, `Verwijder ${name} uit CRM`)}
        >
          <Trash2 size={14} />
          {tr("Eliminar contacto", "Elimina contatto", "Delete contact", "Contact verwijderen")}
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {tr("¿Eliminar definitivamente este contacto?", "Eliminare definitivamente questo contatto?", "Permanently delete this contact?", "Dit contact definitief verwijderen?")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="mt-2 block font-semibold text-foreground">{name} — {email}</span>
            <span className="mt-2 block">
              {tr(
                "Se eliminarán su ficha del CRM y las actividades asociadas. Esta acción no se puede deshacer.",
                "Verranno eliminati la scheda CRM e le attività associate. Questa azione non può essere annullata.",
                "The CRM record and related activities will be deleted. This cannot be undone.",
                "De CRM-vermelding en bijbehorende activiteiten worden verwijderd. Dit kan niet ongedaan worden gemaakt.",
              )}
            </span>
            <span className="mt-2 block">
              {tr(
                "La lista de correo y los eventos Meta ya enviados no se eliminan. Los leads Meta eliminados no volverán a importarse.",
                "La mailing list e gli eventi Meta già inviati non vengono eliminati. I lead Meta cancellati non saranno reimportati.",
                "The mailing list and previously sent Meta events are kept. Deleted Meta leads will not be reimported.",
                "De mailinglijst en eerder verzonden Meta-gebeurtenissen blijven behouden. Verwijderde Meta-leads worden niet opnieuw geïmporteerd.",
              )}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
            {tr("Para confirmar, escribe el correo electrónico del contacto:", "Per confermare, digita l'email del contatto:", "To confirm, type the contact's email:", "Typ ter bevestiging het e-mailadres van het contact:")}
          </label>
          <input
            id={inputId}
            type="email"
            autoComplete="off"
            spellCheck={false}
            value={typedEmail}
            onChange={(event) => setTypedEmail(event.target.value)}
            disabled={disabled}
            placeholder={email}
            className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20"
          />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={disabled}>
            {tr("Cancelar", "Annulla", "Cancel", "Annuleren")}
          </AlertDialogCancel>
          <button
            type="button"
            disabled={!confirmed || disabled}
            onClick={() => void confirmDeletion()}
            className="inline-flex items-center justify-center rounded-sm bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? tr("Eliminando…", "Eliminazione…", "Deleting…", "Bezig met verwijderen…")
              : tr("Eliminar definitivamente", "Elimina definitivamente", "Delete permanently", "Definitief verwijderen")}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
