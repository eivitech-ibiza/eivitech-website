import assert from "node:assert/strict";
import test from "node:test";
import { normalizeMetaWebConfigInput, validateMetaPixelId } from "./meta/configValidation.js";

test("Meta Pixel IDs accept decimal asset identifiers and reject unsafe input", () => {
  assert.equal(validateMetaPixelId("123456789012345"), true);
  assert.equal(validateMetaPixelId(" 123456789012345 "), true);
  assert.equal(validateMetaPixelId("abc123"), false);
  assert.equal(validateMetaPixelId("123<script>"), false);
});

test("Meta web config cannot be enabled without a valid Pixel ID", () => {
  assert.deepEqual(normalizeMetaWebConfigInput({ pixelId: "", enabled: false }), {
    pixelId: null,
    enabled: false,
  });

  assert.throws(
    () => normalizeMetaWebConfigInput({ pixelId: "", enabled: true }),
    /valid Meta Pixel ID/i,
  );

  assert.deepEqual(
    normalizeMetaWebConfigInput({ pixelId: " 123456789012345 ", enabled: true }),
    { pixelId: "123456789012345", enabled: true },
  );
});
