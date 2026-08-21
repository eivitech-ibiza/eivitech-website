export type MarketingContentMode = "html" | "text";

const LEGAL_NOTICE_TEXT = `AVISO LEGAL: Este mensaje y sus archivos adjuntos van dirigidos exclusivamente a su destinatario, pudiendo contener información confidencial sometida a secreto profesional. No está permitida su comunicación, reproducción o distribución sin la autorización expresa del remitente. Si usted no es el destinatario final, por favor, elimínelo e infórmenos por esta vía.`;

const DATA_PROTECTION_TEXT = `PROTECCIÓN DE DATOS: De conformidad con lo dispuesto en el Reglamento (UE) 2016/679, de 27 de abril (GDPR), y la Ley Orgánica 3/2018, de 5 de diciembre (LOPDGDD), le informamos de que los datos personales y la dirección de correo electrónico del interesado se tratarán bajo la responsabilidad de EIVITECH PLUS SLU por un interés legítimo y para el envío de comunicaciones sobre nuestros productos y servicios, y se conservarán mientras ninguna de las partes se oponga a ello. Los datos no se comunicarán a terceros, salvo obligación legal. Le informamos de que puede ejercer los derechos de acceso, rectificación, portabilidad y supresión de sus datos y los de limitación y oposición a su tratamiento dirigiéndose a EIVITECH PLUS SL NIF/CIF: B75708115, C/ San Critofol 30, bloque 6, puerta 403, 07800 Ibiza, Illes Balears, España. E-mail: info@eivitech.com. Si considera que el tratamiento no se ajusta a la normativa vigente, podrá presentar una reclamación ante la autoridad de control en https://www.aepd.es/.`;

export const DEFAULT_TEXT_CAMPAIGN_CONTENT = `Ciao {{first_name}},

scrivi qui il contenuto della campagna Eivitech.



Un cordial saludo,
Equipo Eivitech
Reformas e instalaciones en Ibiza

EIVITECH PLUS SL
info@eivitech.com · +34 674 735 188

${LEGAL_NOTICE_TEXT}

${DATA_PROTECTION_TEXT}

Más información sobre el tratamiento de sus datos en nuestra Política de privacidad: https://eivitech.com/es/privacy-policy/

Si no desea recibir más comunicaciones comerciales de Eivitech, puede darse de baja aquí: {{unsubscribe_url}} o solicitarlo respondiendo a este mensaje. Su dirección será excluida de futuras comunicaciones comerciales.`;

