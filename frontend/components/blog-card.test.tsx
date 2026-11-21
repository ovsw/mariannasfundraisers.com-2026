import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { hasLatestNewsContent } from "@/components/blocks/latest-news";
import { NewsCard, type NewsCardData } from "./blog-card";

const post: NewsCardData = {
  _id: "post-1",
  title: "Fund Fiesta is Here!",
  slug: { current: "fund-fiesta-is-here" },
  publishedAt: "2025-07-17T00:00:00.000Z",
  readingTime: 1,
  excerpt: "We're Spicing Things Up at Marianna's Fundraisers!",
  image: null,
  author: { _id: "author-todd", name: "Todd Hill", image: null },
};

describe("NewsCard", () => {
  it("draws a post without a main image, linked to its address", () => {
    render(<NewsCard post={post} stega={false} />);
    expect(
      screen.getByRole("link", { name: /Fund Fiesta is Here!/ }),
    ).toHaveAttribute("href", "/news/fund-fiesta-is-here");
    expect(screen.getByText("Todd Hill")).toBeInTheDocument();
    expect(screen.getByText("Jul 17, 2025")).toBeInTheDocument();
    expect(screen.getByText("1 min read")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("draws a post without an author", () => {
    render(<NewsCard post={{ ...post, author: null }} stega={false} />);
    expect(screen.getByRole("heading", { name: post.title! })).toBeInTheDocument();
    expect(screen.queryByText("Todd Hill")).not.toBeInTheDocument();
  });

  it("draws nothing for a post whose slug is not a news address", () => {
    const { container } = render(
      <NewsCard post={{ ...post, slug: { current: "winner:-2024" } }} stega={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Latest news", () => {
  it("shows when it has a title and at least one published post", () => {
    expect(hasLatestNewsContent({ title: "News & Events", posts: [post] as never })).toBe(true);
    expect(hasLatestNewsContent({ title: "News & Events", posts: [] })).toBe(false);
    expect(hasLatestNewsContent({ title: " ", posts: [post] as never })).toBe(false);
  });
});
