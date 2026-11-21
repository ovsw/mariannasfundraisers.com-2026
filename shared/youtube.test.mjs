import assert from "node:assert/strict";
import test from "node:test";
import { youTubeEmbedUrl, youTubeVideoId, youTubeWatchUrl } from "./youtube.ts";

test("a YouTube link gives its video ID in every form the old site and editors use", () => {
  assert.equal(youTubeVideoId("https://www.youtube.com/watch?v=3nQNiWdeH2Q"), "3nQNiWdeH2Q");
  assert.equal(youTubeVideoId("https://youtu.be/Uil1c8p_jV0"), "Uil1c8p_jV0");
  assert.equal(youTubeVideoId(" youtu.be/Vg_ehPiIk90?t=12 "), "Vg_ehPiIk90");
  assert.equal(youTubeVideoId("https://m.youtube.com/watch?feature=share&v=TF1D5tm3Du4"), "TF1D5tm3Du4");
  assert.equal(youTubeVideoId("https://www.youtube.com/embed/xoJDPGvQy1E"), "xoJDPGvQy1E");
  assert.equal(youTubeVideoId("https://www.youtube.com/shorts/bAFYYdrAQBk"), "bAFYYdrAQBk");
});

test("anything else gives no video ID", () => {
  for (const link of [
    null,
    undefined,
    "",
    "   ",
    "https://vimeo.com/123456789",
    "https://www.youtube.com/channel/UC1234567890",
    "https://www.youtube.com/watch?v=short",
    "https://evil.example/watch?v=3nQNiWdeH2Q",
    "https://youtube.com.evil.example/watch?v=3nQNiWdeH2Q",
    "javascript:alert(1)",
  ]) {
    assert.equal(youTubeVideoId(link), null, String(link));
  }
});

test("the player and page addresses are built from the ID", () => {
  assert.equal(youTubeEmbedUrl("3nQNiWdeH2Q"), "https://www.youtube-nocookie.com/embed/3nQNiWdeH2Q?autoplay=1&rel=0");
  assert.equal(youTubeWatchUrl("3nQNiWdeH2Q"), "https://www.youtube.com/watch?v=3nQNiWdeH2Q");
});
