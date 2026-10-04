#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { buildAuthoritativePlan } from "../../backend2.0/scripts/lib/freightek-authoritative-plan.mjs";
import {
  assertPlanCanApply,
  parseFreightEkDocument,
  partitionPlanBlockers,
  resolveShipmentMappings,
  summarizePlan,
} from "./src/core.mjs";
import {
  applyPlanToDatabase,
  assertSnapshotsEqual,
  beginWriteWindow,
  createDatabaseConfig,
  loadPg,
  readSchema,
  snapshotDatabase,
} from "./src/database.mjs";

const toolDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(toolDir, "../..");
const backendDir = resolve(repoRoot, "backend2.0");
const envPath = resolve(backendDir, ".env");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function usage() {
  return `FreightEK JSON -> Seatrans database sync

Usage:
  node tools/freightek-json-sync/index.mjs --json <file> [--mode plan|apply]

Options:
  --json <file>                   FreightEK collector JSON (required)
  --mode <plan|apply>             Default: plan (read-only)
  --allow-container-deletes       Allow DB container rows absent from JSON to be removed
  --help                          Show this help

Safety:
  plan never writes to the database. apply always creates and verifies a full
  pg_dump, rehearses all writes in a rolled-back transaction, then applies only
  if the live plan is byte-for-byte equivalent to the reviewed plan.`;
}

