# Modifiche strutturali Eivitech portfolio

Modifiche applicate:
- sostituiti i vecchi progetti con 6 nuovi progetti selezionati:
  1. Casa Vinya
  2. Casa Vadella
  3. Casa Mediterráneo
  4. Casa Charlie
  5. Casa Boas
  6. Proyecto Paisajismo Exterior
- rimossa dipendenza dagli asset pesanti in `src/assets`.
- tutte le immagini progetto sono ora attese in `public/media/projects/<slug>/`.
- aggiunte schede progetto con:
  - situazione iniziale;
  - obiettivo cliente;
  - interventi;
  - materiali/finiture;
  - risultato;
  - SEO title/description;
  - gallery per ogni progetto.
- aggiornata pagina progetti con logica “Selected projects”.
- aggiornata pagina dettaglio progetto.
- aggiornati related projects nei servizi.
- aggiunto fallback immagine se i file non sono ancora caricati.
- aggiunto promemoria operativo su autorizzazione uso immagini.

Importante:
prima del deploy caricare manualmente le immagini nelle cartelle indicate.
Verificare autorizzazioni/privacy/GDPR prima di pubblicare foto o video.
