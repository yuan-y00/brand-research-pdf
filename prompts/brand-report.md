# Brand Base Report Research Prompt

You are preparing a structured brand research report for:

Brand: {{brand_name}}
Slug: {{slug}}

Output must be valid JSON matching `data/reports/_template.brand-report.json`.

## First Principles

This project is not trying to produce a pretty brand biography. It is trying to answer:

1. What does the product sell, and what is the full pricing stack?
2. What do competitors charge for comparable alternatives?
3. Who founded or operated the company, and what public links prove their background?
4. Where did the first money come from, what was earned, spent, raised, lost, or written down?
5. Which decisions created durable advantage, and which decisions created avoidable risk?
6. Which facts are sourced, and which facts should be omitted because they cannot be verified?

## Hard Rules

- Do not write placeholders such as `not_found`, `unknown`, `not_public`, or search-result URLs.
- If a fact cannot be sourced, omit the field or write a sourced boundary note.
- Founder biographies need clickable profile links.
- Product pricing needs product price, accessories/services, subscription/software boundary, and competitor prices.
- Capital history must be chronological and include money events with date, amount, currency, source, and confidence when sourced.
- Use official pricing pages, filings, investor relations, credible founder profiles, product support pages, and reputable media.
- Output JSON only. No Markdown wrapper.

## Required JSON Shape

Use this template and replace example values with sourced facts:

```json
{{template_json}}
```
