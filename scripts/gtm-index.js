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
  --position <pos>      Where to insert the new card (default: top)
                        top         — before the first card in reports list
                        after-brand — after the original brand card
                        end         — at the end of reports list
  --move-existing-to-top  If the report link already exists in index, move the
                        existing card to the top of the reports list instead of
                        inserting a duplicate.
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
    position: 'top',
    moveExistingToTop: false,
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
      case '--position':
        opts.position = args[++i] || 'top';
        break;
      case '--move-existing-to-top':
        opts.moveExistingToTop = true;
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

  var validPositions = ['top', 'after-brand', 'end'];
  if (validPositions.indexOf(opts.position) === -1) {
    errors.push('Invalid --position value: "' + opts.position + '". Must be one of: ' + validPositions.join(', '));
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
// Card range & position helpers
// ---------------------------------------------------------------------------

/**
 * Finds the start/end range of an existing card <a> element that links to
 * `reportPath`. Returns { start, end } or null.
 */
function findCardRange(html, reportPath) {
  var normalized = normalizePathForHtml(reportPath);
  var escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var hrefPattern = new RegExp('href\\s*=\\s*["\']' + escaped + '["\']', 'i');
  var hrefMatch = html.match(hrefPattern);
  if (!hrefMatch) return null;

  var hrefPos = hrefMatch.index;

  // Search backwards for the opening <a tag
  var searchStart = Math.max(0, hrefPos - 600);
  var beforeHref = html.substring(searchStart, hrefPos);
  var lastA = beforeHref.lastIndexOf('<a ');
  if (lastA === -1) return null;

  var cardStart = searchStart + lastA;

  // Search forward for the matching </a>
  var afterHref = html.substring(hrefPos);
  var closeA = afterHref.indexOf('</a>');
  if (closeA === -1) return null;

  var cardEnd = hrefPos + closeA + 4;

  return { start: cardStart, end: cardEnd };
}

/**
 * Returns the character position just before the first <a class="card"> inside
 * <div class="reports">, or null if no card is found.
 */
function findFirstCardInReports(html) {
  var reportsMatch = html.match(/<div\s+class="reports"[^>]*>/i);
  if (!reportsMatch) return null;

  var afterReports = html.substring(reportsMatch.index + reportsMatch[0].length);
  var firstA = afterReports.match(/<a\s/);
  if (!firstA) return null;

  return reportsMatch.index + reportsMatch[0].length + firstA.index;
}

/**
 * Returns the character position of the closing </div> for the reports
 * container, or null.
 */
function findReportsEnd(html) {
  var reportsStartMatch = html.match(/<div\s+class="reports"[^>]*>/i);
  if (!reportsStartMatch) return null;

  var depth = 1;
  var i = reportsStartMatch.index + reportsStartMatch[0].length;
  while (i < html.length && depth > 0) {
    if (html.substring(i, i + 5) === '<div ' || html.substring(i, i + 5) === '<div>') {
      depth++;
      i += 4;
    } else if (html.substring(i, i + 6) === '</div>') {
      depth--;
      if (depth === 0) return i;
      i += 5;
    }
    i++;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Insertion-point search
// ---------------------------------------------------------------------------

/**
 * Finds where to insert the new card.
 *
 * @param {string} html — full index.html content
 * @param {string} slug — brand slug
 * @param {string} position — 'top', 'after-brand', or 'end'
 *
 * Priority for 'top':
 *   1. Before the first <a> card inside <div class="reports">
 *   2. After <div class="reports"> opening tag (if no cards)
 *   3. Fallback to after original brand card logic
 *
 * Priority for 'after-brand':
 *   1. Right after the original brand report card (examples/{slug}-report.html)
 *   2. After the last card in <div class="reports">
 *   3. Before </body>
 *
 * Priority for 'end':
 *   1. Before the closing </div> of <div class="reports">
 *   2. Before </body>
 *
 * Returns { position: <char index>, strategy: <human-readable label> } or null.
 */
function findInsertPosition(html, slug, position) {
  position = position || 'top';

  // --- Position: top ---------------------------------------------------------
  if (position === 'top') {
    var topPos = findFirstCardInReports(html);
    if (topPos !== null) {
      return {
        position: topPos,
        strategy: 'top of reports list (before first card)',
      };
    }

    // No cards yet — insert right after the reports opening tag
    var reportsOpen = html.match(/<div\s+class="reports"[^>]*>/i);
    if (reportsOpen) {
      return {
        position: reportsOpen.index + reportsOpen[0].length,
        strategy: 'top of reports list (after opening div, no cards found)',
      };
    }

    // Fallback to after-brand logic
    return findInsertPosition(html, slug, 'after-brand');
  }

  // --- Position: end ---------------------------------------------------------
  if (position === 'end') {
    var endPos = findReportsEnd(html);
    if (endPos !== null) {
      return {
        position: endPos,
        strategy: 'end of reports list (before closing </div>)',
      };
    }

    // Fallback
    var bodyMatchEnd = html.match(/<\/body>/i);
    if (bodyMatchEnd) {
      return {
        position: bodyMatchEnd.index,
        strategy: 'before </body> (reports container not found)',
      };
    }
    return null;
  }

  // --- Position: after-brand (original logic) --------------------------------
  var originalPath = 'examples/' + slug + '-report.html';
  var escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var originalPattern = new RegExp('href\\s*=\\s*["\']' + escapedPath + '["\']', 'i');
  var originalMatch = html.match(originalPattern);

  if (originalMatch) {
    var afterHref = html.substring(originalMatch.index);
    var closeMatch = afterHref.match(/<\/a>/i);
    if (closeMatch) {
      return {
        position: originalMatch.index + closeMatch.index + 4,
        strategy: 'after original brand card: ' + originalPath,
      };
    }
  }

  // Fallback: end of reports list
  var reportsStartMatch = html.match(/<div\s+class="reports"[^>]*>/i);
  if (reportsStartMatch) {
    var reportsEndResult = findReportsEnd(html);
    if (reportsEndResult !== null) {
      // Find the last </a> before </div>
      var reportsContent = html.substring(reportsStartMatch.index, reportsEndResult);
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

  // Final fallback
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
  console.log('  Position:     ' + opts.position);
  console.log('  Move to top:  ' + (opts.moveExistingToTop ? 'YES' : 'no'));
  console.log('  Already in index: ' + (duplicate ? 'YES' : 'no'));

  if (duplicate) {
    console.log('');
    console.log('[gtm-index] Report already exists in index: ' + reportPath);

    // --- move-existing-to-top ------------------------------------------------
    if (opts.moveExistingToTop) {
      var cardRange = findCardRange(html, opts.report);
      if (!cardRange) {
        console.error('[gtm-index] Cannot locate existing card element for: ' + reportPath);
        process.exitCode = 1;
        return;
      }

      // Check if already near the top
      var firstCardPos = findFirstCardInReports(html);
      if (firstCardPos !== null && cardRange.start <= firstCardPos + 150) {
        console.log('[gtm-index] Card is already at the top of the reports list. No move needed.');
        if (opts.dryRun) {
          console.log('[gtm-index] --dry-run: No files written.');
          return;
        }
        if (opts.out) {
          var outDirMT = path.dirname(opts.out);
          if (!fs.existsSync(outDirMT)) fs.mkdirSync(outDirMT, { recursive: true });
          fs.writeFileSync(opts.out, html, 'utf-8');
          console.log('[gtm-index] Written to: ' + opts.out + ' (copied as-is, card already at top)');
          return;
        }
        if (opts.write) {
          console.log('[gtm-index] Card already at top — nothing to change in ' + opts.index + '.');
          return;
        }
        return;
      }

      // Extract card with surrounding whitespace
      var extractStart = cardRange.start;
      var before = html.substring(Math.max(0, extractStart - 100), extractStart);
      var nlNl = before.lastIndexOf('\n\n');
      if (nlNl !== -1) {
        extractStart = extractStart - (before.length - nlNl - 2);
      }
      var cardHtmlContent = html.substring(extractStart, cardRange.end);

      // Also capture trailing newline if present
      var trailingEnd = cardRange.end;
      if (html.substring(trailingEnd, trailingEnd + 1) === '\n') {
        trailingEnd++;
      }

      // Remove card from current position
      var htmlWithoutCard = html.substring(0, extractStart) + html.substring(trailingEnd);

      // Find insertion point at top
      var moveInsertPos = findFirstCardInReports(htmlWithoutCard);
      if (moveInsertPos === null) {
        var roMatch2 = htmlWithoutCard.match(/<div\s+class="reports"[^>]*>/i);
        if (roMatch2) {
          moveInsertPos = roMatch2.index + roMatch2[0].length;
        }
      }

      if (moveInsertPos === null) {
        console.error('[gtm-index] Cannot find reports insertion point for move-to-top.');
        process.exitCode = 1;
        return;
      }

      var movedHtml = htmlWithoutCard.substring(0, moveInsertPos) + cardHtmlContent + htmlWithoutCard.substring(moveInsertPos);

      console.log('[gtm-index] Moving existing card to top of reports list.');

      if (opts.dryRun) {
        console.log('');
        console.log('[gtm-index] --dry-run: No files written.');
        console.log('[gtm-index] Card would be moved to top.');
        return;
      }

      if (opts.out) {
        var outDirMT2 = path.dirname(opts.out);
        if (!fs.existsSync(outDirMT2)) fs.mkdirSync(outDirMT2, { recursive: true });
        fs.writeFileSync(opts.out, movedHtml, 'utf-8');
        console.log('');
        console.log('[gtm-index] Written to: ' + opts.out + ' (card moved to top)');
        console.log('[gtm-index] Original ' + opts.index + ' unchanged.');
        return;
      }

      if (opts.write) {
        fs.writeFileSync(opts.index, movedHtml, 'utf-8');
        console.log('');
        console.log('[gtm-index] Written to: ' + opts.index + ' (card moved to top)');
        return;
      }

      console.log('');
      console.log('[gtm-index] No action specified. Use --write, --out <path>, or --dry-run.');
      return;
    }

    // --- allow-existing (no-op) ----------------------------------------------
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
  var insertPos = findInsertPosition(html, opts.slug, opts.position);
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
