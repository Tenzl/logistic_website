import { createRequire } from "node:module";
import { resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";

export const DOCUMENT_TABLES = Object.freeze([
  "booking_records",
  "booking_cargo_volumes",
  "bill_of_lading_records",
  "bill_of_lading_containers",
  "arrival_notice_records",
  "arrival_notice_containers",
  "delivery_order_records",
  "delivery_order_containers",
]);

export const WRITABLE_TABLES = new Set(
  DOCUMENT_TABLES.filter((table) => table !== "booking_cargo_volumes"),
);

const RECORD_CONFIG = Object.freeze({
  booking_records: ["booking", null, "hydrateBookingRecord"],
  bill_of_lading_records: [
    "bl",
    "bill_of_lading_containers",
    "hydrateBillOfLadingRecord",
  ],
  arrival_notice_records: [
    "an",
    "arrival_notice_containers",
    "hydrateArrivalNoticeRecord",
  ],
  delivery_order_records: [
    "do",
    "delivery_order_containers",
    "hydrateDeliveryOrderRecord",
  ],
});

const json = (value) => JSON.parse(JSON.stringify(value));

export function createDatabaseConfig(env) {
  const ssl = ["true", "1", "require", "verify-ca", "verify-full"].includes(
    (env.DB_SSL ?? "").toLowerCase(),
  )
    ? { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED === "true" }
    : undefined;
  if (env.DB_URL) {
    const url = new URL(env.DB_URL);
    return {
      host: url.hostname,
      port: Number(url.port) || 5432,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl,
    };
  }
  return {
    host: env.DB_HOST,
    port: Number(env.DB_PORT) || 5432,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    ssl,
  };
}

export function loadPg(backendDir) {
  const backendRequire = createRequire(resolve(backendDir, "package.json"));
  return backendRequire("pg");
}

export async function snapshotDatabase(client) {
  const data = {};
  for (const table of DOCUMENT_TABLES) {
    data[table] = json(
      (await client.query(`SELECT * FROM public.${table} ORDER BY id`)).rows,
    );
  }
  data.ports = json(
    (
      await client.query(
        `SELECT id, code, name, sub_name_1, sub_name_2, port_of_call
         FROM public.ports WHERE is_active = TRUE ORDER BY id`,
      )
    ).rows,
  );
  data.partners = json(
    (
      await client.query(
        `SELECT id, name, address FROM public.booking_partners
         WHERE deleted_at IS NULL ORDER BY id`,
      )
    ).rows,
  );
  data.types = json(
    (
      await client.query(
        `SELECT id, name FROM public.commodity_types
         WHERE service_type_id = 2 ORDER BY id`,
      )
    ).rows,
  );
  const ledgerRows = (
    await client.query(
      `SELECT migration_id, details
       FROM public.app_schema_migrations
       WHERE migration_id = '2026-09-15_freightek_authoritative_reconcile_v1'
          OR details ? 'mappings'
       ORDER BY completed_at`,
    )
  ).rows;
  data.shipment_links = deriveShipmentLinks(data, ledgerRows);
  return data;
}

function deriveShipmentLinks(data, ledgerRows) {
  const candidates = [];
  const add = (shipmentId, bookingId, source) => {
    if (!shipmentId || bookingId == null) return;
    candidates.push({
      shipmentId: String(shipmentId).trim().toUpperCase(),
      bookingId,
      source,
    });
  };
  const recordBookingId = (table, id) => {
    if (table === "booking_records") return id;
    if (
      [
        "bill_of_lading_records",
        "arrival_notice_records",
        "delivery_order_records",
      ].includes(table)
    ) {
      return data[table].find((row) => String(row.id) === String(id))
        ?.booking_id;
    }
    if (table.endsWith("_containers")) {
      const container = data[table].find(
        (row) => String(row.id) === String(id),
      );
      const recordTable = table.replace("_containers", "_records");
      return data[recordTable].find(
        (row) => String(row.id) === String(container?.document_id),
      )?.booking_id;
    }
    return null;
  };

  for (const ledger of ledgerRows) {
    const details = ledger.details ?? {};
    for (const mapping of details.mappings ?? []) {
      add(mapping.shipmentId, mapping.bookingId, ledger.migration_id);
    }
    for (const item of [
      ...(details.updates ?? []),
      ...(details.inserted ?? []),
    ]) {
      add(
        item.shipmentId,
        recordBookingId(item.table, item.id),
        ledger.migration_id,
      );
    }
  }

  const unique = new Map();
  for (const candidate of candidates) {
    unique.set(`${candidate.shipmentId}:${candidate.bookingId}`, candidate);
  }
  return [...unique.values()].sort((left, right) =>
    left.shipmentId.localeCompare(right.shipmentId),
  );
}

export async function readSchema(client) {
  return (
    await client.query(
      `SELECT table_name, column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = ANY($1::text[])
       ORDER BY table_name, ordinal_position`,
      [DOCUMENT_TABLES],
    )
  ).rows;
}

export async function beginWriteWindow(client) {
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '10s'");
  await client.query("SET LOCAL statement_timeout = '120s'");
  await client.query(
    `LOCK TABLE ${[
      ...DOCUMENT_TABLES,
      "ports",
      "booking_partners",
      "commodity_types",
    ]
      .map((table) => `public.${table}`)
      .join(", ")} IN SHARE ROW EXCLUSIVE MODE`,
  );
}

export function assertSnapshotsEqual(expected, actual, label = "database") {
  for (const table of DOCUMENT_TABLES) {
    if (!isDeepStrictEqual(expected[table], actual[table])) {
      throw new Error(`${label} changed concurrently in ${table}`);
    }
  }
  for (const master of ["ports", "partners", "types", "shipment_links"]) {
    if (!isDeepStrictEqual(expected[master], actual[master])) {
      throw new Error(`${label} changed concurrently in ${master}`);
    }
  }
}

const sqlIdentifier = (value) => {
  if (!/^[a-z_]+$/.test(value)) throw new Error("Unsafe SQL identifier");
  return `"${value}"`;
};

function assertColumns(schema, table, values) {
  if (!WRITABLE_TABLES.has(table)) {
    throw new Error(`Write outside approved tables: ${table}`);
  }
  const keys = Object.keys(values);
  const available = new Set(
    schema
      .filter((column) => column.table_name === table)
      .map((column) => column.column_name),
  );
  const unknown = keys.filter((key) => !available.has(key));
  if (unknown.length) {
    throw new Error(`Unknown ${table} columns: ${unknown.join(", ")}`);
  }
  return keys;
}

async function updateRow(client, schema, table, id, values) {
  const keys = assertColumns(schema, table, values);
  if (!keys.length) return;
  const result = await client.query(
    `UPDATE public.${sqlIdentifier(table)}
     SET ${keys
       .map((key, index) => `${sqlIdentifier(key)} = $${index + 1}`)
       .join(", ")}
     WHERE id = $${keys.length + 1}`,
    [...Object.values(values), id],
  );
  if (result.rowCount !== 1) {
    throw new Error(`Expected one ${table}/${id} row to update`);
  }
}

async function insertRow(client, schema, table, values) {
  const keys = assertColumns(schema, table, values);
  const result = await client.query(
    `INSERT INTO public.${sqlIdentifier(table)}
       (${keys.map(sqlIdentifier).join(", ")})
     VALUES (${keys.map((_, index) => `$${index + 1}`).join(", ")})
     RETURNING *`,
    Object.values(values),
  );
  return json(result.rows[0]);
}

async function deleteRow(client, table, id) {
  if (!WRITABLE_TABLES.has(table) || table === "booking_records") {
    throw new Error(`Deletion outside approved container scope: ${table}`);
  }
  if (!table.endsWith("_containers")) {
    throw new Error(`Only container rows may be deleted: ${table}`);
  }
  const result = await client.query(
    `DELETE FROM public.${sqlIdentifier(table)} WHERE id = $1`,
    [id],
  );
  if (result.rowCount !== 1) {
    throw new Error(`Expected one ${table}/${id} row to delete`);
  }
}

const camelizeRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
      value,
    ]),
  );

