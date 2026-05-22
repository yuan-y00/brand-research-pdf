/**
 * gtm-index.js — Insert GTM report card into index.html
 *
 * Pure Node.js (fs + path only). No third-party dependencies.
 *
 * Usage:
 *   node scripts/gtm-index.js --help
 *   node scripts/gtm-index.js --brand <name> --slug <slug> --report <path> --dry-run
 *   node scripts/gtm-index.js --brand <name> --slug <slug> --report <path> --out <path>
 *   node scripts/gtm-index.js --brand <name> --slug <slug> --report <path> --write
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizePathForHtml(filePath) {
  return filePath.replace(/\\/g, '/');
}

function isNonEmpty(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`
gtm-index.js — Insert GTM report card into index.html

Usage:
  node scripts/gtm-index.js [options]

Options:
  --help                Show this help
  --brand <name>        Brand name (e.g. Anker)
  --slug <slug>         Brand slug matching the original report filename
                        (e.g. anker → examples/anker-report.html)
  --report <path>       Path to the new GTM report .html file
  --title <title>       Card heading (default: "{brand} GTM & Product Learning")
  --description <text>  Card subtitle
                        (default: "增长路径、渠道、商业模式与代表产品分析 · GTM 扩展版")
  --tag <text>          Tag labels separated by " · "
                        (default: "GTM 扩展 · 产品学习 · 渠道模式")
  --index <path>        Path to index.html (default: index.html)
  --out <path>          Write result to this file instead of modifying index.html
  --write               Write result back to index.html (explicit opt-in)
  --dry-run             Preview only — print analysis and card HTML, write nothing
  --allow-existing      If the report link already exists in the index, treat it
                        as a success (no-op) instead of refusing. Useful for
                        idempotent workflow runs.
  --force               If the report link already exists in the index, allow the
                        script to continue (but it will still NOT insert a
                        duplicate link)

Without --write, --out, or --dry-run the script prints a hint and exits.
`);
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(args) {
  const opts = {
    help: false,
    brand: '',
    slug: '',
    report: '',
    title: '',
    description: '',
    tag: '',
    index: 'index.html',
    out: '',
    write: false,
    dryRun: false,
    force: false,
    allowExisting: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    switch (arg) {
      case '--help':
        opts.help = true;
        break;
      case '--brand':
        opts.brand = args[++i] || '';
        break;
      case '--slug':
        opts.slug = args[++i] || '';
        break;
      case '--report':
        opts.report = args[++i] || '';
        break;
      case '--title':
        opts.title = args[++i] || '';
        break;
      case '--description':
        opts.description = args[++i] || '';
        break;
      case '--tag':
        opts.tag = args[++i] || '';
        break;
      case '--index':
        opts.index = args[++i] || 'index.html';
        break;
      case '--out':
        opts.out = args[++i] || '';
        break;
      case '--write':
        opts.write = true;
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      case '--force':
        opts.force = true;
        break;
      case '--allow-existing':
        opts.allowExisting = true;
        break;
      default:
        // ignore unknown
        break;
    }
    i++;
  }

  // Defaults that depend on parsed values
  if (!opts.title && opts.brand) {
    opts.title = opts.brand + ' GTM & Product Learning';
  }
  if (!opts.description) {
    opts.description = '增长路径、渠道、商业模式与代表产品分析 · GTM 扩展版';
  }
  if (!opts.tag) {
    opts.tag = 'GTM 扩展 · 产品学习 · 渠道模式';
  }

  return opts;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(opts) {
  const errors = [];

  if (!opts.brand) errors.push('Missing required option: --brand');
  if (!opts.slug) errors.push('Missing required option: --slug');
  if (!opts.report) errors.push('Missing required option: --report');

  if (opts.report) {
    if (!opts.report.endsWith('.html')) {
      errors.push('Report path must end with .html: ' + opts.report);
    }
    var normalized = normalizePathForHtml(opts.report);
    if (!fs.existsSync(normalized)) {
      errors.push('Report file not found: ' + normalized);
    }
  }

  if (opts.index && !fs.existsSync(opts.index)) {
    errors.push('Index file not found: ' + opts.index);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Duplicate check
// ---------------------------------------------------------------------------

/**
 * Returns true if the given HTML already contains a link to `reportPath`.
 */
function hasReportLink(html, reportPath) {
  var normalized = normalizePathForHtml(reportPath);
  // Escape regex-special characters in the path
  var escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var pattern = new RegExp('href\\s*=\\s*["\']' + escaped + '["\']', 'i');
  return pattern.test(html);
}