function parseArguments(argv) {
  const result = {
    mode: "plan",
    jsonPath: null,
    allowContainerDeletes: false,
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") result.help = true;
    else if (argument === "--allow-container-deletes") {
      result.allowContainerDeletes = true;
    } else if (argument === "--json") result.jsonPath = argv[++index] ?? null;
    else if (argument === "--mode") result.mode = argv[++index] ?? null;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (result.help) return result;
  if (!result.jsonPath) throw new Error("--json is required");
  if (!["plan", "apply"].includes(result.mode)) {
    throw new Error("--mode must be plan or apply");
  }
  return result;
}

function loadSource(jsonPath) {
  const absolutePath = resolve(jsonPath);
  if (!existsSync(absolutePath))
    throw new Error(`JSON not found: ${absolutePath}`);
  const size = statSync(absolutePath).size;
  if (size > 100 * 1024 * 1024) {
    throw new Error("JSON exceeds the 100 MB safety limit");
  }
  const bytes = readFileSync(absolutePath);
  let document;
  try {
    document = JSON.parse(bytes);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
  return { absolutePath, bytes, document, sourceHash: sha256(bytes) };
}

function buildPipeline(source, database) {
  const parsed = parseFreightEkDocument(source.document);
  const resolved = resolveShipmentMappings(parsed.entries, database);
  const mappedShipmentIds = new Set(
    resolved.mappings.map((mapping) => mapping.shipmentId),
  );
  const mappedEntries = parsed.entries.filter((entry) =>
    mappedShipmentIds.has(entry.shipmentId),
  );
  const plan = mappedEntries.length
    ? buildAuthoritativePlan(mappedEntries, resolved.mappings, database)
    : {
        shipments: [],
        updates: [],
        inserts: [],
        deletions: [],
        blockers: [],
        missingDocuments: [],
        unmappedFields: [],
      };
  return {
    parsed,
    resolved,
    plan,
    summary: summarizePlan(plan, parsed, resolved),
  };
}

const safeCell = (value) =>
  String(value ?? "—")
    .replaceAll("|", "\\|")
    .replace(/\r?\n/g, "<br>");

function writeReports(artifactDir, context, extra = {}) {
  mkdirSync(artifactDir, { recursive: true });
  const { source, pipeline, mode } = context;
  writeFileSync(
    resolve(artifactDir, "plan.json"),
    JSON.stringify(
      {
        mode,
        sourcePath: source.absolutePath,
        sourceSha256: source.sourceHash,
        generatedAt: new Date().toISOString(),
        summary: pipeline.summary,
        skipped: pipeline.parsed.skipped,
        unresolved: pipeline.resolved.unresolved,
        mappings: pipeline.resolved.mappings,
        plan: pipeline.plan,
        ...extra,
      },
      null,
      2,
    ),
  );
  const blockers = partitionPlanBlockers(pipeline.plan.blockers);
  const lines = [
    "# FreightEK JSON sync report",
    "",
    `- Mode: **${mode}**`,
    `- Source: \`${source.absolutePath}\``,
    `- SHA-256: \`${source.sourceHash}\``,
    `- Successful entries: ${pipeline.summary.successfulEntries}`,
    `- Resolved shipments: ${pipeline.summary.resolvedShipments}`,
    `- Unresolved shipments: ${pipeline.summary.unresolvedShipments}`,
    `- Skipped collection failures: ${pipeline.summary.skippedEntries}`,
    `- Updates: \`${JSON.stringify(pipeline.summary.updates)}\``,
    `- Inserts: \`${JSON.stringify(pipeline.summary.inserts)}\``,
    `- Deletions: \`${JSON.stringify(pipeline.summary.deletions)}\``,
    `- Fatal blockers: ${blockers.fatal.length}`,
    `- Master-data warnings: ${blockers.warnings.length}`,
    extra.backupPath ? `- Full pg_dump: \`${extra.backupPath}\`` : null,
    extra.applied ? "- Result: **APPLIED AND VERIFIED**" : null,
    "",
    "## Unresolved shipments",
    "",
    "| Shipment ID | Booking No. | HBL | Reason |",
    "|---|---|---|---|",
    ...pipeline.resolved.unresolved.map(
      (item) =>
        `| ${safeCell(item.shipmentId)} | ${safeCell(item.bookingNo)} | ${safeCell(item.hbl)} | ${safeCell(item.reason)} |`,
    ),
    "",
    "## Skipped collection rows",
    "",
    "| Shipment ID | Reason |",
    "|---|---|",
    ...pipeline.parsed.skipped.map(
      (item) => `| ${safeCell(item.shipmentId)} | ${safeCell(item.reason)} |`,
    ),
    "",
    "## Blocking issues",
    "",
    "| Shipment ID | Table/field | Reason |",
    "|---|---|---|",
    ...blockers.fatal.map(
      (item) =>
        `| ${safeCell(item.shipmentId)} | ${safeCell(item.table ?? item.field)} | ${safeCell(item.reason)} |`,
    ),
    "",
    "## Master-data warnings",
    "",
    "| Shipment ID | Field | Source snapshot | Reason |",
    "|---|---|---|---|",
    ...blockers.warnings.map(
      (item) =>
        `| ${safeCell(item.shipmentId)} | ${safeCell(item.field)} | ${safeCell(item.source)} | ${safeCell(item.reason)} |`,
    ),
    "",
    "## Safety rules",
    "",
    "- Blank JSON values never erase existing values.",
    "- Booking is resolved by exact Booking No.; if absent, by unique live HBL/FBL.",
    "- Conflicting Booking No. and HBL stop the shipment; the tool never guesses.",
    "- Ports and Parties receive master IDs only on a unique match; otherwise the source snapshot is retained and the ID remains null.",
    "- Booking Vessel/Voyage uses Feeder Vessel/Voyage. BL Ocean Vessel uses Mother Vessel/Voyage.",
    "- Extra database containers require the explicit `--allow-container-deletes` flag.",
    "",
  ].filter((line) => line !== null);
  writeFileSync(resolve(artifactDir, "report.md"), lines.join("\n"));
}

function findPostgresBin() {
  for (const version of ["18", "17", "16", "15", "14"]) {
    const candidate = `C:/Program Files/PostgreSQL/${version}/bin`;
    if (
      existsSync(resolve(candidate, "pg_dump.exe")) &&
      existsSync(resolve(candidate, "pg_restore.exe"))
    ) {
      return candidate;
    }
  }
  throw new Error("PostgreSQL pg_dump/pg_restore was not found");
}

function createFullBackup(config, sourceHash) {
  const backupDir = resolve(repoRoot, "..", "seatrans-db-backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = resolve(
    backupDir,
    `before-freightek-json-${sourceHash.slice(0, 12)}-${Date.now()}.dump`,
  );
  const postgresBin = findPostgresBin();
  const env = {
    ...process.env,
    PGPASSWORD: config.password,
    PGSSLMODE: config.ssl ? "require" : "prefer",
  };
  const dump = spawnSync(
    resolve(postgresBin, "pg_dump.exe"),
    [
      "--format=custom",
      "--host",
      config.host,
      "--port",
      String(config.port),
      "--username",
      config.user,
      "--dbname",
      config.database,
      "--file",
      backupPath,
    ],
    { env, windowsHide: true, timeout: 180_000, encoding: "utf8" },
  );
  if (
    dump.status !== 0 ||
    !existsSync(backupPath) ||
    !statSync(backupPath).size
  ) {
    throw new Error(`pg_dump failed; database unchanged: ${dump.stderr ?? ""}`);
  }
  const list = spawnSync(
    resolve(postgresBin, "pg_restore.exe"),
    ["--list", backupPath],
    { windowsHide: true, timeout: 60_000, encoding: "utf8" },
  );
  const required = [
    "TABLE DATA public booking_records",
    "TABLE DATA public bill_of_lading_records",
    "TABLE DATA public bill_of_lading_containers",
  ];
  if (
    list.status !== 0 ||
    required.some((entry) => !list.stdout.includes(entry))
  ) {
    throw new Error("pg_dump verification failed; database unchanged");
  }
  const backupHash = sha256(readFileSync(backupPath));
  writeFileSync(`${backupPath}.sha256`, backupHash, { flag: "wx" });
  return { backupPath, backupHash };
}

function planHasWrites(plan) {
  return Boolean(
    plan.updates.length || plan.inserts.length || plan.deletions.length,
  );
}

function assertBackendRuntimeBuilt() {
  const requiredFiles = [
    "dist/features/booking-documents/booking-document-record.hydrator.js",
    "dist/features/booking-documents/booking-document-requirements.js",
  ];
  const missing = requiredFiles.filter(
    (path) => !existsSync(resolve(backendDir, path)),
  );
  if (missing.length) {
    throw new Error(
      `Backend runtime is not built (${missing.join(", ")}). Run: pnpm --dir backend2.0 build`,
    );
  }
}

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  console.log(usage());
  process.exit(0);
}
if (!existsSync(envPath))
  throw new Error(`Backend environment file not found: ${envPath}`);
process.loadEnvFile(envPath);
const source = loadSource(options.jsonPath);
const artifactName =
  `${basename(source.absolutePath, ".json")}-${source.sourceHash.slice(0, 12)}-${Date.now()}`.replace(
    /[^A-Za-z0-9._-]+/g,
    "-",
  );
const artifactDir = resolve(
  repoRoot,
  "migration-backups",
  "freightek-json-sync",
  artifactName,
);
const config = createDatabaseConfig(process.env);
const pg = loadPg(backendDir);
pg.types.setTypeParser(1082, (value) => value);
const client = new pg.Client(config);
await client.connect();

try {
  await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
  const before = await snapshotDatabase(client);
  const schema = await readSchema(client);
  await client.query("COMMIT");
  const pipeline = buildPipeline(source, before);
  const context = { source, pipeline, mode: options.mode };
  writeReports(artifactDir, context);

  console.log(
    JSON.stringify(
      {
        mode: options.mode,
        source: source.absolutePath,
        sourceSha256: source.sourceHash,
        report: resolve(artifactDir, "report.md"),
        ...pipeline.summary,
      },
      null,
      2,
    ),
  );

  if (options.mode === "plan") process.exitCode = 0;
  else {
    if (pipeline.resolved.unresolved.length) {
      throw new Error(
        `${pipeline.resolved.unresolved.length} shipment(s) are unresolved; see report.md`,
      );
    }
    assertPlanCanApply(pipeline.plan, {
      allowContainerDeletes: options.allowContainerDeletes,
    });
    if (!planHasWrites(pipeline.plan)) {
      console.log(
        "No database changes are required; apply finished as a no-op.",
      );
    } else {
      assertBackendRuntimeBuilt();
      const migrationId = `freightek_json_sync_v1_${source.sourceHash.slice(0, 24)}`;
      const existing = await client.query(
        `SELECT migration_id FROM public.app_schema_migrations
         WHERE migration_id = $1`,
        [migrationId],
      );
      if (existing.rowCount)
        throw new Error("This exact JSON was already applied");

      writeFileSync(
        resolve(artifactDir, "before.json"),
        JSON.stringify(before, null, 2),
        { flag: "wx" },
      );
      const backup = createFullBackup(config, source.sourceHash);
      console.log(`Verified full pg_dump: ${backup.backupPath}`);

      await beginWriteWindow(client);
      try {
        const rehearsalBefore = await snapshotDatabase(client);
        assertSnapshotsEqual(
          before,
          rehearsalBefore,
          "Database before rehearsal",
        );
        const rehearsalPipeline = buildPipeline(source, rehearsalBefore);
        if (!isDeepStrictEqual(rehearsalPipeline.plan, pipeline.plan)) {
          throw new Error("Plan changed before rehearsal");
        }
        assertPlanCanApply(rehearsalPipeline.plan, {
          allowContainerDeletes: options.allowContainerDeletes,
        });
        await applyPlanToDatabase({
          client,
          schema,
          before: rehearsalBefore,
          plan: rehearsalPipeline.plan,
          backendDir,
        });
        await client.query("ROLLBACK");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
      assertSnapshotsEqual(
        before,
        await snapshotDatabase(client),
        "Rehearsal rollback",
      );
      console.log("Rehearsal passed and rollback restored every tracked row.");

      await beginWriteWindow(client);
      let result;
      try {
        const liveBefore = await snapshotDatabase(client);
        assertSnapshotsEqual(before, liveBefore, "Database before apply");
        const livePipeline = buildPipeline(source, liveBefore);
        if (!isDeepStrictEqual(livePipeline.plan, pipeline.plan)) {
          throw new Error("Plan changed before apply");
        }
        assertPlanCanApply(livePipeline.plan, {
          allowContainerDeletes: options.allowContainerDeletes,
        });
        result = await applyPlanToDatabase({
          client,
          schema,
          before: liveBefore,
          plan: livePipeline.plan,
          backendDir,
        });
        const scriptChecksum = sha256(
          Buffer.concat(
            [
              "index.mjs",
              "src/core.mjs",
              "src/database.mjs",
              "../../backend2.0/scripts/lib/freightek-reconcile-20260915.mjs",
              "../../backend2.0/scripts/lib/freightek-authoritative-plan.mjs",
            ].map((path) => readFileSync(resolve(toolDir, path))),
          ),
        );
        await client.query(
          `INSERT INTO public.app_schema_migrations
            (migration_id, script_checksum, status, backup_reference,
             logical_export_reference, details, started_at, completed_at)
           VALUES ($1, $2, 'SUCCEEDED', $3, $4, $5::jsonb, NOW(), NOW())`,
          [
            migrationId,
            scriptChecksum,
            backup.backupPath,
            resolve(artifactDir, "before.json"),
            JSON.stringify({
              sourcePath: source.absolutePath,
              sourceSha256: source.sourceHash,
              summary: pipeline.summary,
              mappings: pipeline.resolved.mappings,
              allowContainerDeletes: options.allowContainerDeletes,
            }),
          ],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }

      writeFileSync(
        resolve(artifactDir, "result.json"),
        JSON.stringify(
          {
            migrationId,
            sourcePath: source.absolutePath,
            sourceSha256: source.sourceHash,
            backup,
            summary: pipeline.summary,
            inserted: result.inserted,
            deleted: result.deleted,
            states: result.states,
          },
          null,
          2,
        ),
        { flag: "wx" },
      );
      writeReports(artifactDir, context, {
        applied: true,
        migrationId,
        backupPath: backup.backupPath,
        backupSha256: backup.backupHash,
      });
      console.log(
        JSON.stringify(
          {
            applied: true,
            migrationId,
            artifactDir,
            ...backup,
            inserted: result.inserted.length,
            deleted: result.deleted.length,
            documentStatesRecalculated: result.states.length,
          },
          null,
          2,
        ),
      );
    }
  }
} finally {
  await client.query("ROLLBACK").catch(() => {});
  await client.end();
}
