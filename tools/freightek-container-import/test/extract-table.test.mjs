import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

await import("../chrome-extension/lib/extract-table.js");
const extractor = globalThis.FreightEkExtractor;

const headers = [
  "No",
  "Type",
  "Container No.",
  "Seal No.",
  "Gross Weight",
  "Measurement (CBM)",
  "Tare",
  "Package type",
  "No of Pkgs",
  "Over Weight",
  "Net Weight",
  "Max Gross Weight",
  "VGM",
  "Note",
  "Method",
  "Action",
];

function createTableFixture(rowCount = 2) {
  const headerHtml = headers
    .map((header) => `<th><div class="cell">${header}</div></th>`)
    .join("");
  const rowHtml = (rowNumber, fixed = false) => `
    <tr class="el-table__row">
      ${headers
        .map((header, index) => {
          if (header === "Action") return "<td><button>Delete</button></td>";
          if (header === "No")
            return `<td><div class="cell">${rowNumber}</div></td>`;
          return `<td class="${fixed ? "is-hidden" : ""}"><div class="cell"><input data-column="${index}" /></div></td>`;
        })
        .join("")}
    </tr>`;
  const primaryRows = Array.from({ length: rowCount }, (_, index) =>
    rowHtml(index + 1),
  ).join("");
  const fixedRows = Array.from({ length: rowCount }, (_, index) =>
    rowHtml(index + 1, true),
  ).join("");
  const dom = new JSDOM(
    `
    <section id="instruction" class="ft-form-inline">
      <div class="el-table">
        <div class="el-table__header-wrapper"><table><thead><tr>${headerHtml}</tr></thead></table></div>
        <div class="el-table__body-wrapper"><table class="el-table__body"><tbody>${primaryRows}</tbody></table></div>
        <div class="el-table__fixed-right"><div class="el-table__fixed-body-wrapper"><table class="el-table__body"><tbody>${fixedRows}</tbody></table></div></div>
      </div>
      <div class="el-pagination"><span class="el-pagination__total">Total ${rowCount}</span></div>
    </section>
  `,
    {
      url: "https://seatrans.freightek.com/shipments/management/S2608020/instruction",
    },
  );
  return dom;
}

function setLiveRowValues(document, rowIndex, values) {
  const row = document.querySelectorAll(
    ".el-table > .el-table__body-wrapper .el-table__row",
  )[rowIndex];
  Object.entries(values).forEach(([columnIndex, value]) => {
    row.querySelector(`input[data-column="${columnIndex}"]`).value = value;
  });
}

test("extracts all 14 live values for every container and ignores fixed duplicate rows", () => {
  const dom = createTableFixture(2);
  setLiveRowValues(dom.window.document, 0, {
    1: "40'HC",
    2: "SEGU1234567",
    3: "SEAL-01",
    4: "24,000",
    5: "72.60",
    6: "3,750",
    7: "PACKAGES",
    8: "1200",
    9: "N",
    10: "22,500",
    11: "30,480",
    12: "24,100",
    13: "Priority",
    14: "CY/CY",
  });
  setLiveRowValues(dom.window.document, 1, {
    1: "20'DC",
    2: "TCLU7654321",
    3: "SEAL-02",
    4: "18,500",
    5: "33.20",
    6: "2,250",
    7: "CARTONS",
    8: "800",
    9: "Y",
    10: "17,900",
    11: "24,000",
    12: "18,700",
    13: "Handle dry",
    14: "CFS/CY",
  });

  const table = extractor.findContainerTable(dom.window.document);
  const rows = extractor.extractCurrentPage(table);
  assert.equal(rows.length, 2);
  assert.equal(Object.keys(rows[0].fields).length, 14);
  assert.deepEqual(rows[0].fields, {
    type: "40'HC",
    containerNo: "SEGU1234567",
    sealNo: "SEAL-01",
    grossWeight: "24,000",
    measurement: "72.60",
    tare: "3,750",
    packageType: "PACKAGES",
    noOfPkgs: "1200",
    overWeight: "N",
    netWeight: "22,500",
    maxGrossWeight: "30,480",
    vgm: "24,100",
    note: "Priority",
    method: "CY/CY",
  });
  assert.equal(rows[1].fields.containerNo, "TCLU7654321");
  assert.equal(rows[0].rawCells.length, 16);
  assert.equal(extractor.readDisplayedTotal(table), 2);
});

test("reads input properties instead of missing outerHTML value attributes", () => {
  const dom = createTableFixture(1);
  const input = dom.window.document.querySelector('input[data-column="2"]');
  assert.equal(input.hasAttribute("value"), false);
  input.value = "LIVE1234567";
  const table = extractor.findContainerTable(dom.window.document);
  assert.equal(
    extractor.extractCurrentPage(table)[0].fields.containerNo,
    "LIVE1234567",
  );
  assert.equal(input.hasAttribute("value"), false);
});

