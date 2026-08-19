# Email marketing — unsubscribe link

## Editor contract

Campaign HTML authored in the Eivitech CRM must use the simple editor merge tag below:

```html
<a href="{{unsubscribe_url}}">darse de baja aquí</a>
```

`{{unsubscribe_url}}` is the public contract exposed to campaign authors. The backend converts it at broadcast-render time to Resend's native per-recipient unsubscribe placeholder:

```text
{{{RESEND_UNSUBSCRIBE_URL}}}
```

This keeps campaign HTML provider-agnostic while preserving Resend's unique unsubscribe URL for each recipient.

## Footer behavior

- If campaign HTML already contains `{{unsubscribe_url}}`, the backend does not append its fallback unsubscribe footer.
- If the campaign does not contain an unsubscribe merge tag, the backend appends the existing safety footer containing Resend's unsubscribe placeholder.
- Test emails replace `{{unsubscribe_url}}` with `#unsubscribe-test`, so a test cannot unsubscribe a real contact.

## CRM synchronization

Resend `contact.updated` webhook events with `unsubscribed: true` are persisted by the Eivitech backend and update the matching CRM contact to `unsubscribed`, set `marketing_consent = false`, and record the consent-history event.
