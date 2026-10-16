import { thinReport } from '../lib/thin-content.ts';

const report = thinReport();
const sample = report.rows
  .filter((row) => row.noindex)
  .slice(0, 8)
  .map((row) => ({
    path: row.path,
    kind: row.kind,
    uniqueWords: row.uniqueWords,
    maxJaccard: Number(row.maxJaccard.toFixed(3)),
  }));

console.log(JSON.stringify({
  total: report.total,
  noindex: report.noindex,
  indexable: report.indexable,
  byKind: report.byKind,
  sample,
}, null, 2));
