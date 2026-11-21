"use client";

// The quotes of the Testimonials section, one at a time, with previous and
// next buttons beside the heading, as on the old site. Every quote is in the
// page; the hidden ones are only out of view.
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

export default function TestimonialCarousel({
  heading,
  slides,
}: {
  heading: ReactNode;
  slides: { key: string; content: ReactNode }[];
}) {
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;
  const buttonClass =
    "flex size-9 items-center justify-center rounded-full bg-card text-card-foreground shadow-sm transition-opacity disabled:opacity-40";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        {heading}
        {slides.length > 1 ? (
          <div className="flex items-center gap-4 pb-1">
            <button
              className={buttonClass}
              disabled={index === 0}
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
              type="button"
            >
              <ChevronLeftIcon aria-hidden="true" className="size-6" />
              <span className="sr-only">Previous testimonial</span>
            </button>
            <button
              className={buttonClass}
              disabled={index === last}
              onClick={() => setIndex((current) => Math.min(last, current + 1))}
              type="button"
            >
              <ChevronRightIcon aria-hidden="true" className="size-6" />
              <span className="sr-only">Next testimonial</span>
            </button>
          </div>
        ) : null}
      </div>
      <div aria-live="polite">
        {slides.map((slide, slideIndex) => (
          <div hidden={slideIndex !== index} key={slide.key}>
            {slide.content}
          </div>
        ))}
      </div>
    </div>
  );
}
