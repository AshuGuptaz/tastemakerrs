import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePhotoDataUrl, isAllowedPhotoDataUrl, reviewPhotoUrl, reviewPhotoUrls } from "../lib/review-photos";

const PNG = "data:image/png;base64,iVBORw0KGgo=";

test("accepts raster data URLs and decodes them", () => {
  const p = parsePhotoDataUrl(PNG)!;
  assert.equal(p.mime, "image/png");
  assert.equal(p.bytes.subarray(1, 4).toString(), "PNG");
  for (const t of ["jpeg", "webp", "gif"]) assert.equal(isAllowedPhotoDataUrl(`data:image/${t};base64,AAAA`), true);
});

test("refuses SVG (script-capable when served from our origin) and other non-raster", () => {
  assert.equal(isAllowedPhotoDataUrl("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="), false);
  assert.equal(isAllowedPhotoDataUrl("data:image/svg+xml,<svg onload=alert(1)>"), false);
  assert.equal(isAllowedPhotoDataUrl("data:text/html;base64,PHNjcmlwdD4="), false);
  assert.equal(isAllowedPhotoDataUrl("data:image/png;charset=utf-8;base64,AAAA"), false); // extra params
});

test("refuses malformed / empty / non-base64 payloads", () => {
  assert.equal(isAllowedPhotoDataUrl(""), false);
  assert.equal(isAllowedPhotoDataUrl("https://evil.example/x.png"), false);
  assert.equal(isAllowedPhotoDataUrl("data:image/png;base64,"), false);
  assert.equal(isAllowedPhotoDataUrl("data:image/png;base64,not base64!!"), false);
  assert.equal(isAllowedPhotoDataUrl("data:image/png,rawbytes"), false);
});

test("urls: stable, indexed, version-busted, count-driven", () => {
  assert.equal(reviewPhotoUrl("abc", 2), "/api/reviews/photo/abc/2");
  assert.equal(reviewPhotoUrl("abc", 0, new Date("2026-08-01T00:00:00Z")), "/api/reviews/photo/abc/0?v=1785542400000");
  assert.deepEqual(reviewPhotoUrls("abc", 2), ["/api/reviews/photo/abc/0", "/api/reviews/photo/abc/1"]);
  assert.deepEqual(reviewPhotoUrls("abc", 0), []);
  assert.deepEqual(reviewPhotoUrls("abc", -3), []);
});
