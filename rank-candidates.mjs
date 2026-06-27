#!/usr/bin/env node

// Candidate Ranking Script
// Reads candidate evaluation reports and produces a ranked list
// Usage: node rank-candidates.mjs [--top N] [--min-score X] [--format table|json|csv]

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const REPORTS_DIR = 'reports/candidates';
const TRACKER_FILE = 'data/candidates.md';

function parseYamlBlock(content) {
  const match = content.match(/```yaml\n([\s\S]*?)```/);
  if (!match) return null;

  const yaml = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w[\w_]*)\s*:\s*"?([^"]*)"?\s*$/);
    if (kv) yaml[kv[1]] = kv[2];

    const listItem = line.match(/^\s+-\s+"?([^"]*)"?\s*$/);
    if (listItem) {
      const lastKey = Object.keys(yaml).pop();
      if (typeof yaml[lastKey] === 'string' && yaml[lastKey] === '') {
        yaml[lastKey] = [];
      }
      if (Array.isArray(yaml[lastKey])) {
        yaml[lastKey].push(listItem[1]);
      }
    }
  }
  return yaml;
}

function parseReport(content, filename) {
  const header = {};

  const nameMatch = content.match(/# Candidate Evaluation:\s*(.+?)\s*[—-]\s*(.+)/);
  if (nameMatch) {
    header.candidate = nameMatch[1].trim();
    header.role = nameMatch[2].trim();
  }

  const scoreMatch = content.match(/\*\*Score:\*\*\s*([\d.]+)/);
  if (scoreMatch) header.score = parseFloat(scoreMatch[1]);

  const recMatch = content.match(/\*\*Recommendation:\*\*\s*(.+)/);
  if (recMatch) header.recommendation = recMatch[1].trim();

  const mustMatch = content.match(/\*\*Must-haves:\*\*\s*(\d+)\/(\d+)/);
  if (mustMatch) {
    header.must_haves_met = parseInt(mustMatch[1]);
    header.must_haves_total = parseInt(mustMatch[2]);
  }

  const machine = parseYamlBlock(content);
  if (machine) Object.assign(header, machine);

  header.file = filename;
  return header;
}

async function loadReports() {
  if (!existsSync(REPORTS_DIR)) return [];

  const files = await readdir(REPORTS_DIR);
  const reports = [];

  for (const f of files.filter(f => f.endsWith('.md'))) {
    const content = await readFile(join(REPORTS_DIR, f), 'utf-8');
    const parsed = parseReport(content, f);
    if (parsed.score !== undefined) reports.push(parsed);
  }

  return reports.sort((a, b) => (b.score || 0) - (a.score || 0));
}

function formatTable(candidates) {
  const header = '| # | Candidate | Score | Recommendation | Must-Haves | Key Strength | Concern |';
  const sep = '|---|-----------|-------|---------------|------------|--------------|---------|';
  const rows = candidates.map((c, i) => {
    const strengths = Array.isArray(c.top_strengths) ? c.top_strengths[0] : (c.top_strengths || '');
    const concerns = Array.isArray(c.key_concerns) ? c.key_concerns[0] : (c.key_concerns || '');
    return `| ${i + 1} | ${c.candidate || c.candidate_name || 'Unknown'} | ${c.score}/5 | ${c.recommendation || ''} | ${c.must_haves_met || '?'}/${c.must_haves_total || '?'} | ${strengths} | ${concerns} |`;
  });

  return [header, sep, ...rows].join('\n');
}

function formatCSV(candidates) {
  const header = 'Rank,Candidate,Score,Recommendation,MustHavesMet,MustHavesTotal,Priority,File';
  const rows = candidates.map((c, i) =>
    `${i + 1},"${c.candidate || c.candidate_name || 'Unknown'}",${c.score},${c.recommendation || ''},"${c.must_haves_met || ''}","${c.must_haves_total || ''}","${c.interview_priority || ''}","${c.file}"`
  );
  return [header, ...rows].join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  let top = Infinity;
  let minScore = 0;
  let format = 'table';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--top' && args[i + 1]) top = parseInt(args[++i]);
    if (args[i] === '--min-score' && args[i + 1]) minScore = parseFloat(args[++i]);
    if (args[i] === '--format' && args[i + 1]) format = args[++i];
    if (args[i] === '--help') {
      console.log(`
Candidate Ranking

Usage: node rank-candidates.mjs [options]

Options:
  --top N          Show only top N candidates
  --min-score X    Filter candidates below score X
  --format F       Output format: table (default), json, csv
  --help           Show this help
`);
      return;
    }
  }

  const candidates = await loadReports();

  if (candidates.length === 0) {
    console.log('No candidate evaluations found in reports/candidates/');
    console.log('Run evaluations first with the recruiter evaluate mode.');
    return;
  }

  const filtered = candidates
    .filter(c => (c.score || 0) >= minScore)
    .slice(0, top);

  if (format === 'json') {
    console.log(JSON.stringify(filtered, null, 2));
  } else if (format === 'csv') {
    console.log(formatCSV(filtered));
  } else {
    console.log(`\n# Candidate Rankings (${filtered.length} of ${candidates.length})\n`);
    console.log(formatTable(filtered));

    const strongYes = filtered.filter(c => (c.score || 0) >= 4.5);
    const yes = filtered.filter(c => (c.score || 0) >= 4.0 && (c.score || 0) < 4.5);
    const maybe = filtered.filter(c => (c.score || 0) >= 3.5 && (c.score || 0) < 4.0);

    console.log(`\n**Summary:** ${strongYes.length} Strong Yes, ${yes.length} Yes, ${maybe.length} Maybe, ${filtered.length - strongYes.length - yes.length - maybe.length} No/Skip`);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