test("recognizes live Over Weight header variants without stopping collection", () => {
  const dom = createTableFixture(1);
  const header = Array.from(dom.window.document.querySelectorAll("th")).find(
    (cell) => cell.textContent.trim() === "Over Weight",
  );
  header.querySelector(".cell").textContent = "O/W (Y/N)";
  setLiveRowValues(dom.window.document, 0, { 9: "N" });

  const table = extractor.findContainerTable(dom.window.document);
  assert.equal(extractor.extractCurrentPage(table)[0].fields.overWeight, "N");
});

test("extracts the current 13-field table when Over Weight does not exist", () => {
  const dom = createTableFixture(1);
  const { document } = dom.window;
  const overWeightIndex = headers.indexOf("Over Weight");
  for (const row of document.querySelectorAll("tr")) {
    row.children[overWeightIndex]?.remove();
  }
  setLiveRowValues(document, 0, {
    1: "40'HC",
    2: "SEGU1234567",
    10: "22,500",
    11: "30,480",
    12: "24,100",
    13: "Priority",
    14: "CY/CY",
  });

  const table = extractor.findContainerTable(document);
  const [row] = extractor.extractCurrentPage(table);
  assert.equal(row.fields.overWeight, "");
  assert.equal(row.fields.netWeight, "22,500");
  assert.equal(row.fields.maxGrossWeight, "30,480");
  assert.equal(row.fields.vgm, "24,100");
  assert.equal(row.fields.note, "Priority");
  assert.equal(row.fields.method, "CY/CY");
  assert.equal(
    row.rawCells.some((cell) => cell.label === "Over Weight"),
    false,
  );
});

test("walks pagination until every reported container row is collected", async () => {
  const dom = createTableFixture(1);
  const { document } = dom.window;
  setLiveRowValues(document, 0, { 1: "40'HC", 2: "FIRST000001" });
  document.querySelector(".el-pagination__total").textContent = "Total 2";
  const next = document.createElement("button");
  next.className = "btn-next";
  document.querySelector(".el-pagination").append(next);
  next.addEventListener("click", () => {
    const row = document.querySelector(
      ".el-table > .el-table__body-wrapper .el-table__row",
    );
    row.querySelector("td .cell").textContent = "2";
    row.querySelector('input[data-column="1"]').value = "20'DC";
    row.querySelector('input[data-column="2"]').value = "SECOND00002";
    next.disabled = true;
  });

  const table = extractor.findContainerTable(document);
  const result = await extractor.extractAllPages(table);
  assert.equal(result.displayedTotal, 2);
  assert.deepEqual(
    result.rows.map((row) => [
      row.sourceRowNumber,
      row.fields.type,
      row.fields.containerNo,
    ]),
    [
      ["1", "40'HC", "FIRST000001"],
      ["2", "20'DC", "SECOND00002"],
    ],
  );
});

test("fails closed when a required container field disappears", () => {
  const dom = createTableFixture(1);
  const header = Array.from(dom.window.document.querySelectorAll("th")).find(
    (cell) => cell.textContent.trim() === "Container No.",
  );
  header.querySelector(".cell").textContent = "Unknown field";
  const table = dom.window.document.querySelector(".el-table");
  assert.throws(
    () => extractor.extractCurrentPage(table),
    (error) =>
      error.code === "SELECTOR_DRIFT" &&
      error.details.missingFields.includes("containerNo"),
  );
});

test("parses only valid FreightEK instruction routes", () => {
  assert.equal(
    extractor.parseShipmentId(
      "https://seatrans.freightek.com/shipments/management/S2608020/instruction",
    ),
    "S2608020",
  );
  assert.equal(
    extractor.parseShipmentId("https://seatrans.freightek.com/login"),
    null,
  );
});

