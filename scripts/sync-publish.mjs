#!/usr/bin/env node
/**
 * publish/ → the site.
 *
 * Two passes only. This is a novel: chapters and the pictures in them. There is no
 * DM material here — world canon, modules, maps and both tables' records live in the
 * private EthiumSource repo.
 */
import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publishDir = path.join(root, 'publish');

const chapterSources = path.join(publishDir, 'chapters');
const illustrationSources = path.join(publishDir, 'illustrations');
const chapterTargets = path.join(root, 'src/content/chapters');
const illustrationTargets = path.join(root, 'public/illustrations');

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']);

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function cleanDir(dir) {
  await rm(dir, { recursive: true, force: true });
  await ensureDir(dir);
}

/** Chapters copy across untouched — the markdown is the source of truth. */
async function syncChapters() {
  await ensureDir(chapterSources);
  await cleanDir(chapterTargets);

  const entries = await readdir(chapterSources, { withFileTypes: true });
  let copied = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    if (entry.name.startsWith('_')) continue;
    if (entry.name.toLowerCase() === 'readme.md') continue;

    await cp(path.join(chapterSources, entry.name), path.join(chapterTargets, entry.name));
    console.log(`chapter  ${entry.name}`);
    copied += 1;
  }

  return copied;
}

async function syncAssetTree(sourceDir, targetDir, relativePath = '') {
  let entries;
  try {
    entries = await readdir(sourceDir, { withFileTypes: true });
  } catch {
    return 0;
  }

  let copied = 0;
  for (const entry of entries) {
    const rel = path.join(relativePath, entry.name);
    const from = path.join(sourceDir, entry.name);

    if (entry.isDirectory()) {
      copied += await syncAssetTree(from, targetDir, rel);
      continue;
    }
    if (!imageExtensions.has(path.extname(entry.name).toLowerCase())) continue;

    const to = path.join(targetDir, rel);
    await ensureDir(path.dirname(to));
    await cp(from, to);
    console.log(`image    ${rel}`);
    copied += 1;
  }
  return copied;
}

async function syncIllustrations() {
  await ensureDir(illustrationSources);
  await cleanDir(illustrationTargets);
  return syncAssetTree(illustrationSources, illustrationTargets);
}

async function main() {
  try {
    await stat(publishDir);
  } catch {
    console.error('Missing publish/ folder.');
    process.exit(1);
  }

  console.log('Syncing publish/ → site…\n');
  const chapters = await syncChapters();
  const images = await syncIllustrations();
  console.log(`\nDone. ${chapters} chapter(s), ${images} illustration(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