function loadDocumentRuntime(backendDir) {
  const backendRequire = createRequire(resolve(backendDir, "package.json"));
  const hydrator = backendRequire(
    resolve(
      backendDir,
      "dist/features/booking-documents/booking-document-record.hydrator.js",
    ),
  );
  const requirements = backendRequire(
    resolve(
      backendDir,
      "dist/features/booking-documents/booking-document-requirements.js",
    ),
  );
  return { hydrator, requirements };
}

function calculateDocumentStatus(runtime, table, row, data) {
  const [documentType, childTable, hydrateFunction] = RECORD_CONFIG[table];
  let children;
  if (documentType === "booking") {
    children = Object.fromEntries(
      data.booking_cargo_volumes
        .filter((volume) => String(volume.booking_id) === String(row.id))
        .map((volume) => [volume.container_type_code, Number(volume.quantity)]),
    );
  } else {
    children = data[childTable]
      .filter((child) => String(child.document_id) === String(row.id))
      .sort((left, right) => left.row_order - right.row_order)
      .map(runtime.hydrator.hydrateDocumentContainerRow);
  }
  const payload = runtime.hydrator[hydrateFunction](camelizeRow(row), children);
  const missing = runtime.requirements.missingRequiredDocumentFields(
    documentType,
    payload,
  );
  return { status: missing.length ? "PROCESSING" : "COMPLETED", missing };
}

