"use client";

// The poster of a video section: the image with a play button. YouTube loads
// only when the visitor plays the video and their privacy choice allows it,
// through the same consent rule as analytics (spec decision 17); otherwise
// the button opens the privacy choices, as on the old site.
import { PlayIcon, XIcon } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [privacyUnavailable, setPrivacyUnavailable] = useState(false);

  useEffect(() => {
    const update = () => setAllowed(analyticsAllowed(readConsentState()));
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
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-scrim/40 text-lg text-primary-foreground drop-shadow-md">
          <PlayIcon
            aria-hidden="true"
            className="size-28 rounded-full border-4 border-current p-5 transition-transform duration-200 group-hover:scale-110 md:size-36"
          />
          <span>{allowed ? "play video" : "Privacy choices for video"}</span>
          <span className="sr-only">: {title}</span>
        </span>
      </button>
      {privacyUnavailable && !allowed ? (
        <p
          className="absolute inset-x-4 bottom-4 rounded-lg bg-card p-4 text-card-foreground shadow-lg"
          role="status"
        >
          Privacy controls could not open. Reload this page to try again, or{" "}
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
        className="m-auto w-[min(92vw,80rem)] overflow-visible bg-transparent p-0 backdrop:bg-scrim/90"
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
