// The import report as Markdown, for people; the JSON file holds the same.

function table(rows, headers) {
  if (!rows.length) return "None.\n";
  const escape = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`),
  ].join("\n") + "\n";
}

const sorted = (object) => Object.entries(object).sort(([a], [b]) => a.localeCompare(b));

export function reportMarkdown(report, { source }) {
  const lines = [];
  lines.push("# Storyblok import report", "");
  lines.push(
    `What the importer (\`pnpm storyblok:import\`, ticket #13) found in the Storyblok export, what it builds, and what it drops or leaves for a hand. Source: ${source}. A dry run and \`--apply\` write the same report; see \`docs/migration/import.md\`.`,
    "",
  );
  lines.push("## Found", "");
  const f = report.found;
  lines.push(
    table(
      [
        ["Stories", f.stories],
        ["Page stories", f.page],
        ["Product stories", f.product],
        ["News stories", f.news],
        ["Files", `${f.files} (${f.images} images, ${f.documentFiles} documents)`],
      ],
      ["What", "Count"],
    ),
  );
  lines.push("## Documents", "");
  lines.push(table(sorted(report.documents), ["Type", "Count"]));
  lines.push("Imported as published although unpublished in Storyblok (spec decision 4): " + (report.publishedFromDraft.join(", ") || "none") + ".", "");
  lines.push("## Sections", "");
  lines.push(table(sorted(report.sections), ["Section", "Count"]));
  lines.push("Scaffolds by the section that will replace them:", "");
  lines.push(table(sorted(report.scaffolds), ["Intended section", "Scaffolds"]));
  lines.push("## News addresses that change", "");
  lines.push("Malformed old news slugs get a clean one and a permanent redirect from the old address (spec decision 5).", "");
  lines.push(table((report.newsRedirects ?? []).map((r) => [r.from, r.to]), ["Old address", "New address"]));
  lines.push("## Not imported here", "");
  lines.push(table(report.skipped.map((s) => [s.story, s.reason]), ["Story", "Why"]));
  lines.push("## Needs a hand", "");
  lines.push(table(report.needsHand.map((n) => [n.story, n.at, n.issue]), ["Story", "Where", "What"]));
  lines.push("## Overrides", "");
  lines.push("Applied:", "");
  lines.push(table(report.overrides.applied.map((o) => [o.story, o.at, o.from, JSON.stringify(o.to)]), ["Story", "Where", "From", "To"]));
  lines.push("Not applied in this run:", "");
  lines.push(table(report.overrides.unused.map((o) => [o.story, o.from, o.reason]), ["Story", "From", "Why"]));
  lines.push("## Story links stored under an old address", "");
  lines.push("Imported by story UUID, so they point at the story's current page.", "");
  lines.push(table(report.movedStoryLinks.map((m) => [m.story, m.at, m.stored, m.now]), ["Story", "Where", "Stored address", "Now"]));
  lines.push("## Dropped, by kind", "");
  lines.push(table(sorted(report.dropped), ["What", "Count"]));
  lines.push(`## Images without alt text (${report.imagesWithoutAlt.length})`, "");
  lines.push("Writing these is a follow-up with the Starter's image-description flow (spec, out of scope).", "");
  lines.push(table(report.imagesWithoutAlt.map((i) => [i.story, i.at, i.file]), ["Story", "Where", "File"]));
  lines.push(`## Every dropped item (${report.droppedItems.length})`, "");
  lines.push(table(report.droppedItems.map((d) => [d.story, d.at, d.item]), ["Story", "Where", "Item"]));
  return lines.join("\n");
}
