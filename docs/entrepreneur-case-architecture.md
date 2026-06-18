# Entrepreneur Case Architecture

The project now has a third report pipeline:

```bash
data/cases/<slug>.json
  -> scripts/case-check.js
  -> scripts/case-render.js
  -> examples/<slug>-case.html
```

This pipeline exists because founder-learning cases should not be forced into a
normal brand/GTM template.

## First Principle

The report exists to help an entrepreneur understand:

- why this product was developed
- what market pain made it worth building
- what technical, supply-chain, channel, service, or regulatory difficulties it faced
- what known costs and return signals exist
- whether ROI can be calculated
- what cannot be calculated from public sources
- what official-site and hiring signals imply about the next business line

## Report Types

- `product_company_case`: product-led company, such as Mammotion or Shokz.
- `platform_company_case`: platform company, such as Apple or WeChat.
- `person_method_case`: person/product-method case, such as Steve Jobs or Zhang Xiaolong.
- `gtm_comparison_case`: category comparison.

## Core Product Case

The old `top_products` idea is not enough. A product case must answer:

- Why was it developed?
- What original pain did it solve?
- Why did incumbents fail or move slowly?
- What were the development difficulties?
- What known development cost signals exist?
- How was it commercialized?
- What is the product / accessory / service / software / competitor pricing?
- What return evidence exists?
- Can ROI be calculated?
- What inputs are missing?
- What should an entrepreneur learn?

## Recruitment Signals

Hiring data is a leading indicator, not a fact by itself.

Allowed evidence statuses:

- `observed_job_post`: a specific job post title and URL were captured.
- `job_board_index`: a job-board/company jobs page exists, but individual JD text was not captured.
- `watchlist_not_yet_captured`: a role family should be monitored, but no durable source was captured yet.

Rules:

1. Recruitment signals may support an inference.
2. They cannot prove a business line alone.
3. Every recruitment signal must include validation_needed.
4. If no durable JD is captured, the report must say so.

## Official-Site Signals

Official-site signals include:

- new product pages
- technology keywords
- pricing changes
- service/support changes
- dealer/distributor pages
- country/language expansion
- investor or leadership pages

These signals are stronger than PR copy because they show where the company is
actually changing the product, service, or channel surface.

## ROI Rule

ROI can be calculated only when public evidence gives enough cost and return
inputs.

If public sources lack BOM, R&D payroll, tooling, CAC, refund, warranty reserve,
logistics, service cost, and gross margin, set:

```json
"calculable": false
```

Then list the missing inputs explicitly. Do not write a fake ROI.

## Commands

```bash
node scripts/case-check.js data/cases/mammotion.json
node scripts/case-render.js data/cases/mammotion.json --check --force
node scripts/generated-inventory.js
```
