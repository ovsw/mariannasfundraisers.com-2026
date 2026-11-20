// A YouTube link's video ID. The Studio validates a video section's link with
// it, the importer checks the old links with it, and the Website builds the
// embed address from it, so all three accept the same links (spec decision
// 12: an editor adds a video by pasting one YouTube link).

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

/**
 * The 11-character video ID of a YouTube link (`watch?v=`, `youtu.be/`,
 * `embed/`, `shorts/`, `live/` or `v/`), or null when the text is not a link
 * to one YouTube video.
 */
export function youTubeVideoId(link: string | null | undefined): string | null {
  const text = link?.trim();
  if (!text) return null;
  let url: URL;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol) || !HOSTS.has(url.hostname.toLowerCase())) return null;
  const segments = url.pathname.split("/").filter(Boolean);
  let id: string | null | undefined;
  if (url.hostname.toLowerCase() === "youtu.be") id = segments[0];
  else if (segments[0] === "watch") id = url.searchParams.get("v");
  else if (["embed", "shorts", "live", "v"].includes(segments[0] ?? "")) id = segments[1];
  return id && VIDEO_ID.test(id) ? id : null;
}

/** The address of a video's player, which starts playing when it opens. */
export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
}

/** The address of a video's page on YouTube. */
export function youTubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}
