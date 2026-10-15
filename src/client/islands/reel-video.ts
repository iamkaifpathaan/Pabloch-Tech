import { media } from "../core/env.ts";

/**
 * The showreel loop: muted, plays only while at least a quarter of it is on
 * screen, pauses when it leaves. Under reduced motion it stays a plain video
 * with controls — nothing starts on its own.
 */
export function mountReelVideo(el: HTMLElement): void {
  const video = el as HTMLVideoElement;
  if (media.reducedMotion.matches || !("IntersectionObserver" in window)) return;
  video.muted = true;
  video.controls = false;
  video.preload = "metadata";
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) video.play().catch(() => (video.controls = true));
      else video.pause();
    },
    { threshold: 0.25 },
  );
  io.observe(video);
}
