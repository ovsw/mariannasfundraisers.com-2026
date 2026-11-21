"use client";

// The poster of a video section: the image with a play button. YouTube loads
// only when the visitor plays the video and their privacy choice allows it,
// through the same consent rule as analytics (spec decision 17); otherwise
// the button opens the privacy choices, as on the old site.
import { XIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { analyticsAllowed, PRIVACY_EVENT, readConsentState } from "@/lib/privacy/consent";
import { youTubeEmbedUrl, youTubeWatchUrl } from "../../../shared/youtube";

type PreferencesWindow = Window & {
  _iub?: { cs?: { api?: { openPreferences?: () => void } } };
};

export default function VideoPoster({
  children,
  title,
  videoId,
}: {
  children: ReactNode;
  title: string;
  videoId: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [allowed, setAllowed] = useState(false);
  // Until the privacy widget has answered, the poster reads "play video" as
  // on the old site; it offers the privacy choices only once they are known
  // to block the video.
  const [consentKnown, setConsentKnown] = useState(false);
  const [open, setOpen] = useState(false);
  const [privacyUnavailable, setPrivacyUnavailable] = useState(false);
  // Set once the visitor tries to play without consent. A choice that can
  // never allow the embed (Global Privacy Control) must still leave a way to
  // watch, so the YouTube link then stays in view.
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    const update = () => {
      const state = readConsentState();
      setAllowed(analyticsAllowed(state));
      setConsentKnown(state.ready);
    };
    update();
    window.addEventListener(PRIVACY_EVENT, update);
    return () => window.removeEventListener(PRIVACY_EVENT, update);
  }, []);

  // A withdrawn consent closes the player.
  useEffect(() => {
    if (!allowed && open) dialog.current?.close();
  }, [allowed, open]);

  function play() {
    if (allowed) {
      dialog.current?.showModal();
      setOpen(true);
      return;
    }
    setAsked(true);
    const openPreferences = (window as PreferencesWindow)._iub?.cs?.api?.openPreferences;
    if (typeof openPreferences !== "function") {
      setPrivacyUnavailable(true);
      return;
    }
    try {
      openPreferences.call((window as PreferencesWindow)._iub?.cs?.api);
      setPrivacyUnavailable(false);
    } catch {
      setPrivacyUnavailable(true);
    }
  }

  return (
    <>
      <button
        className="group absolute inset-0 block w-full overflow-hidden rounded-2xl transition-transform duration-200 ease-in-out hover:scale-105 focus-visible:scale-105"
        onClick={play}
        type="button"
      >
        {children}
        {/* The old poster: a 10rem outlined play circle over "play video",
            growing by half on hover. */}
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-scrim/40 text-primary-foreground">
          <span className="flex flex-col items-center drop-shadow-md transition-transform duration-200 ease-in-out group-hover:scale-150">
            <svg
              aria-hidden="true"
              className="size-40"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg">
              {allowed || !consentKnown ? "play video" : "Privacy choices for video"}
            </span>
            <span className="sr-only">: {title}</span>
          </span>
        </span>
      </button>
      {asked && !allowed ? (
        <p
          className="absolute inset-x-4 bottom-4 rounded-lg bg-card p-4 text-card-foreground shadow-lg"
          role="status"
        >
          {privacyUnavailable
            ? "Privacy controls could not open. Reload this page to try again, or "
            : "The video plays here once your privacy choices allow it. You can also "}
          <a
            className="underline"
            href={youTubeWatchUrl(videoId)}
            rel="noopener noreferrer"
            target="_blank"
          >
            watch this video on YouTube
          </a>
          .
        </p>
      ) : null}
      <dialog
        aria-label={title}
        className="m-auto w-[min(92vw,80rem,calc((100dvh_-_5rem)_*_16_/_9))] overflow-visible bg-transparent p-0 backdrop:bg-scrim/90"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        onClose={() => setOpen(false)}
        ref={dialog}
      >
        <form className="flex justify-end pb-3" method="dialog">
          <button
            aria-label="Close the video"
            className="rounded-full p-2 text-primary-foreground"
            type="submit"
          >
            <XIcon aria-hidden="true" className="size-8" />
          </button>
        </form>
        {open && allowed ? (
          <div className="aspect-video w-full">
            <iframe
              allow="autoplay; fullscreen; picture-in-picture"
              className="size-full"
              src={youTubeEmbedUrl(videoId)}
              title={title}
            />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