test("extracts every live named field by section while excluding table and hidden popup controls", () => {
  const dom = new JSDOM(`
    <div class="el-tabs">
      <div role="tab" class="el-tabs__item is-active">HBL Processing</div>
      <div role="tab" class="el-tabs__item">MBL Shipping Instruction</div>
    </div>
    <div class="ft-group-card">
      <div class="el-card__header"><span class="font-weight-bold">General Information</span></div>
      <div class="el-card__body">
        <span class="font-weight-medium">MBL No.</span>
        <div class="el-form-item"><input id="mbl" type="text" /></div>
        <div class="el-form-item">
          <label class="el-form-item__label">Company Branch</label>
          <div class="el-form-item__content"><input id="branch" readonly placeholder="Search" /></div>
        </div>
        <label class="el-checkbox"><input id="arranged" type="checkbox" value="As Arranged" /><span class="el-checkbox__label">As Arranged</span></label>
        <div class="el-select-dropdown" style="display: none"><input id="hidden-option" /></div>
      </div>
    </div>
    <div class="ft-group-card">
      <div class="el-card__header"><span class="font-weight-bold">Parties</span></div>
      <div class="el-card__body">
        <span class="font-weight-medium">Shipper</span>
        <input id="shipper-name" />
        <textarea id="shipper-address"></textarea>
        <label class="el-radio"><input id="same-shipper" type="radio" value="shipper" /><span class="el-radio__label">Same as Shipper</span></label>
      </div>
    </div>
    <div class="el-table"><input id="container-control" /></div>
    <div class="el-dialog__wrapper" style="display: none"><input id="hidden-dialog" /></div>
  `);
  const { document } = dom.window;
  document.querySelector("#mbl").value = "SITGDATK078190";
  document.querySelector("#branch").value = "SEATRANS";
  document.querySelector("#arranged").checked = true;
  document.querySelector("#shipper-name").value = "STONE EXPORT CO., LTD";
  document.querySelector("#shipper-address").value = "QUY NHON, VIETNAM";
  document.querySelector("#same-shipper").checked = true;

  const snapshot = extractor.extractStructuredPage(document);
  assert.equal(snapshot.activeTab, "HBL Processing");
  assert.deepEqual(
    snapshot.tabs.map(({ name, active }) => [name, active]),
    [
      ["HBL Processing", true],
      ["MBL Shipping Instruction", false],
    ],
  );
  assert.deepEqual(
    snapshot.sections.map(({ name }) => name),
    ["General Information", "Parties"],
  );
  assert.deepEqual(
    snapshot.sections[0].fields.map(({ name, controls }) => [
      name,
      controls.map(({ type, value, checked }) => [type, value, checked]),
    ]),
    [
      ["MBL No.", [["text", "SITGDATK078190", null]]],
      ["Company Branch", [["text", "SEATRANS", null]]],
      ["As Arranged", [["checkbox", "As Arranged", true]]],
    ],
  );
  assert.deepEqual(
    snapshot.sections[1].fields.map(({ name, controls }) => [
      name,
      controls.map(({ type, value, checked }) => [type, value, checked]),
    ]),
    [
      [
        "Shipper",
        [
          ["text", "STONE EXPORT CO., LTD", null],
          ["textarea", "QUY NHON, VIETNAM", null],
        ],
      ],
      ["Same as Shipper", [["radio", "shipper", true]]],
    ],
  );
  assert.equal(snapshot.controlCount, 6);
  assert.equal(JSON.stringify(snapshot).includes("container-control"), false);
  assert.equal(JSON.stringify(snapshot).includes("hidden-option"), false);
  assert.equal(JSON.stringify(snapshot).includes("hidden-dialog"), false);
});

test("extracts the live Booking No. from the shipment summary", () => {
  const dom = new JSDOM(`
    <section class="shipment-summary">
      <div><span>BOOKING NO.</span><strong>EMFUIHTYO021330</strong></div>
    </section>
  `);
  assert.deepEqual(extractor.extractShipmentIdentity(dom.window.document), {
    bookingNo: "EMFUIHTYO021330",
  });
});

test("includes the live page snapshot in the complete instruction result", async () => {
  const dom = createTableFixture(1);
  const { document } = dom.window;
  const card = document.createElement("div");
  card.className = "ft-group-card";
  card.innerHTML = `
    <div class="el-card__header"><span class="font-weight-bold">General Information</span></div>
    <div class="el-card__body">
      <span class="font-weight-medium">HBL No.</span>
      <input id="live-hbl" />
    </div>
  `;
  document.querySelector("#instruction").prepend(card);
  const summary = document.createElement("div");
  summary.innerHTML = `<span>BOOKING NO.</span><strong>EMFUIHTYO020975</strong>`;
  document.body.prepend(summary);
  document.querySelector("#live-hbl").value = "ST2608020";
  setLiveRowValues(document, 0, {
    1: "40'HC",
    2: "SEGU1234567",
    3: "SEAL-01",
    4: "24,000",
    5: "72.60",
    6: "3,750",
    7: "PACKAGES",
    8: "1200",
    13: "Priority",
    14: "CY/CY",
  });

  const result = await extractor.extractInstructionDocument(document, {
    timeoutMs: 1_000,
    pollMs: 0,
    stableCycles: 1,
  });
  assert.equal(result.extractedRowCount, 1);
  assert.equal(result.bookingNo, "EMFUIHTYO020975");
  assert.equal(result.pageSnapshot.controlCount, 1);
  assert.equal(result.pageSnapshot.sections[0].name, "General Information");
  assert.equal(
    result.pageSnapshot.sections[0].fields[0].controls[0].value,
    "ST2608020",
  );
});