export const DEFAULT_HTML_CAMPAIGN_CONTENT = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <style>
    @media only screen and (max-width: 600px) {
      body,.email-background{background-color:#fffdf9!important}.outer-padding{padding:0!important}.email-card{border:0!important;max-width:100%!important}.logo-cell{padding:22px 18px 18px!important;border-bottom:0!important}.logo-image{width:158px!important}.content-cell{padding:24px 18px 16px!important}.footer-cell{padding:24px 18px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4efe7;color:#41382f;font-family:Arial,Helvetica,sans-serif;">
  <table class="email-background" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f4efe7;">
    <tr><td class="outer-padding" align="center" style="padding:28px 12px;">
      <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background-color:#fffdf9;border:1px solid #ded3c4;">
        <tr><td class="logo-cell" style="padding:28px 36px 22px;border-bottom:1px solid #ded3c4;">
          <a href="https://eivitech.com/es/" style="text-decoration:none;color:#41382f;"><img class="logo-image" src="https://eivitech.com/media/brand/eivitech-logo.svg" width="170" alt="Eivitech" style="display:block;width:170px;max-width:100%;height:auto;border:0;"></a>
        </td></tr>
        <tr><td class="content-cell" style="padding:38px 36px 24px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">Ciao {{first_name}},</p>
          <p style="margin:0 0 48px;font-size:16px;line-height:1.7;">scrivi qui il contenuto della campagna Eivitech.</p>
          <p style="margin:0;font-size:16px;line-height:1.7;">Un cordial saludo,<br><strong>Equipo Eivitech</strong><br>Reformas e instalaciones en Ibiza</p>
        </td></tr>
        <tr><td class="footer-cell" style="padding:26px 36px;background-color:#41382f;color:#f4efe7;">
          <p style="margin:0 0 14px;font-size:13px;line-height:1.6;"><strong>EIVITECH PLUS SL</strong><br><a href="mailto:info@eivitech.com" style="color:#f4efe7;text-decoration:underline;">info@eivitech.com</a>&nbsp;·&nbsp;<a href="tel:+34674735188" style="color:#f4efe7;text-decoration:underline;">+34 674 735 188</a></p>
          <p style="margin:0 0 12px;font-size:11px;line-height:1.55;color:#ded3c4;"><strong>AVISO LEGAL:</strong> Este mensaje y sus archivos adjuntos van dirigidos exclusivamente a su destinatario, pudiendo contener información confidencial sometida a secreto profesional. No está permitida su comunicación, reproducción o distribución sin la autorización expresa del remitente. Si usted no es el destinatario final, por favor, elimínelo e infórmenos por esta vía.</p>
          <p style="margin:0 0 12px;font-size:11px;line-height:1.55;color:#ded3c4;"><strong>PROTECCIÓN DE DATOS:</strong> De conformidad con lo dispuesto en el Reglamento (UE) 2016/679, de 27 de abril (GDPR), y la Ley Orgánica 3/2018, de 5 de diciembre (LOPDGDD), le informamos de que los datos personales y la dirección de correo electrónico del interesado se tratarán bajo la responsabilidad de EIVITECH PLUS SLU por un interés legítimo y para el envío de comunicaciones sobre nuestros productos y servicios, y se conservarán mientras ninguna de las partes se oponga a ello. Los datos no se comunicarán a terceros, salvo obligación legal. Le informamos de que puede ejercer los derechos de acceso, rectificación, portabilidad y supresión de sus datos y los de limitación y oposición a su tratamiento dirigiéndose a EIVITECH PLUS SL NIF/CIF: B75708115, C/ San Critofol 30, bloque 6, puerta 403, 07800 Ibiza, Illes Balears, España. E-mail: <a href="mailto:info@eivitech.com" style="color:#f4efe7;text-decoration:underline;">info@eivitech.com</a>. Si considera que el tratamiento no se ajusta a la normativa vigente, podrá presentar una reclamación ante la autoridad de control en <a href="https://www.aepd.es/" style="color:#f4efe7;text-decoration:underline;">www.aepd.es</a>.</p>
          <p style="margin:0 0 12px;font-size:11px;line-height:1.55;color:#ded3c4;">Más información sobre el tratamiento de sus datos en nuestra <a href="https://eivitech.com/es/privacy-policy/" style="color:#f4efe7;text-decoration:underline;"><strong>Política de privacidad</strong></a>.</p>
          <p style="margin:0;font-size:11px;line-height:1.55;color:#ded3c4;">Si no desea recibir más comunicaciones comerciales de Eivitech, puede <a href="{{unsubscribe_url}}" style="color:#f4efe7;text-decoration:underline;"><strong>darse de baja aquí</strong></a> o solicitarlo respondiendo a este mensaje. Su dirección será excluida de futuras comunicaciones comerciales.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export function campaignContentMode(editorJson?: Record<string, unknown> | null): MarketingContentMode {
  return editorJson?.content_mode === "text" ? "text" : "html";
}

export function campaignTextContent(editorJson?: Record<string, unknown> | null) {
  const value = editorJson?.text_content;
  return typeof value === "string" ? value : DEFAULT_TEXT_CAMPAIGN_CONTENT;
}

export function htmlToPlainText(html: string) {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<\/h[1-6]\s*>/gi, "\n\n")
    .replace(/<\/div\s*>/gi, "\n")
    .replace(/<\/tr\s*>/gi, "\n")
    .replace(/<\/li\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&middot;/gi, "·")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function linkifyPlainText(value: string) {
  return escapeHtml(value)
    .replace(/\{\{unsubscribe_url\}\}/g, '<a href="{{unsubscribe_url}}" style="color:#f4efe7;text-decoration:underline;">darse de baja aquí</a>')
    .replace(/https:\/\/eivitech\.com\/es\/privacy-policy\//g, '<a href="https://eivitech.com/es/privacy-policy/" style="color:#f4efe7;text-decoration:underline;">https://eivitech.com/es/privacy-policy/</a>')
    .replace(/https:\/\/www\.aepd\.es\//g, '<a href="https://www.aepd.es/" style="color:#f4efe7;text-decoration:underline;">https://www.aepd.es/</a>')
    .replace(/info@eivitech\.com/g, '<a href="mailto:info@eivitech.com" style="color:inherit;text-decoration:underline;">info@eivitech.com</a>');
}

export function plainTextToBrandedHtml(text: string) {
  const splitMarker = "EIVITECH PLUS SL";
  const markerIndex = text.indexOf(splitMarker);
  const bodyText = markerIndex >= 0 ? text.slice(0, markerIndex).trim() : text.trim();
  const footerText = markerIndex >= 0 ? text.slice(markerIndex).trim() : "";
  const bodyHtml = bodyText.split(/\n{2,}/).map((block) => `<p style="margin:0 0 18px;font-size:16px;line-height:1.7;">${escapeHtml(block).replace(/\n/g, "<br>")}</p>`).join("\n");
  const footerHtml = footerText ? footerText.split(/\n{2,}/).map((block) => `<p style="margin:0 0 12px;font-size:11px;line-height:1.55;color:#ded3c4;">${linkifyPlainText(block).replace(/\n/g, "<br>")}</p>`).join("\n") : "";

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f4efe7;color:#41382f;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4efe7"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#fffdf9;border:1px solid #ded3c4"><tr><td style="padding:28px 36px 22px;border-bottom:1px solid #ded3c4"><img src="https://eivitech.com/media/brand/eivitech-logo.svg" width="170" alt="Eivitech" style="display:block;max-width:100%;height:auto;border:0"></td></tr><tr><td style="padding:38px 36px 24px">${bodyHtml}</td></tr>${footerHtml ? `<tr><td style="padding:26px 36px;background:#41382f;color:#f4efe7">${footerHtml}</td></tr>` : ""}</table></td></tr></table></body></html>`;
}

export function campaignPreviewHtml(campaign: { html?: string | null; editor_json?: Record<string, unknown> | null }) {
  if (campaignContentMode(campaign.editor_json) === "text") {
    const text = campaignTextContent(campaign.editor_json);
    return `<!doctype html><html><body style="margin:0;padding:32px;background:#fff;color:#2d2723;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;white-space:pre-wrap">${escapeHtml(text)}</body></html>`;
  }
  return campaign.html || "";
}
