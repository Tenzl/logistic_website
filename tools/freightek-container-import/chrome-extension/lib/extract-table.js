(function registerFreightEkExtractor(globalScope) {
  "use strict";

  const FIELD_DEFINITIONS = [
    { key: "type", labels: ["type"], expectedIndex: 1, required: true },
    {
      key: "containerNo",
      labels: ["container no", "container number"],
      expectedIndex: 2,
      required: true,
    },
    {
      key: "sealNo",
      labels: ["seal no", "seal number"],
      expectedIndex: 3,
      required: true,
    },
    {
      key: "grossWeight",
      labels: ["gross weight"],
      expectedIndex: 4,
      required: true,
    },
    {
      key: "measurement",
      labels: ["measurement", "measurement cbm"],
      expectedIndex: 5,
      required: true,
    },
    { key: "tare", labels: ["tare"], expectedIndex: 6, required: true },
    {
      key: "packageType",
      labels: ["package type"],
      expectedIndex: 7,
      required: true,
    },
    {
      key: "noOfPkgs",
      labels: ["no of pkgs", "number of pkgs", "no of packages"],
      expectedIndex: 8,
      required: true,
    },
    {
      key: "overWeight",
      labels: ["over weight", "overweight", "o w", "ow"],
      expectedIndex: 9,
      required: false,
    },
    {
      key: "netWeight",
      labels: ["net weight"],
      expectedIndex: 10,
      required: false,
    },
    {
      key: "maxGrossWeight",
      labels: ["max gross weight", "maximum gross weight"],
      expectedIndex: 11,
      required: false,
    },
    { key: "vgm", labels: ["vgm"], expectedIndex: 12, required: false },
    {
      key: "note",
      labels: ["note", "remark"],
      expectedIndex: 13,
      required: true,
    },
    { key: "method", labels: ["method"], expectedIndex: 14, required: true },
  ];

  class ExtractionError extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.name = "ExtractionError";
      this.code = code;
      this.details = details;
    }
  }

  function normalizeLabel(value) {
    return String(value ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/[().:_/\\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function cleanText(value) {
    return String(value ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isExcludedPageControl(element) {
    if (!element || element.matches?.('input[type="hidden"]')) return true;
    return Boolean(
      element.closest?.(
        ".el-table, .el-select-dropdown, .el-autocomplete-suggestion, .el-dialog__wrapper, .el-pagination",
      ),
    );
  }

  function readLivePageControl(element, controlIndex) {
    const tag = element.tagName.toLowerCase();
    const inputType =
      tag === "textarea"
        ? "textarea"
        : tag === "select"
          ? element.multiple
            ? "select-multiple"
            : "select"
          : element.getAttribute("contenteditable") === "true"
            ? "contenteditable"
            : (element.type || tag).toLowerCase();
    let value;
    if (inputType === "contenteditable") {
      value = cleanText(element.textContent);
    } else if (inputType === "select-multiple") {
      value = Array.from(element.selectedOptions ?? [], (option) =>
        cleanText(option.value || option.textContent),
      );
    } else if (inputType === "file") {
      value = Array.from(element.files ?? [], (file) => file.name);
    } else {
      value = cleanText(element.value);
    }

    return {
      controlIndex,
      type: inputType,
      value,
      checked: ["checkbox", "radio"].includes(inputType)
        ? Boolean(element.checked)
        : null,
      disabled: Boolean(element.disabled),
      readonly: Boolean(element.readOnly),
      required: Boolean(element.required),
      placeholder: cleanText(element.getAttribute("placeholder")) || null,
      nameAttribute: cleanText(element.getAttribute("name")) || null,
      ariaLabel: cleanText(element.getAttribute("aria-label")) || null,
      elementId: cleanText(element.id) || null,
      className: cleanText(element.className) || null,
    };
  }

  function semanticLabel(element) {
    return cleanText(
      element.matches("label.el-checkbox")
        ? element.querySelector(".el-checkbox__label")?.textContent
        : element.matches("label.el-radio")
          ? element.querySelector(".el-radio__label")?.textContent
          : element.textContent,
    );
  }

  function inferControlName(element, sectionName, fallbackIndex) {
    const wrappingLabel = element.closest("label");
    const wrappingText = wrappingLabel ? semanticLabel(wrappingLabel) : "";
    return (
      wrappingText ||
      cleanText(element.getAttribute("aria-label")) ||
      cleanText(element.getAttribute("name")) ||
      cleanText(element.getAttribute("placeholder")) ||
      (sectionName
        ? `${sectionName} value`
        : `Unlabelled value ${fallbackIndex}`)
    );
  }

  function extractFieldsFromScope(
    scope,
    sectionName,
    globalControlCounter,
    { outsideCardsOnly = false } = {},
  ) {
    const selector = [
      "span.font-weight-medium",
      "label.el-form-item__label",
      "label.el-checkbox",
      "label.el-radio",
      "input",
      "textarea",
      "select",
      '[contenteditable="true"]',
    ].join(",");
    const fields = [];
    const byName = new Map();
    const consumedControls = new Set();
    let currentName = "";

    function addControl(name, control) {
      const normalizedName =
        cleanText(name) || `Unlabelled value ${fields.length + 1}`;
      let field = byName.get(normalizedName);
      if (!field) {
        field = { name: normalizedName, controls: [] };
        byName.set(normalizedName, field);
        fields.push(field);
      }
      field.controls.push(control);
    }

    for (const element of scope.querySelectorAll(selector)) {
      if (outsideCardsOnly && element.closest(".ft-group-card")) continue;
      if (element.closest(".el-table")) continue;
      if (
        element.matches("span.font-weight-medium, label.el-form-item__label")
      ) {
        if (!element.closest(".el-dialog__wrapper")) {
          currentName = semanticLabel(element);
        }
        continue;
      }
      if (element.matches("label.el-checkbox, label.el-radio")) {
        if (element.closest(".el-dialog__wrapper")) continue;
        const control = element.querySelector(
          'input[type="checkbox"], input[type="radio"]',
        );
        if (!control || isExcludedPageControl(control)) continue;
        consumedControls.add(control);
        addControl(
          semanticLabel(element) || currentName,
          readLivePageControl(control, globalControlCounter.value++),
        );
        continue;
      }
      if (consumedControls.has(element) || isExcludedPageControl(element)) {
        continue;
      }
      addControl(
        currentName ||
          inferControlName(
            element,
            sectionName,
            globalControlCounter.value + 1,
          ),
        readLivePageControl(element, globalControlCounter.value++),
      );
    }
    return fields;
  }

  function extractStructuredPage(documentRoot) {
    const tabs = Array.from(
      documentRoot.querySelectorAll('[role="tab"].el-tabs__item'),
      (tab) => ({
        name: cleanText(tab.textContent),
        active:
          tab.classList.contains("is-active") ||
          tab.getAttribute("aria-selected") === "true",
      }),
    ).filter(({ name }) => name);
    const counter = { value: 0 };
    const sections = Array.from(
      documentRoot.querySelectorAll(".ft-group-card"),
      (card, sectionIndex) => {
        const name =
          cleanText(
            card.querySelector(":scope > .el-card__header .font-weight-bold")
              ?.textContent,
          ) || `Section ${sectionIndex + 1}`;
        return {
          sectionIndex,
          name,
          fields: extractFieldsFromScope(card, name, counter),
        };
      },
    );
    const ungroupedFields = extractFieldsFromScope(
      documentRoot,
      "Other instruction fields",
      counter,
      { outsideCardsOnly: true },
    );

    return {
      activeTab: tabs.find(({ active }) => active)?.name ?? null,
      tabs,
      sections,
      ungroupedFields,
      controlCount: counter.value,
    };
  }

  function extractShipmentIdentity(documentRoot) {
    const bookingLabels = new Set(["booking no", "booking number"]);
    const values = [];
    const labels = Array.from(
      documentRoot.querySelectorAll("dt, label, span, div, p"),
    ).filter((element) => {
      const directText = cleanText(
        Array.from(element.childNodes ?? [])
          .filter((node) => node.nodeType === 3)
          .map((node) => node.textContent)
          .join(" "),
      );
      const label = normalizeLabel(
        directText ||
          (element.children.length === 0 ? element.textContent : ""),
      );
      return bookingLabels.has(label);
    });

    const addCandidate = (element) => {
      const value = cleanText(element?.textContent);
      if (
        value &&
        !bookingLabels.has(normalizeLabel(value)) &&
        /^[A-Z0-9][A-Z0-9._/-]{2,99}$/i.test(value)
      ) {
        values.push(value.toUpperCase());
      }
    };

    for (const label of labels) {
      addCandidate(label.nextElementSibling);
      const siblings = Array.from(label.parentElement?.children ?? []);
      const labelIndex = siblings.indexOf(label);
      for (const sibling of siblings.slice(labelIndex + 1)) {
        addCandidate(sibling);
      }
      addCandidate(label.parentElement?.nextElementSibling);
    }

    const distinct = [...new Set(values)];
    if (distinct.length > 1) {
      throw new ExtractionError(
        "SELECTOR_DRIFT",
        `Multiple Booking No. values found: ${distinct.join(", ")}`,
        { bookingNumbers: distinct },
      );
    }
    return { bookingNo: distinct[0] ?? null };
  }

  function directChildByClass(element, className) {
    return Array.from(element?.children ?? []).find((child) =>
      child.classList?.contains(className),
    );
  }

  function getHeaderCells(table) {
    const wrapper = directChildByClass(table, "el-table__header-wrapper");
    if (!wrapper) return [];
    const rows = wrapper.querySelectorAll("thead tr");
    const row = rows[rows.length - 1];
    return row ? Array.from(row.querySelectorAll(":scope > th")) : [];
  }

  function getHeaderContract(table) {
    const headers = getHeaderCells(table).map((cell, index) => ({
      index,
      sourceLabel: cleanText(
        cell.querySelector(".cell")?.textContent ?? cell.textContent,
      ),
      normalizedLabel: normalizeLabel(
        cell.querySelector(".cell")?.textContent ?? cell.textContent,
      ),
    }));
    const fieldIndexes = {};

    for (const definition of FIELD_DEFINITIONS) {
      const match = headers.find((header) =>
        matchesHeader(definition, header.normalizedLabel),
      );
      if (match) fieldIndexes[definition.key] = match.index;
    }

    const alignmentScore = FIELD_DEFINITIONS.filter(
      (definition) => fieldIndexes[definition.key] === definition.expectedIndex,
    ).length;
    if (headers.length >= 15 && alignmentScore >= 10) {
      for (const definition of FIELD_DEFINITIONS) {
        if (
          !definition.required &&
          !Number.isInteger(fieldIndexes[definition.key]) &&
          headers[definition.expectedIndex]
        ) {
          fieldIndexes[definition.key] = definition.expectedIndex;
        }
      }
    }

    return { headers, fieldIndexes };
  }

  function matchesHeader(definition, normalizedLabel) {
    return definition.labels.some(
      (label) =>
        normalizedLabel === label ||
        normalizedLabel.startsWith(`${label} `) ||
        normalizedLabel.endsWith(` ${label}`),
    );
  }

  function findContainerTable(documentRoot) {
    const formScopes = Array.from(
      documentRoot.querySelectorAll(".ft-form-inline"),
    );
    const searchScopes = formScopes.length > 0 ? formScopes : [documentRoot];
    const tables = searchScopes.flatMap((scope) =>
      Array.from(scope.querySelectorAll(".el-table")),
    );
    for (const table of tables) {
      const { fieldIndexes } = getHeaderContract(table);
      if (
        Number.isInteger(fieldIndexes.containerNo) &&
        Number.isInteger(fieldIndexes.grossWeight) &&
        Number.isInteger(fieldIndexes.packageType) &&
        Number.isInteger(fieldIndexes.method)
      ) {
        return table;
      }
    }
    return null;
  }

  function getPrimaryRows(table) {
    const wrapper = directChildByClass(table, "el-table__body-wrapper");
    if (!wrapper) return [];
    const body = wrapper.querySelector("table.el-table__body > tbody");
    return body
      ? Array.from(body.querySelectorAll(":scope > tr.el-table__row"))
      : [];
  }

  function readCellValue(cell) {
    if (!cell) return "";
    const control = cell.querySelector("input, textarea, select");
    if (control) {
      if (control.type === "checkbox" || control.type === "radio") {
        return control.checked ? cleanText(control.value || "true") : "";
      }
      return cleanText(control.value);
    }
    const editable = cell.querySelector('[contenteditable="true"]');
    if (editable) return cleanText(editable.textContent);
    return cleanText(
      cell.querySelector(".cell")?.textContent ?? cell.textContent,
    );
  }

  function validateFieldContract(fieldIndexes) {
    const missing = FIELD_DEFINITIONS.filter(
      (definition) =>
        definition.required && !Number.isInteger(fieldIndexes[definition.key]),
    ).map((definition) => definition.key);
    if (missing.length > 0) {
      throw new ExtractionError(
        "SELECTOR_DRIFT",
        `Container table is missing fields: ${missing.join(", ")}`,
        { missingFields: missing },
      );
    }
  }

  function extractCurrentPage(table) {
    const { headers, fieldIndexes } = getHeaderContract(table);
    validateFieldContract(fieldIndexes);
    const rows = getPrimaryRows(table);

    return rows.map((row, pageRowIndex) => {
      const cells = Array.from(row.querySelectorAll(":scope > td"));
      const rawCells = headers.map((header) => ({
        columnIndex: header.index,
        label: header.sourceLabel,
        value: readCellValue(cells[header.index]),
      }));
      const fields = {};
      for (const definition of FIELD_DEFINITIONS) {
        const index = fieldIndexes[definition.key];
        fields[definition.key] = Number.isInteger(index)
          ? readCellValue(cells[index])
          : "";
      }

      const numberHeader = headers.find(
        (header) => header.normalizedLabel === "no",
      );
      const sourceRowNumber = numberHeader
        ? readCellValue(cells[numberHeader.index])
        : String(pageRowIndex + 1);

      return {
        sourceRowNumber,
        fields,
        rawCells,
      };
    });
  }

  function findPaginationRoot(table) {
    let current = table.parentElement;
    for (
      let depth = 0;
      current && depth < 7;
      depth += 1, current = current.parentElement
    ) {
      const pagination = current.querySelector(".el-pagination");
      if (pagination) return pagination;
    }
    return null;
  }

  function readDisplayedTotal(table) {
    const pagination = findPaginationRoot(table);
    const text =
      pagination?.querySelector(".el-pagination__total")?.textContent ?? "";
    const match = text.match(/(?:total\s*)?(\d[\d,]*)/i);
    return match ? Number(match[1].replace(/,/g, "")) : null;
  }

  function rowsSignature(rows) {
    return JSON.stringify(
      rows.map((row) => [
        row.sourceRowNumber,
        ...FIELD_DEFINITIONS.map(({ key }) => row.fields[key]),
      ]),
    );
  }

  function wait(delayMs) {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  async function emitProgress(options, stage, message, details = {}) {
    if (typeof options?.onProgress !== "function") return;
    await options.onProgress({ stage, message, details });
  }

  async function waitForStableTable(documentRoot, options = {}) {
    const timeoutMs = options.timeoutMs ?? 60_000;
    const pollMs = options.pollMs ?? 500;
    const stableCyclesRequired = options.stableCycles ?? 4;
    const startedAt = Date.now();
    let lastSignature = null;
    let stableCycles = 0;
    let tableFound = false;

    await emitProgress(
      options,
      "waiting_table",
      "Waiting for the FreightEK container table to render.",
    );

    while (Date.now() - startedAt < timeoutMs) {
      const table = findContainerTable(documentRoot);
      if (table) {
        if (!tableFound) {
          tableFound = true;
          await emitProgress(
            options,
            "table_found",
            "Container table found; waiting for live input values to stabilize.",
          );
        }
        try {
          const rows = extractCurrentPage(table);
          const total = readDisplayedTotal(table);
          const signature = rowsSignature(rows);
          if (signature === lastSignature && (rows.length > 0 || total === 0)) {
            stableCycles += 1;
          } else {
            stableCycles = 0;
            lastSignature = signature;
          }
          if (stableCycles >= stableCyclesRequired) {
            await emitProgress(
              options,
              "table_stable",
              `Container table is stable with ${rows.length} visible row(s).`,
              { visibleRows: rows.length, displayedTotal: total },
            );
            return table;
          }
        } catch (error) {
          if (error?.code === "SELECTOR_DRIFT") throw error;
        }
      }
      await wait(pollMs);
    }

    throw new ExtractionError(
      "TABLE_TIMEOUT",
      `Container table did not become stable within ${timeoutMs} ms.`,
    );
  }

  async function waitForRowsToChange(
    table,
    previousSignature,
    timeoutMs = 8_000,
  ) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      await wait(250);
      const rows = extractCurrentPage(table);
      if (rowsSignature(rows) !== previousSignature) return rows;
    }
    return extractCurrentPage(table);
  }

  async function tryExpandPageSize(table, total) {
    const pagination = findPaginationRoot(table);
    if (!pagination) return false;
    const options = Array.from(
      pagination.querySelectorAll(".el-select-dropdown__item"),
    )
      .map((element) => ({
        element,
        value: Number(cleanText(element.textContent)),
      }))
      .filter(({ value }) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a.value - b.value);
    const selected =
      options.find(({ value }) => value >= total) ?? options.at(-1);
    if (!selected) return false;

    const before = rowsSignature(extractCurrentPage(table));
    pagination.querySelector(".el-pagination__sizes .el-input")?.click();
    selected.element.click();
    const changedRows = await waitForRowsToChange(table, before);
    return changedRows.length >= total;
  }

  function mergeUniqueRows(target, incoming) {
    const seen = new Set(
      target.map((row) => row.sourceRowNumber || rowsSignature([row])),
    );
    for (const row of incoming) {
      const key = row.sourceRowNumber || rowsSignature([row]);
      if (!seen.has(key)) {
        seen.add(key);
        target.push(row);
      }
    }
  }

  async function extractAllPages(table, options = {}) {
    const total = readDisplayedTotal(table);
    let rows = extractCurrentPage(table);
    await emitProgress(
      options,
      "reading_rows",
      `Reading container rows: ${rows.length}/${total ?? rows.length}.`,
      { extracted: rows.length, displayedTotal: total },
    );
    if (total === null || rows.length >= total) {
      return { rows, displayedTotal: total ?? rows.length };
    }

    await tryExpandPageSize(table, total);
    rows = extractCurrentPage(table);
    await emitProgress(
      options,
      "reading_pages",
      `Expanded the table and read ${rows.length}/${total} container rows.`,
      { extracted: rows.length, displayedTotal: total },
    );
    if (rows.length === total) return { rows, displayedTotal: total };

    const pagination = findPaginationRoot(table);
    const firstPage = Array.from(
      pagination?.querySelectorAll(".el-pager .number") ?? [],
    ).find((item) => cleanText(item.textContent) === "1");
    if (firstPage && !firstPage.classList.contains("active")) {
      const before = rowsSignature(rows);
      firstPage.click();
      rows = await waitForRowsToChange(table, before);
    }

    const collected = [];
    mergeUniqueRows(collected, rows);
    let safety = 0;
    while (collected.length < total && safety < 250) {
      safety += 1;
      const next = pagination?.querySelector("button.btn-next");
      const disabled =
        !next ||
        next.disabled ||
        next.hasAttribute("disabled") ||
        next.classList.contains("disabled");
      if (disabled) break;
      const before = rowsSignature(extractCurrentPage(table));
      next.click();
      mergeUniqueRows(collected, await waitForRowsToChange(table, before));
      await emitProgress(
        options,
        "reading_pages",
        `Read ${collected.length}/${total} container rows across pages.`,
        { extracted: collected.length, displayedTotal: total },
      );
    }

    if (collected.length !== total) {
      throw new ExtractionError(
        "ROW_COUNT_MISMATCH",
        `Extracted ${collected.length} container rows but FreightEK reports Total ${total}.`,
        { extracted: collected.length, displayedTotal: total },
      );
    }
    return { rows: collected, displayedTotal: total };
  }

  function parseShipmentId(urlValue) {
    try {
      const url = new URL(urlValue);
      const match = url.pathname.match(
        /^\/shipments\/management\/(S\d{7})\/instruction\/?$/i,
      );
      return match ? match[1].toUpperCase() : null;
    } catch {
      return null;
    }
  }

  async function extractInstructionDocument(documentRoot, options = {}) {
    const table = await waitForStableTable(documentRoot, options);
    const { rows, displayedTotal } = await extractAllPages(table, options);
    const { headers, fieldIndexes } = getHeaderContract(table);
    const pageSnapshot = extractStructuredPage(documentRoot);
    const shipmentIdentity = extractShipmentIdentity(documentRoot);
    await emitProgress(
      options,
      "page_fields_collected",
      `Captured ${pageSnapshot.controlCount} live instruction control value(s) across ${pageSnapshot.sections.length} named section(s).`,
      {
        controlCount: pageSnapshot.controlCount,
        sectionCount: pageSnapshot.sections.length,
      },
    );
    await emitProgress(
      options,
      "rows_collected",
      `Collected all ${rows.length} container row(s); sending them to the extension worker.`,
      { extracted: rows.length, displayedTotal },
    );
    return {
      ...shipmentIdentity,
      displayedTotal,
      extractedRowCount: rows.length,
      fields: FIELD_DEFINITIONS.map(({ key }) => key),
      sourceHeaders: headers.map(({ sourceLabel }) => sourceLabel),
      optionalFieldsMissing: FIELD_DEFINITIONS.filter(
        (definition) =>
          !definition.required &&
          !Number.isInteger(fieldIndexes[definition.key]),
      ).map(({ key }) => key),
      containers: rows,
      pageSnapshot,
    };
  }

  globalScope.FreightEkExtractor = Object.freeze({
    FIELD_DEFINITIONS,
    ExtractionError,
    normalizeLabel,
    extractStructuredPage,
    extractShipmentIdentity,
    findContainerTable,
    readCellValue,
    readDisplayedTotal,
    extractCurrentPage,
    extractAllPages,
    waitForStableTable,
    parseShipmentId,
    extractInstructionDocument,
  });
})(globalThis);
