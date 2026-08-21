import type { Dispatch, SetStateAction } from "react";
import type { MarketingCampaignInput } from "@/lib/marketing";
import {
  DEFAULT_HTML_CAMPAIGN_CONTENT,
  DEFAULT_TEXT_CAMPAIGN_CONTENT,
  campaignContentMode,
  campaignTextContent,
  htmlToPlainText,
  plainTextToBrandedHtml,
  type MarketingContentMode,
} from "@/lib/marketingCampaignContent";

type Props = {
  form: MarketingCampaignInput;
  setForm: Dispatch<SetStateAction<MarketingCampaignInput>>;
};

function editorJson(form: MarketingCampaignInput) {
  return (form.editor_json || {}) as Record<string, unknown>;
}

export function CampaignContentEditor({ form, setForm }: Props) {
  const mode = campaignContentMode(form.editor_json);
  const textValue = campaignTextContent(form.editor_json);

  function switchMode(nextMode: MarketingContentMode) {
    if (nextMode === mode) return;

    setForm((current) => {
      const currentEditor = editorJson(current);
      if (nextMode === "text") {
        const currentHtml = current.html || "";
        const nextText = currentHtml.trim() === DEFAULT_HTML_CAMPAIGN_CONTENT.trim()
          ? DEFAULT_TEXT_CAMPAIGN_CONTENT
          : htmlToPlainText(currentHtml);
        return {
          ...current,
          editor_json: {
            ...currentEditor,
            content_mode: "text",
            text_content: nextText,
          },
        };
      }

      const currentText = typeof currentEditor.text_content === "string"
        ? currentEditor.text_content
        : DEFAULT_TEXT_CAMPAIGN_CONTENT;
      const nextHtml = currentText.trim() === DEFAULT_TEXT_CAMPAIGN_CONTENT.trim()
        ? DEFAULT_HTML_CAMPAIGN_CONTENT
        : plainTextToBrandedHtml(currentText);
      return {
        ...current,
        html: nextHtml,
        editor_json: {
          ...currentEditor,
          content_mode: "html",
          text_content: currentText,
        },
      };
    });
  }

  return <div className="space-y-2">
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => switchMode("html")}
        className={`rounded-sm border px-3 py-2 text-xs font-medium transition ${mode === "html" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}
      >
        HTML
      </button>
      <button
        type="button"
        onClick={() => switchMode("text")}
        className={`rounded-sm border px-3 py-2 text-xs font-medium transition ${mode === "text" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}
      >
        Testo normale
      </button>
    </div>

    {mode === "html" ? (
      <textarea
        aria-label="Contenuto HTML"
        className="min-h-96 w-full rounded-sm border border-border bg-background px-3 py-3 font-mono text-xs leading-relaxed"
        value={form.html || ""}
        onChange={(event) => setForm((current) => ({ ...current, html: event.target.value }))}
      />
    ) : (
      <>
        <textarea
          aria-label="Contenuto testo normale"
          className="min-h-96 w-full rounded-sm border border-border bg-background px-4 py-3 font-sans text-sm leading-relaxed"
          value={textValue}
          onChange={(event) => setForm((current) => ({
            ...current,
            editor_json: {
              ...(current.editor_json || {}),
              content_mode: "text",
              text_content: event.target.value,
            },
          }))}
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Il messaggio verrà inviato come vero testo semplice. Nell’editor e nell’anteprima usiamo un carattere sans-serif professionale; il font visualizzato dal destinatario dipende dal suo programma di posta.
        </p>
      </>
    )}
  </div>;
}
