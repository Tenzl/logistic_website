import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInstructionUrl,
  isFreightEkAuthCallback,
  isFreightEkPage,
  parseInstructionUrl,
} from "../chrome-extension/lib/queue.js";

test("recognizes only the FreightEK authentication callback route", () => {
  assert.equal(
    isFreightEkAuthCallback("https://seatrans.freightek.com/auth/callback"),
    true,
  );
  assert.equal(
    isFreightEkAuthCallback(
      "https://seatrans.freightek.com/auth/callback?code=temporary",
    ),
    true,
  );
  assert.equal(
    isFreightEkAuthCallback("https://seatrans.freightek.com/auth/login"),
    false,
  );
  assert.equal(
    isFreightEkAuthCallback("https://example.com/auth/callback"),
    false,
  );
});

test("recognizes any authenticated FreightEK page as a collector host tab", () => {
  assert.equal(
    isFreightEkPage("https://seatrans.freightek.com/shipments/management"),
    true,
  );
  assert.equal(
    isFreightEkPage("https://seatrans.freightek.com/auth/callback"),
    true,
  );
  assert.equal(isFreightEkPage("https://example.com/shipments"), false);
  assert.equal(isFreightEkPage("not-a-url"), false);
});

test("instruction URLs replace only a validated Shipment ID path segment", () => {
  const url = buildInstructionUrl("s2608020");
  assert.equal(
    url,
    "https://seatrans.freightek.com/shipments/management/S2608020/instruction",
  );
  assert.deepEqual(parseInstructionUrl(`${url}?tab=containers`), {
    shipmentId: "S2608020",
    url,
  });
  assert.equal(
    parseInstructionUrl(
      "https://example.com/shipments/management/S2608020/instruction",
    ),
    null,
  );
  assert.throws(
    () => buildInstructionUrl("../../login"),
    /Invalid Shipment ID/,
  );
});
