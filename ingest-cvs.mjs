#!/usr/bin/env node

// CV Ingestion Pipeline — PDF to Markdown
// Reads PDF CVs from a directory (or a connected database/drive),
// extracts text via Playwright, and writes markdown files to data/candidates/

import { chromium } from 'playwright';
import { readdir, readFile, writeFile, mkdir, stat } from 'fs/promises';
import { join, basename, extname } from 'path';
import { existsSync } from 'fs';

const CANDIDATES_DIR = 'data/candidates';
const INPUT_DIR = process.argv[2] || 'input-cvs';
const SUPPORTED_EXT = ['.pdf'];

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function extractTextFromPDF(pdfPath, browser) {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const pdfBuffer = await readFile(pdfPath);
    const base64 = pdfBuffer.toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64}`;

    await page.goto(dataUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const text = await page.evaluate(() => {
      const textLayers = document.querySelectorAll('.textLayer span, [role="presentation"] span');
      if (textLayers.length > 0) {
        return Array.from(textLayers).map(s => s.textContent).join(' ');
      }
      return document.body.innerText || '';
    });

    return text.trim();
  } catch (err) {
    console.error(`  Error extracting ${basename(pdfPath)}: ${err.message}`);
    return null;
  } finally {
    await context.close();
  }
}

function textToMarkdown(text, filename) {
  const name = basename(filename, extname(filename))
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const lines = text.split(/\n+/).filter(l => l.trim());

  let md = `# ${name}\n\n`;
  md += `> Source: ${filename}\n\n`;
  md += lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.length < 40 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
      return `\n## ${trimmed.charAt(0) + trimmed.slice(1).toLowerCase()}\n`;
    }
    return trimmed;
  }).join('\n');

  return md;
}

async function processDirectory(inputDir) {
  await ensureDir(CANDIDATES_DIR);

  const entries = await readdir(inputDir);
  const pdfs = entries.filter(f => SUPPORTED_EXT.includes(extname(f).toLowerCase()));

  if (pdfs.length === 0) {
    console.log(`No PDF files found in ${inputDir}`);
    console.log('Place CV PDFs in this directory and run again.');
    return { processed: 0, failed: 0, skipped: 0 };
  }

  console.log(`Found ${pdfs.length} CV(s) to process\n`);

  const browser = await chromium.launch({ headless: true });
  let processed = 0, failed = 0, skipped = 0;

  for (const pdf of pdfs) {
    const slug = slugify(basename(pdf, extname(pdf)));
    const outPath = join(CANDIDATES_DIR, `${slug}.md`);

    if (existsSync(outPath)) {
      console.log(`  SKIP ${pdf} (already processed)`);
      skipped++;
      continue;
    }

    process.stdout.write(`  Processing ${pdf}...`);

    const text = await extractTextFromPDF(join(inputDir, pdf), browser);
    if (!text || text.length < 50) {
      console.log(' FAILED (no text extracted)');
      failed++;
      continue;
    }

    const md = textToMarkdown(text, pdf);
    await writeFile(outPath, md, 'utf-8');
    console.log(` OK (${text.length} chars → ${outPath})`);
    processed++;
  }

  await browser.close();

  return { processed, failed, skipped };
}

async function processGoogleDrive(folderId) {
  console.log(`Google Drive ingestion: folder ${folderId}`);
  console.log('Use the Google Drive MCP tools to list and download PDFs,');
  console.log('then save them to input-cvs/ and re-run this script.');
  console.log('\nOr use the AI agent directly — it can read Drive files');
  console.log('and parse them in-context without this script.');
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
CV Ingestion Pipeline

Usage:
  node ingest-cvs.mjs [input-dir]        Process PDFs from directory (default: input-cvs/)
  node ingest-cvs.mjs --drive <folder-id> Instructions for Google Drive ingestion
  node ingest-cvs.mjs --list              List already-ingested candidates

Options:
  --help    Show this help
  --list    List candidates in data/candidates/
  --drive   Google Drive folder instructions
  --stats   Show ingestion statistics
`);
    return;
  }

  if (args[0] === '--list') {
    await ensureDir(CANDIDATES_DIR);
    const files = await readdir(CANDIDATES_DIR);
    const mds = files.filter(f => f.endsWith('.md'));
    if (mds.length === 0) {
      console.log('No candidates ingested yet.');
    } else {
      console.log(`${mds.length} candidate(s):\n`);
      for (const f of mds.sort()) {
        const content = await readFile(join(CANDIDATES_DIR, f), 'utf-8');
        const firstLine = content.split('\n').find(l => l.startsWith('# ')) || f;
        console.log(`  ${f.padEnd(40)} ${firstLine.replace('# ', '')}`);
      }
    }
    return;
  }

  if (args[0] === '--drive') {
    await processGoogleDrive(args[1] || '<folder-id>');
    return;
  }

  if (args[0] === '--stats') {
    await ensureDir(CANDIDATES_DIR);
    const files = await readdir(CANDIDATES_DIR);
    const mds = files.filter(f => f.endsWith('.md'));
    let totalChars = 0;
    for (const f of mds) {
      const s = await stat(join(CANDIDATES_DIR, f));
      totalChars += s.size;
    }
    console.log(JSON.stringify({
      candidates: mds.length,
      total_size_kb: Math.round(totalChars / 1024),
      directory: CANDIDATES_DIR
    }, null, 2));
    return;
  }

  const inputDir = args[0] || INPUT_DIR;

  if (!existsSync(inputDir)) {
    await mkdir(inputDir, { recursive: true });
    console.log(`Created ${inputDir}/ — place your CV PDFs here and run again.`);
    return;
  }

  const result = await processDirectory(inputDir);
  console.log(`\nDone: ${result.processed} processed, ${result.failed} failed, ${result.skipped} skipped`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
