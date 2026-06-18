#!/usr/bin/env node
/*
 * cleanup-generated-noise.js
 *
 * Removes generated filler from previous repair attempts:
 * - BASE_EVIDENCE_REPAIR blocks in examples/*.html
 * - not_found / unknown / placeholder search values in data/gtm/*.json
 *
 * Missing facts should live in audit docs, not in report bodies.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXAMPLES_DIR = path.join(ROOT, 'examples');
const GTM_DIR = path.join(ROOT, 'data', 'gtm');

const BASE_REPAIR_START = '<!-- BASE_EVIDENCE_REPAIR_START -->';
const BASE_REPAIR_END = '<!-- BASE_EVIDENCE_REPAIR_END -->';

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function removeBaseRepairBlocks(html) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('\\s*' + esc(BASE_REPAIR_START) + '[\\s\\S]*?' + esc(BASE_REPAIR_END) + '\\s*', 'g');
  return html.replace(re, '\n');
}

function isPlaceholderString(value) {
  const s = value.trim().toLowerCase();
  if (!s) return true;
  if (/^n\/a$/.test(s)) return true;
  if (/^unknown$/.test(s)) return true;
  if (/^not[_ -]?found/.test(s)) return true;
  if (/^not[_ -]?applicable/.test(s)) return true;
  if (/not_found|not found|not_disclosed|not disclosed|not_public|not public|unknown/i.test(value)) return true;
  if (/google\.com\/search|bing\.com\/search|placeholder/i.test(value)) return true;
  return false;
}

function cleanValue(value) {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    return isPlaceholderString(value) ? undefined : value;
  }
  if (Array.isArray(value)) {
    const cleaned = value
      .map(cleanValue)
      .filter((item) => item !== undefined)
      .filter((item) => !(Array.isArray(item) && item.length === 0))
      .filter((item) => !(item && typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length === 0));
    return cleaned.length ? cleaned : undefined;
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      const cleaned = cleanValue(child);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return value;
}

function stripHtmlFiles() {
  const htmlFiles = fs.readdirSync(EXAMPLES_DIR)
    .filter((name) => /\.html$/i.test(name))
    .map((name) => path.join(EXAMPLES_DIR, name));

  for (const filePath of htmlFiles) {
    const before = fs.readFileSync(filePath, 'utf8');
    const after = removeBaseRepairBlocks(before);
    if (after !== before) {
      fs.writeFileSync(filePath, after, 'utf8');
      console.log('[cleanup-generated-noise] stripped appendix ' + rel(filePath));
    }
  }
}

function cleanGtmJson() {
  const jsonFiles = fs.readdirSync(GTM_DIR)
    .filter((name) => /\.json$/i.test(name))
    .map((name) => path.join(GTM_DIR, name));

  for (const filePath of jsonFiles) {
    const beforeText = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(beforeText);
    const cleaned = cleanValue(data) || {};
    const afterText = JSON.stringify(cleaned, null, 2) + '\n';
    if (afterText !== beforeText) {
      fs.writeFileSync(filePath, afterText, 'utf8');
      console.log('[cleanup-generated-noise] cleaned placeholders ' + rel(filePath));
    }
  }
}

function main() {
  stripHtmlFiles();
  cleanGtmJson();
}

main();
