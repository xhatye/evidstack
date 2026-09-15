import { BATCH4_AUDIT_CHUNK_1 } from "./batch4-audit-1.js";
import { BATCH4_AUDIT_CHUNK_2 } from "./batch4-audit-2.js";
import { BATCH4_AUDIT_CHUNK_3 } from "./batch4-audit-3.js";
import { BATCH4_AUDIT_CHUNK_4 } from "./batch4-audit-4.js";
import { BATCH4_AUDIT_CHUNK_5 } from "./batch4-audit-5.js";
import { BATCH4_AUDIT_CHUNK_6 } from "./batch4-audit-6.js";
import { BATCH4_AUDIT_CHUNK_7 } from "./batch4-audit-7.js";
import { BATCH4_AUDIT_CHUNK_8 } from "./batch4-audit-8.js";
import { BATCH4_AUDIT_CHUNK_9 } from "./batch4-audit-9.js";

export const BATCH4_EVIDENCE_AUDITS = [
  ...BATCH4_AUDIT_CHUNK_1,
  ...BATCH4_AUDIT_CHUNK_2,
  ...BATCH4_AUDIT_CHUNK_3,
  ...BATCH4_AUDIT_CHUNK_4,
  ...BATCH4_AUDIT_CHUNK_5,
  ...BATCH4_AUDIT_CHUNK_6,
  ...BATCH4_AUDIT_CHUNK_7,
  ...BATCH4_AUDIT_CHUNK_8,
  ...BATCH4_AUDIT_CHUNK_9,
];

export const BATCH4_EVIDENCE_AUDIT_BY_ID = Object.fromEntries(
  BATCH4_EVIDENCE_AUDITS.map((audit) => [audit.catalogId, audit]),
);