// ---------------------------------------------------------------------------
// Insertion-point search
// ---------------------------------------------------------------------------

/**
 * Finds where to insert the new card.
 *
 * Priority:
 *   1. Right after the original brand report card (examples/{slug}-report.html)
 *   2. After the last card in <div class="reports">
 *   3. Before </body>
 *
 * Returns { position: <char index>, strategy: <human-readable label> } or null.
 */
function findInsertPosition(html, slug) {
  // --- Priority 1: find the original brand card --------------------------------
  var originalPath = 'examples/' + slug + '-report.html';
  var escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var originalPattern = new RegExp('href\\s*=\\s*["\']' + escapedPath + '["\']', 'i');
  var originalMatch = html.match(originalPattern);

  if (originalMatch) {
    // Find the closing </a> that belongs to this card
    var afterHref = html.substring(originalMatch.index);
    var closeMatch = afterHref.match(/<\/a>/i);
    if (closeMatch) {
      return {
        position: originalMatch.index + closeMatch.index + 4,
        strategy: 'after original brand card: ' + originalPath,
      };
    }
  }

  // --- Priority 2: end of reports list ----------------------------------------
  var reportsStartMatch = html.match(/<div\s+class="reports"[^>]*>/i);
  if (reportsStartMatch) {
    // Find the closing </div> for the reports container.
    // Simple approach: walk forward counting <div and </div levels.
    var depth = 0;
    var inTag = false;
    var reportsEnd = -1;
    for (var i = reportsStartMatch.index; i < html.length; i++) {
      var ch = html[i];
      if (ch === '<') {
        inTag = true;
        if (html.substring(i, i + 5) === '<div ' || html.substring(i, i + 5) === '<div>') {
          depth++;
          i += 3; // skip ahead (loop increment handles the rest)
        } else if (html.substring(i, i + 6) === '</div>') {
          depth--;
          if (depth === 0) {
            reportsEnd = i;
            break;
          }
          i += 4;
        }
        continue;
      }
      if (ch === '>') {
        inTag = false;
      }
    }

    if (reportsEnd > 0) {
      // Find the last </a> before </div>
      var reportsContent = html.substring(reportsStartMatch.index, reportsEnd);
      var allCloseA = [];
      var re = /<\/a>/gi;
      var m;
      while ((m = re.exec(reportsContent)) !== null) {
        allCloseA.push(m.index);
      }
      if (allCloseA.length > 0) {
        var lastCloseIdx = allCloseA[allCloseA.length - 1];
        return {
          position: reportsStartMatch.index + lastCloseIdx + 4,
          strategy: 'end of reports list',
        };
      }
    }
  }

  // --- Priority 3: before </body> ---------------------------------------------
  var bodyMatch = html.match(/<\/body>/i);
  if (bodyMatch) {
    return {
      position: bodyMatch.index,
      strategy: 'before </body>',
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Card HTML builder
// ---------------------------------------------------------------------------

/**
 * Builds a card <a> element matching the existing index.html card style.
 * GTM cards get a blue left border to visually distinguish them.
 */
function buildCard(opts) {
  var href = normalizePathForHtml(opts.report);
  var title = escapeHtml(opts.title);
  var description = escapeHtml(opts.description);
  var tags = opts.tag.split('·').map(function (t) {
    return escapeHtml(t.trim());
  }).filter(function (t) { return t.length > 0; });

  var tagSpans = tags.map(function (t) {
    return '<span class="tag">' + t + '</span>';
  }).join('');

  // Leading \n\n separates this card from the previous one (matching existing
  // blank-line-between-cards style). The card itself has no trailing newline
  // so the existing source text (which starts with \n\n before the next card
  // or \n before </div>) naturally controls spacing.
  return '\n\n    <a href="' + escapeAttr(href) + '" class="card" style="border-left-color: #4A6FA5;">\n' +
    '        <h2>' + title + '</h2>\n' +
    '        <div class="subtitle">' + description + '</div>\n' +
    '        <div class="tags">' + tagSpans + '</div>\n' +
    '    </a>';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  var args = process.argv.slice(2);
  var opts = parseArgs(args);

  if (opts.help || args.length === 0) {
    printHelp();
    return;
  }

  // Validate
  var errors = validate(opts);
  if (errors.length > 0) {
    console.error('[gtm-index] Validation errors:');
    errors.forEach(function (e) { console.error('  - ' + e); });
    process.exitCode = 1;
    return;
  }

  var html = fs.readFileSync(opts.index, 'utf-8');
  var reportPath = normalizePathForHtml(opts.report);

  // Duplicate check
  var duplicate = hasReportLink(html, opts.report);

  // Print analysis
  console.log('[gtm-index] Analysis:');
  console.log('  Brand:        ' + opts.brand);
  console.log('  Slug:         ' + opts.slug);
  console.log('  Report:       ' + reportPath);
  console.log('  Title:        ' + opts.title);
  console.log('  Description:  ' + opts.description);
  console.log('  Tags:         ' + opts.tag);
  console.log('  Index:        ' + opts.index);
  console.log('  Already in index: ' + (duplicate ? 'YES' : 'no'));

  if (duplicate) {
    console.log('');
    console.log('[gtm-index] Report already exists in index: ' + reportPath);

    if (opts.allowExisting) {
      console.log('[gtm-index] No changes needed.');
      process.exitCode = 0;
      return;
    }

    if (opts.write && !opts.force) {
      console.log('[gtm-index] Refusing --write because the link is already present.');
      console.log('[gtm-index] Use --force to bypass this check and write anyway.');
      return;
    }

    if (!opts.force) {
      // Without --force, only show hints — don't write anything.
      if (opts.dryRun) {
        console.log('[gtm-index] Use --force to see the card preview despite existing link.');
      } else if (opts.out) {
        console.log('[gtm-index] Use --force to write the output file despite existing link.');
      } else {
        console.log('[gtm-index] Nothing to do. Exiting.');
      }
      return;
    }

    // --force: allow the operation but never insert a duplicate link.
    // For --out this means copying the source as-is (the link already exists in it).
    // For --write this means nothing to change.
    if (opts.dryRun) {
      var cardHtml = buildCard(opts);
      console.log('');
      console.log('[gtm-index] --dry-run: No files written.');
      console.log('[gtm-index] Link already present — card would NOT be inserted again.');
      console.log('[gtm-index] Card HTML (for reference only):');
      console.log(cardHtml);
      return;
    }

    if (opts.out) {
      var outDir = path.dirname(opts.out);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      // Copy source as-is — the link is already present, no insertion needed.
      fs.writeFileSync(opts.out, html, 'utf-8');
      console.log('');
      console.log('[gtm-index] Written to: ' + opts.out + ' (source copied as-is, link already present)');
      console.log('[gtm-index] Original ' + opts.index + ' unchanged.');
      return;
    }

    if (opts.write) {
      console.log('[gtm-index] Link already present in ' + opts.index + ' — nothing to change.');
      return;
    }

    console.log('[gtm-index] Nothing to do. Exiting.');
    return;
  }

  // --- Not a duplicate — proceed with normal insertion -------------------------

  // Find insertion point
  var insertPos = findInsertPosition(html, opts.slug);
  if (!insertPos) {
    console.error('[gtm-index] Cannot determine a safe insertion position in ' + opts.index + '.');
    console.error('[gtm-index] The file structure may not support automatic insertion.');
    process.exitCode = 1;
    return;
  }

  console.log('  Insert strategy: ' + insertPos.strategy);

  var cardHtml = buildCard(opts);

  if (opts.dryRun) {
    console.log('');
    console.log('[gtm-index] --dry-run: No files written.');
    console.log('[gtm-index] Card HTML preview:');
    console.log(cardHtml);
    return;
  }

  // Build output HTML
  var newHtml = html.substring(0, insertPos.position) + cardHtml + html.substring(insertPos.position);

  if (opts.out) {
    var outDir2 = path.dirname(opts.out);
    if (!fs.existsSync(outDir2)) {
      fs.mkdirSync(outDir2, { recursive: true });
    }
    fs.writeFileSync(opts.out, newHtml, 'utf-8');
    console.log('');
    console.log('[gtm-index] Written to: ' + opts.out);
    console.log('[gtm-index] Original ' + opts.index + ' unchanged.');
    return;
  }

  if (opts.write) {
    fs.writeFileSync(opts.index, newHtml, 'utf-8');
    console.log('');
    console.log('[gtm-index] Written to: ' + opts.index);
    return;
  }

  // Neither write, out, nor dry-run
  console.log('');
  console.log('[gtm-index] No action specified.');
  console.log('[gtm-index] Use --write, --out <path>, or --dry-run.');
  console.log('[gtm-index] Run with --help for usage.');
}

main();
