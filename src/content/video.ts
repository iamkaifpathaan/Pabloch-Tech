import type { Rich, VideoSample, VideoTier } from "../lib/types.ts";
import { shots } from "./shots.ts";

/**
 * Motion graphics video editing. The samples are real, published reels from
 * Electronica, our own electronics channel — made with the same code-driven
 * engine we use for client videos. Links go to YouTube; nothing is embedded,
 * so the page still sets no third-party cookies.
 */

export const videoIntro: Rich = [
  "Every frame is drawn in code — kinetic text, animated diagrams and mock-ups, original music, and a voiceover when you want one. These six come from ",
  { em: "Electronica" },
  ", our own channel: 90+ reels made with the same engine.",
];

/** The silent showreel loop: twelve seconds cut from the samples below. */
export const showreel = {
  webm: "assets/video/showreel.webm",
  mp4: "assets/video/showreel.mp4",
  poster: "assets/video/showreel-poster.webp",
  width: 540,
  height: 960,
  label: "A 12-second showreel of motion graphics reels: a quiz countdown, sand turning into a chip, a finger on a touchscreen grid, a transformer, a bulb colour slider and binary numbers lighting up.",
} as const;

export const videoTiers: readonly VideoTier[] = [
  {
    name: "Music-only reel",
    price: "$21",
    detail: "Up to 20 seconds, 9:16. Kinetic text, animated graphics, original music and sound effects.",
  },
  {
    name: "Voiceover reel",
    price: "$29",
    detail: "Up to 30 seconds. Everything above, plus an English AI voiceover and on-screen captions that match it.",
  },
  {
    name: "Explainer or promo",
    price: "$49",
    detail: "Up to 60 seconds, 9:16 or 16:9. Your product, service or app explained with animated mock-ups or a screen-recorded tour.",
  },
  {
    name: "Monthly pack",
    price: "$199 / month",
    detail: "Eight voiceover reels a month (about $25 each), planned as a series — with captions, hashtags and a YouTube title for each.",
  },
  {
    name: "Custom",
    price: "On request",
    detail: "Longer videos, more reels a month or a special style — tell us what you need and we'll price it to fit.",
  },
];

export const videoSamples: readonly VideoSample[] = [
  {
    id: "ep78",
    kind: "Quiz",
    audio: "voiceover",
    title: "Which bulb uses the least power?",
    length: "24 s",
    href: "https://youtube.com/shorts/8swwGb-p3Wo",
    poster: shots.reelEp78,
  },
  {
    id: "ep80",
    kind: "Buying guide",
    audio: "voiceover",
    title: "LED bulbs: buy lumens, not watts",
    length: "24 s",
    href: "https://youtube.com/shorts/MnM4d1WVFuI",
    poster: shots.reelEp80,
  },
  {
    id: "ep43",
    kind: "Explainer",
    audio: "voiceover",
    title: "How your touchscreen feels your finger",
    length: "24 s",
    href: "https://youtube.com/shorts/aFUhOA7FMKw",
    poster: shots.reelEp43,
  },
  {
    id: "ep55",
    kind: "Code lesson",
    audio: "voiceover",
    title: "Binary and hex in 24 seconds",
    length: "24 s",
    href: "https://youtube.com/shorts/QS-iG5ZqYJU",
    poster: shots.reelEp55,
  },
  {
    id: "ep17",
    kind: "Kinetic explainer",
    audio: "music",
    title: "How a transformer works",
    length: "20 s",
    href: "https://youtube.com/shorts/Sx88vOuAbKc",
    poster: shots.reelEp17,
  },
  {
    id: "ep36",
    kind: "How it’s made",
    audio: "music",
    title: "From sand to a phone chip",
    length: "20 s",
    href: "https://youtube.com/shorts/i-I5Y8rv9q8",
    poster: shots.reelEp36,
  },
];

export const audioLabel: Record<VideoSample["audio"], string> = {
  voiceover: "Voiceover",
  music: "Music only",
};
