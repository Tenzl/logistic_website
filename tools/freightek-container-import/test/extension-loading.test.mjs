import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

test("the selected tool folder and chrome-extension folder both contain loadable manifests", async () => {
  for (const directory of ["../", "../chrome-extension/"]) {
    const root = new URL(directory, import.meta.url);
    const manifest = JSON.parse(await readFile(new URL("manifest.json", root), "utf8"));
    assert.equal(manifest.manifest_version, 3);
    const resources = [
      manifest.background.service_worker,
      manifest.action.default_popup,
      ...manifest.content_scripts.flatMap((script) => script.js),
    ];
    for (const path of resources) await access(new URL(path, root));
    const workerDirectory = new URL("./", new URL(manifest.background.service_worker, root));
    for (const path of ["lib/extract-table.js", "content.js"]) {
      await access(new URL(path, workerDirectory));
    }
  }
});

test("runtime resource paths resolve within the service worker directory for both install folders", async () => {
  const { extensionResourcePath } = await import("../chrome-extension/lib/resource-path.js");
  for (const prefix of ["", "chrome-extension/"]) {
    const manifest = { background: { service_worker: `${prefix}background.js` } };
    for (const path of ["lib/extract-table.js", "content.js"]) {
      assert.equal(extensionResourcePath(manifest, path), `${prefix}${path}`);
    }
  }
});
