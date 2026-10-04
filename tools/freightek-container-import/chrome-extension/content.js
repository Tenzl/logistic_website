(function runFreightEkContentScript() {
  "use strict";

  const extractor = globalThis.FreightEkExtractor;
  const singletonKey = "__seatransFreightEkShipmentCollectorV2";
  if (globalThis[singletonKey]) {
    return;
  }
  let extractionPromise = null;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "EXTRACT_NOW") return false;
    if (!message.jobId) {
      sendResponse({ ok: true, started: false });
      return false;
    }
    runExtraction(message.jobId);
    sendResponse({ ok: true, started: true });
    return false;
  });

  function runExtraction(jobId) {
    if (!jobId) return;
    if (extractionPromise) return extractionPromise;
    extractionPromise = extractAndSend(jobId).finally(() => {
      extractionPromise = null;
    });
    return extractionPromise;
  }

  async function extractAndSend(jobId) {
    const shipmentId = extractor?.parseShipmentId(location.href);
    if (!extractor || !shipmentId) return;

    try {
      const result = await extractor.extractInstructionDocument(document, {
        timeoutMs: 60_000,
        pollMs: 500,
        stableCycles: 4,
        onProgress: (progress) =>
          sendSafely({
            type: "FREIGHTEK_EXTRACTION_PROGRESS",
            payload: { ...progress, shipmentId, jobId },
          }),
      });
      await sendSafely({
        type: "FREIGHTEK_EXTRACTION_RESULT",
        payload: {
          ...result,
          shipmentId,
          jobId,
          sourceUrl: `${location.origin}${location.pathname}`,
          collectedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      await sendSafely({
        type: "FREIGHTEK_EXTRACTION_ERROR",
        payload: {
          shipmentId,
          jobId,
          code: error?.code ?? "EXTRACTION_ERROR",
          message: error?.message ?? String(error),
          details: error?.details ?? null,
        },
      });
    }
  }

  async function sendSafely(message) {
    try {
      await chrome.runtime.sendMessage(message);
    } catch {
      // Extension reloads invalidate an old content-script context. The next
      // navigation injects a fresh instance and resumes from persisted state.
    }
  }

  globalThis[singletonKey] = { runExtraction };

  const shipmentId = extractor?.parseShipmentId(location.href);
  if (shipmentId) {
    chrome.runtime
      .sendMessage({ type: "FREIGHTEK_CONTENT_READY", shipmentId })
      .then((response) => {
        if (response?.ok && response.shouldExtract) return runExtraction(response.jobId);
        return undefined;
      })
      .catch(() => undefined);
  }
})();
