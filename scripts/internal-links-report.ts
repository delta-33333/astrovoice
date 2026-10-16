import { inboundStats, linkReport } from '../lib/link-graph.ts';
import { AVIS_PATH } from '../lib/avis-callastral.ts';
import { ascendantPath } from '../lib/ascendant-tool.ts';
import { LOCALES } from '../lib/seo.ts';

const report = linkReport();
const stats = inboundStats();
const money = [...LOCALES.map((locale) => ascendantPath(locale)), AVIS_PATH];
const moneyRows = money.map((path) => stats.find((row) => row.path === path));

console.log(JSON.stringify({
  pages: report.pages,
  edges: report.edges,
  textEdges: report.textEdges,
  orphans: report.orphans.length,
  underThree: report.underThree.length,
  orphanPaths: report.orphans,
  underThreePaths: report.underThree,
  moneyTextInbound: Object.fromEntries(moneyRows.map((row) => [row?.path ?? '?', row?.text ?? 0])),
}, null, 2));
