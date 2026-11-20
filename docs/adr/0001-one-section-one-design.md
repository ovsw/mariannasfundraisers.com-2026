# 1. One section, one design

Date: 2026-11-18

## Status

Accepted. Ported from the Setebaid Website (its ADR 0003, decided with Ovi
on 2026-11-06), so that every project copy starts with the rule.

## Context

On the Setebaid Website, six Page Builder sections got a second or third
design, chosen in a `layout` field (`variant` on one section). Thirteen
designs sat behind six catalogue thumbnails, and within weeks 44 blocks on
about 30 pages used a non-default design.

The cost showed up in three places:

- The catalogue thumbnail shows one design. An editor who picks a section
  from the catalogue cannot see what a different `layout` value will draw.
- Each design shows and hides different fields through `hidden` rules, so
  the editor fills a form that changes under them. A field hidden for one
  design can still be filled through the API, and then renders nowhere, or
  makes the renderer drop the whole section. A Feature Cards section on the
  Alumni page drew nothing for that reason: its cards were filled for one
  design while the section used another.
- The boundary resolver and the renderers carry special cases keyed on the
  field value, so a section's behaviour depends on data, not on its type.

The alternative was to keep one type per family and improve the dropdown:
thumbnails per option, stricter validation per design. Sanity's array
insert menu shows one preview per type, not per field value, so the
thumbnail problem does not go away, and validation per design keeps the
form-that-changes problem.

## Decision

A section is one entry in the Page Builder catalogue: one `_type`, one
thumbnail, one design, one set of fields. A section never changes its
design through a field. A second design is a second section with its own
`_type`, its own fields, and its own catalogue thumbnail: a preview image
added with the generator's `--preview` option, so the catalogue shows the
design.

The shared section `theme` field (Light, Dark) is colour, not a design. It
stays on every themed section.

## Consequences

- A new design proposed for an existing section is a new section. An agent
  never adds a `layout` or `variant` field; an exception needs Ovi's
  express approval before the work starts.
- `studio/schemas/blocks/one-section-one-design.test.mjs` fails when any
  Page Builder section has a field named like a layout or variant. Its
  allow-list is empty; an approved exception goes there.
- No `hidden` rule keyed on a design, and no special case keyed on a field
  value in the boundary resolver.
- The catalogue gets longer, and every entry means what its thumbnail
  shows.
- Renderer code can be shared as modules where two sections draw the same
  piece; schemas share nothing that would bring hidden fields back one
  level down.
- The terms "layout", "variant" and "look" leave the vocabulary for
  sections (`GLOSSARY.md`, Section). "Layout" in the ownership rules means
  CSS and stays.

## References

- `GLOSSARY.md`, Section.
- `docs/agents/page-builder.md`, "One section, one design".
