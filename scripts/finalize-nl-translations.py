#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "nl-translations.generated.json"
DESTINATION = ROOT / "src" / "lib" / "nlTranslations.generated.json"
OVERRIDE_FILES = [
    ROOT / "scripts" / "nl-overrides-1.json",
    ROOT / "scripts" / "nl-overrides-2.json",
]

DYNAMIC_TRANSLATIONS = {
    "EIVITECH PLUS SL uses technologies required for the website to work. Analytics, advertising, remarketing, Meta Pixel and Google campaign measurement are activated only with your consent.": "EIVITECH PLUS SL gebruikt noodzakelijke technologieën om de website te laten werken. Analytics, advertenties, remarketing, Meta Pixel en meting van Google-campagnes worden alleen geactiveerd met jouw toestemming.",
    "Legal notice, terms of use and identification details for EIVITECH PLUS SL.": "Juridische kennisgeving, gebruiksvoorwaarden en identificatiegegevens van EIVITECH PLUS SL.",
    "This document governs access to and use of eivitech.com and complies with Spanish Law 34/2002 on information society services and electronic commerce (LSSI-CE).": "Dit document regelt de toegang tot en het gebruik van eivitech.com en voldoet aan de Spaanse wet 34/2002 inzake diensten van de informatiemaatschappij en elektronische handel (LSSI-CE).",
    "Reports concerning possible infringements may be sent to info@eivitech.com.": "Meldingen over mogelijke inbreuken kunnen worden gestuurd naar info@eivitech.com.",
    "Last updated: 10 July 2026. This policy incorporates EIVITECH PLUS SL's legal documentation and explains the actual use of cookies, local storage and similar technologies on eivitech.com.": "Laatst bijgewerkt: 10 juli 2026. Dit beleid maakt deel uit van de juridische documentatie van EIVITECH PLUS SL en beschrijft het werkelijke gebruik van cookies, lokale opslag en vergelijkbare technologieën op eivitech.com.",
    "Maximum 24 months.": "Maximaal 24 maanden.",
    "The selection is retained for no longer than 24 months and may be withdrawn or changed at any time through the button on this page and in the footer. If purposes or third parties change significantly, a new decision may be requested.": "De keuze wordt maximaal 24 maanden bewaard en kan op elk moment worden ingetrokken of gewijzigd via de knop op deze pagina en in de footer. Als doeleinden of derden wezenlijk veranderen, kan opnieuw om een keuze worden gevraagd.",
    "Information about how EIVITECH PLUS SL processes personal data received through the website, forms, CRM, email, social networks and advertising campaigns.": "Informatie over hoe EIVITECH PLUS SL persoonsgegevens verwerkt die via de website, formulieren, het CRM, e-mail, sociale media en advertentiecampagnes worden ontvangen.",
    "Last updated: 10 July 2026. This policy incorporates EIVITECH PLUS SL's legal documentation and describes processing through the website, forms, CRM, email, social networks and advertising tools.": "Laatst bijgewerkt: 10 juli 2026. Dit beleid maakt deel uit van de juridische documentatie van EIVITECH PLUS SL en beschrijft de verwerking via de website, formulieren, het CRM, e-mail, sociale media en advertentietools.",
    "Enquiries and leads without a contractual relationship: up to 24 months from the last contact, unless required for legal obligations or claims.": "Aanvragen en leads zonder contractuele relatie: maximaal 24 maanden na het laatste contact, tenzij bewaring noodzakelijk is vanwege wettelijke verplichtingen of rechtsvorderingen.",
    "Cookie preferences: for no longer than 24 months, unless withdrawn earlier.": "Cookievoorkeuren: maximaal 24 maanden, tenzij ze eerder worden ingetrokken.",
    "Messages sent by EIVITECH PLUS SL and their attachments are intended exclusively for their recipients and may contain confidential or professionally privileged information. If you receive a message in error, delete it and notify the sender.": "Berichten van EIVITECH PLUS SL en de bijlagen daarbij zijn uitsluitend bestemd voor de geadresseerden en kunnen vertrouwelijke of beroepsmatig beschermde informatie bevatten. Ontvang je een bericht per vergissing, verwijder het dan en informeer de afzender.",
    "GitHub Pages, for frontend hosting": "GitHub Pages, voor de hosting van de frontend",
    "Railway, for the backend, CRM and database": "Railway, voor de backend, het CRM en de database",
    "Resend, for email notifications when enabled": "Resend, voor e-mailmeldingen wanneer deze functie is ingeschakeld",
    "Clerk, for authentication and private-area access when enabled": "Clerk, voor authenticatie en toegang tot het privégedeelte wanneer deze functie is ingeschakeld",
    "Google Tag Manager, Google Analytics 4 and Google Ads, when configured and consent has been given": "Google Tag Manager, Google Analytics 4 en Google Ads, wanneer deze zijn geconfigureerd en toestemming is gegeven",
    "Meta Pixel and Meta Conversions API, when configured and the relevant legal basis applies": "Meta Pixel en Meta Conversions API, wanneer deze zijn geconfigureerd en de relevante rechtsgrond van toepassing is",
}


