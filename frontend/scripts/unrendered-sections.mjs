// A published page never holds a section that draws nothing; see "A Section
// never hides silently" in docs/agents/page-builder.md. Studio validation
// blocks that in the editor, but content written through the API skips it.
// The Page Builder wraps each section in <div data-section-key="<_key>">, so
// a section that drew nothing leaves an empty wrapper, and a section with no
// renderer leaves no wrapper at all.

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} body The page's HTML.
 * @param {{ _key: string, _type: string }[]} sections The page's `blocks`.
 * @returns {string[]} One line per section that drew nothing.
 */
export function findUnrenderedSections(body, sections) {
  return sections.flatMap(({ _key, _type }) => {
    const key = escapeRegExp(_key);
    const wrapper = new RegExp(`<div\\b[^>]*\\sdata-section-key="${key}"[^>]*>`);
    if (!wrapper.test(body)) {
      return [`${_type} (${_key}) has no renderer`];
    }
    // React may leave comment markers inside an otherwise empty wrapper. A
    // comment match must stop at its first "-->", or two markers around real
    // content would read as one long comment.
    const emptyWrapper = new RegExp(
      `<div\\b[^>]*\\sdata-section-key="${key}"[^>]*>(?:\\s|<!--(?:(?!-->)[\\s\\S])*-->)*</div>`,
    );
    return emptyWrapper.test(body) ? [`${_type} (${_key}) drew nothing`] : [];
  });
}
