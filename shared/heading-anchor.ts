// The anchor a rich text heading gets on the Website: its text in lowercase
// words joined by single hyphens, with "&" read as "and". A link with this
// anchor lands on the heading (the old site's "Ingredients List" headings
// carried exactly these IDs, so the old links keep working).

export function headingAnchorId(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
