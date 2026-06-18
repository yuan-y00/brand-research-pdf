# Report Data Requirements

These requirements apply to every new or regenerated brand report. They are meant to prevent reports that look polished but miss the money trail, founder proof, and pricing reality.

## Must-Have Sections

### 1. Product And Competitor Pricing

For each key product or product line, collect a pricing stack:

- Product body price: MSRP, launch price, current official or marketplace price.
- Bundle price: starter kit, family pack, or enterprise bundle when a sourced price exists.
- Accessories and consumables: replacement parts, attachments, filters, batteries, ink, blades, installation kits, or service parts when sourced.
- Software / subscription: app subscription, SaaS, cloud plan, membership, RaaS, per-hour fee, or per-seat fee when sourced.
- Service costs: warranty, installation, deployment, training, repair, or support when sourced.
- Competitor prices: at least two comparable competitors, including product price and subscription/accessory/service price where available.
- Unit economics signals: gross margin, hardware cost, deployment cost, recall loss, CAC/payback hints when sourced.
- Sources: official store/pricing page first, then marketplaces, filings, investor decks, credible reviews, media, or dealer quotes.

### 2. Founder Profile Links

Every founder and major CEO/operator profile must include at least one clickable source:

- Company team/about page.
- LinkedIn profile.
- SEC filing, S-1, DEF14A, annual report, or investor relations bio.
- University, lab, or patent profile.
- Credible media interview/profile, podcast transcript, or Wikipedia.

Do not only write a founder biography from memory. Link the biography to sources.

### 3. Capital History / Money Trail

Write capital history as chronological money events, not as a loose paragraph.

Required event types:

- Founder first money: savings, family/friends, loan, prior exit, grant, scholarship, or angel check when sourced.
- First revenue or first order: amount, platform/customer, and date when sourced.
- Major spend: factory capex, R&D spend, marketing burn, inventory, tooling, or deployment cost when sourced.
- Funding rounds: date, amount, lead investor, valuation if public.
- Profit/loss events: recall loss, lawsuits, restructuring, write-down, bankruptcy risk, IPO proceeds, acquisition value.
- Current financial state: revenue, ARR, GMV, gross margin, net income/loss, or cash flow signal when sourced.

Each event should include an amount, currency, date, source, and confidence.

## Base Report JSON Field Names

Use these fields in `data/reports/<slug>.json`:

- `brand_context.brand_name`
- `brand_context.slug`
- `brand_context.one_line`
- `brand_context.founder_profiles[]`
- `brand_context.capital_history[]`
- `pricing.boundary_notes.accessory_service`
- `pricing.boundary_notes.subscription_software`
- `pricing.products[].product_price`
- `pricing.products[].accessories[]`
- `pricing.products[].services[]`
- `pricing.products[].subscriptions[]`
- `pricing.products[].competitors[]`
- `pricing.products[].unit_economics[]`
- `sections[]`
- `sources[]`

Render path:

```bash
node scripts/report-check.js data/reports/<slug>.json
node scripts/report-render.js data/reports/<slug>.json --out examples/<slug>-report.html
```

Workflow shortcut:

```bash
node scripts/report-workflow.js "<Brand>" --publish --with-gtm --force
```

## GTM JSON Field Names

Use these fields in GTM JSON and when preparing source material for HTML reports:

- `brand_context.founder_profiles`
- `brand_context.capital_history`
- `gtm_extension.top_products[].pricing_model`

Do not write placeholders such as `not_found`, `unknown`, or search links into report data. If a fact cannot be sourced, omit that field and let `scripts/report-audit.js` surface the missing signal in `docs/report-gap-audit.md`.

## Regeneration Rule

If an existing report lacks these fields, do not patch only the visual HTML. Regenerate or deeply revise the report content so the missing evidence appears in the body tables/cards and in the GTM JSON.