function verifyExpectedRows(expected, actual, schema) {
  for (const table of DOCUMENT_TABLES) {
    const expectedRows = [...expected[table]].sort(
      (left, right) => Number(left.id) - Number(right.id),
    );
    const actualRows = actual[table];
    if (expectedRows.length !== actualRows.length) {
      throw new Error(`Postflight row count differs in ${table}`);
    }
    for (let index = 0; index < expectedRows.length; index += 1) {
      const expectedRow = expectedRows[index];
      const actualRow = actualRows[index];
      if (String(expectedRow.id) !== String(actualRow.id)) {
        throw new Error(`Postflight ID order differs in ${table}`);
      }
      for (const column of schema.filter((item) => item.table_name === table)) {
        const key = column.column_name;
        if (isDeepStrictEqual(expectedRow[key], actualRow[key])) continue;
        if (
          ["numeric", "integer", "bigint", "double precision"].includes(
            column.data_type,
          ) &&
          expectedRow[key] != null &&
          actualRow[key] != null &&
          Number(expectedRow[key]) === Number(actualRow[key])
        ) {
          continue;
        }
        throw new Error(
          `Postflight mismatch ${table}/${expectedRow.id}/${key}`,
        );
      }
    }
  }
}

export async function applyPlanToDatabase({
  client,
  schema,
  before,
  plan,
  backendDir,
}) {
  const expected = structuredClone(before);
  const references = new Map();
  const inserted = [];
  const deleted = [];
  const states = [];
  const touched = new Map();
  const stamp = new Date().toISOString();
  const touch = (table, id) => {
    if (!touched.has(table)) touched.set(table, new Set());
    touched.get(table).add(String(id));
  };

  for (const update of plan.updates) {
    await updateRow(client, schema, update.table, update.id, update.changes);
    Object.assign(
      expected[update.table].find(
        (row) => String(row.id) === String(update.id),
      ),
      update.changes,
    );
    if (RECORD_CONFIG[update.table]) {
      touch(update.table, update.id);
    } else {
      touch(
        update.table.replace("_containers", "_records"),
        update.before.document_id,
      );
    }
  }

  for (const deletion of plan.deletions) {
    await deleteRow(client, deletion.table, deletion.id);
    expected[deletion.table] = expected[deletion.table].filter(
      (row) => String(row.id) !== String(deletion.id),
    );
    deleted.push({
      shipmentId: deletion.shipmentId,
      table: deletion.table,
      id: deletion.id,
      before: deletion.before,
    });
    touch(
      deletion.table.replace("_containers", "_records"),
      deletion.before.document_id,
    );
  }

  for (const item of plan.inserts) {
    const values = Object.fromEntries(
      Object.entries(item.values).map(([key, value]) => [
        key,
        value?.ref ? references.get(value.ref) : value,
      ]),
    );
    if (Object.values(values).some((value) => value === undefined)) {
      throw new Error(`Unresolved insert reference in ${item.table}`);
    }
    if (RECORD_CONFIG[item.table]) {
      Object.assign(values, {
        version: 1,
        created_at: stamp,
        updated_at: stamp,
      });
    }
    const row = await insertRow(client, schema, item.table, values);
    references.set(item.ref, row.id);
    expected[item.table].push(row);
    inserted.push({
      shipmentId: item.shipmentId,
      table: item.table,
      id: row.id,
      ref: item.ref,
    });
    if (RECORD_CONFIG[item.table]) touch(item.table, row.id);
  }

  const runtime = loadDocumentRuntime(backendDir);
  const intermediate = await snapshotDatabase(client);
  const insertedKeys = new Set(
    inserted.map((item) => `${item.table}:${item.id}`),
  );
  for (const [table, ids] of touched) {
    for (const id of ids) {
      const row = intermediate[table].find(
        (candidate) => String(candidate.id) === String(id),
      );
      if (!row) throw new Error(`Touched row disappeared: ${table}/${id}`);
      const state = calculateDocumentStatus(runtime, table, row, intermediate);
      const next = {
        status: state.status,
        updated_at: stamp,
        version:
          Number(row.version) +
          (insertedKeys.has(`${table}:${row.id}`) ? 0 : 1),
      };
      await updateRow(client, schema, table, row.id, next);
      Object.assign(
        expected[table].find(
          (candidate) => String(candidate.id) === String(row.id),
        ),
        next,
      );
      states.push({ table, id: row.id, ...state });
    }
  }

  const after = await snapshotDatabase(client);
  verifyExpectedRows(expected, after, schema);
  const activeHblNumbers = after.bill_of_lading_records
    .filter((row) => !row.deleted_at && row.fbl_number)
    .map((row) => row.fbl_number.trim().toUpperCase());
  if (new Set(activeHblNumbers).size !== activeHblNumbers.length) {
    throw new Error("Duplicate active HBL detected after import");
  }
  return { after, inserted, deleted, states };
}
