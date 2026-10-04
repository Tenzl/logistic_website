export function extensionResourcePath(manifest, path) {
  const worker = manifest.background.service_worker;
  return `${worker.slice(0, worker.lastIndexOf("/") + 1)}${path}`;
}
