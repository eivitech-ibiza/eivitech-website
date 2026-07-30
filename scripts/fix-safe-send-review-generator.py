#!/usr/bin/env python3
from pathlib import Path

path = Path(__file__).with_name("apply-safe-send-review-fixes.py")
content = path.read_text(encoding="utf-8")
old = 'replace_once("api/src/resendMarketing.ts", "      body: payload,\\n", "      body: updatePayload,\\n")'
new = '''content = read("api/src/resendMarketing.ts")
needle = "      body: payload,\\n"
if content.count(needle) != 2:
    raise RuntimeError(f"Expected two existing-contact payloads, found {content.count(needle)}")
content = content.replace(needle, "      body: updatePayload,\\n", 1)
write("api/src/resendMarketing.ts", content)'''
if content.count(old) != 1:
    raise RuntimeError("Expected generator line was not found exactly once")
path.write_text(content.replace(old, new, 1), encoding="utf-8")
Path(__file__).unlink()
print("Fixed safe-send review generator")
