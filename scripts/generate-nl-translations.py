#!/usr/bin/env python3
"""Generate Dutch translations for static tr(es, it, en) calls.

This helper is used only during the localization work. It extracts the English
argument from static calls, translates each unique string with Argos Translate,
and writes a JSON map keyed by the exact English source string.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from argostranslate import package, translate

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "src"
OUTPUT = ROOT / "nl-translations.generated.json"


def scan_tr_calls(text: str):
    calls: list[str] = []
    i = 0
    while i < len(text) - 2:
        if text.startswith("tr(", i) and (i == 0 or not (text[i - 1].isalnum() or text[i - 1] in "_$")):
            start = i
            j = i + 3
            depth = 1
            quote: str | None = None
            escaped = False
            while j < len(text) and depth > 0:
                char = text[j]
                if quote:
                    if escaped:
                        escaped = False
                    elif char == "\\":
                        escaped = True
                    elif char == quote:
                        quote = None
                else:
                    if char in "'\"`":
                        quote = char
                    elif char == "(":
                        depth += 1
                    elif char == ")":
                        depth -= 1
                j += 1
            if depth == 0:
                calls.append(text[start:j])
                i = j
                continue
        i += 1
    return calls


def split_arguments(call: str):
    inner = call[3:-1]
    args: list[str] = []
    start = 0
    depth = 0
    quote: str | None = None
    escaped = False
    for index, char in enumerate(inner):
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            continue
        if char in "'\"`":
            quote = char
        elif char in "([{":
            depth += 1
        elif char in ")]}":
            depth -= 1
        elif char == "," and depth == 0:
            args.append(inner[start:index].strip())
            start = index + 1
    args.append(inner[start:].strip())
    return args


def decode_static_literal(value: str):
    value = value.strip()
    if len(value) < 2 or value[0] != value[-1] or value[0] not in "'\"`":
        return None
    if value[0] == "`" and "${" in value:
        return None
    if value[0] == '"':
        return json.loads(value)
    body = value[1:-1]
    return bytes(body, "utf-8").decode("unicode_escape")


def install_model():
    package.update_package_index()
    available = package.get_available_packages()
    model = next((item for item in available if item.from_code == "en" and item.to_code == "nl"), None)
    if model is None:
        raise RuntimeError("Argos English-to-Dutch package was not found")
    package.install_from_path(model.download())


def protect_tokens(value: str):
    tokens: dict[str, str] = {}

    def replace(match: re.Match[str]):
        key = f"ZXQPLACEHOLDER{len(tokens)}QXZ"
        tokens[key] = match.group(0)
        return key

    protected = re.sub(r"\{[^{}]+\}|%[sd]|https?://\S+|\b[A-Z][A-Z0-9_]{2,}\b", replace, value)
    return protected, tokens


def restore_tokens(value: str, tokens: dict[str, str]):
    output = value
    for key, original in tokens.items():
        output = output.replace(key, original)
        output = output.replace(key.lower(), original)
    return output


def main():
    strings: list[str] = []
    for path in sorted(SOURCE_ROOT.rglob("*")):
        if path.suffix not in {".ts", ".tsx"}:
            continue
        for call in scan_tr_calls(path.read_text(encoding="utf-8")):
            args = split_arguments(call)
            if len(args) != 3:
                continue
            english = decode_static_literal(args[2])
            if english is not None and english not in strings:
                strings.append(english)

    install_model()
    output: dict[str, str] = {}
    for index, source in enumerate(strings, start=1):
        protected, tokens = protect_tokens(source)
        translated = translate.translate(protected, "en", "nl")
        output[source] = restore_tokens(translated, tokens)
        if index % 50 == 0:
            print(f"Translated {index}/{len(strings)}")

    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(output)} translations to {OUTPUT}")


if __name__ == "__main__":
    main()