def improve(value: str, english: str) -> str:
    replacements = [
        (r"\bUw\b", "Jouw"),
        (r"\buw\b", "jouw"),
        (r"\bU\b", "Je"),
        (r"\bu\b", "je"),
        (r"\buzelf\b", "jezelf"),
        (r"\bUzelf\b", "Jezelf"),
    ]
    for pattern, replacement in replacements:
        value = re.sub(pattern, replacement, value)

    literal_replacements = [
        ("op de spoorweg", "op Railway"),
        ("Deze vorm", "Dit formulier"),
        ("in een vorm", "in een formulier"),
        ("toestemming management", "toestemmingsbeheer"),
        ("ZXQ PLACEHOLDER0QXZ", "CRM"),
        ("dubbele ijdelheid", "dubbele wastafel"),
        ("Natuursteen bekken", "Natuurstenen wastafel"),
        ("natuursteen bekken", "natuurstenen wastafel"),
        ("wandgemonteerd kranen", "wandkranen"),
        ("ontspan gebied", "ontspanningsruimte"),
        ("weinig onderhoud landschapsarchitectuur", "onderhoudsarme landschapsinrichting"),
        ("voorzichtige afwerkingen", "zorgvuldige afwerkingen"),
        ("Voorzichtige afwerkingen", "Zorgvuldige afwerkingen"),
        ("voorzichtig afmaken", "zorgvuldige afwerkingen"),
        ("herziening", "beoordeling"),
        ("Herziening", "Beoordeling"),
        ("Overhandiging", "Oplevering"),
        ("overhandiging", "oplevering"),
        ("Particuliere CRM", "Privé-CRM"),
        ("Privéterrein", "Privégedeelte"),
        ("Contactpersoon:", "Contact |"),
        ("Contactpersoon", "Contact"),
        ("Onderneming", "Bedrijf"),
        ("Mededeling", "Juridische kennisgeving"),
        ("op WhatsApp", "via WhatsApp"),
        ("door WhatsApp", "via WhatsApp"),
        ("voettekst", "footer"),
        ("facultatief", "optioneel"),
        ("respons", "antwoord"),
        ("processors", "verwerkers"),
        ("afwerkingen die leeftijd natuurlijk", "afwerkingen die mooi verouderen"),
        ("eigendom transformaties", "vastgoedtransformaties"),
        ("eigendomstransformatie", "vastgoedtransformatie"),
        ("Property transformaties", "Vastgoedtransformaties"),
        ("property transformaties", "vastgoedtransformaties"),
    ]
    for source, target in literal_replacements:
        value = value.replace(source, target)

    lowered = english.lower()
    if "property" in lowered and not any(
        phrase in lowered for phrase in ("intellectual property", "industrial property", "property law")
    ):
        value = value.replace("eigenschap", "pand").replace("Eigenschap", "Pand")
        value = value.replace("je eigendom", "je woning").replace("jouw eigendom", "jouw woning")
        value = value.replace("eigendom", "vastgoed")

    return value


def main() -> None:
    translations = json.loads(SOURCE.read_text(encoding="utf-8"))
    translations = {english: improve(dutch, english) for english, dutch in translations.items()}

    for path in OVERRIDE_FILES:
        translations.update(json.loads(path.read_text(encoding="utf-8")))

    translations.update(DYNAMIC_TRANSLATIONS)
    translations["en-GB"] = "nl-NL"

    if any(not value.strip() or "ZXQ" in value for value in translations.values()):
        raise RuntimeError("Dutch translation output contains empty values or unresolved placeholders")

    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    DESTINATION.write_text(
        json.dumps(dict(sorted(translations.items())), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(translations)} final Dutch translations to {DESTINATION}")


if __name__ == "__main__":
    main()
