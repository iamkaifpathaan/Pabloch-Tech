import type { Shot } from "../lib/types.ts";

/**
 * Screenshots of real work, pre-encoded to /assets/work/{name}-{width}.{avif,webp}.
 * Al-Abuzer: captured from the live store. Previews: rendered from the preview
 * builds themselves — each still shows its "design preview" banner, on purpose.
 */
const shot = (name: string, width: number, height: number, widths: number[], alt: string): Shot => ({
  name,
  width,
  height,
  widths,
  alt,
});

export const shots = {
  alabuzerDesktop: shot(
    "alabuzer-desktop",
    1568,
    700,
    [800, 1200, 1568],
    "Al-Abuzer Perfumes homepage: a gold perfume bottle and Arabic calligraphy in drifting gold dust, under a navigation bar with Products, Track Order, search, account and cart.",
  ),
  alabuzerHero: shot(
    "alabuzer-hero",
    1568,
    566,
    [800, 1200, 1568],
    "A gold perfume bottle beside a piece of oud wood, with Arabic calligraphy glowing through drifting gold dust — the opening frame of the Al-Abuzer Perfumes homepage video.",
  ),
  alabuzerTablet: shot(
    "alabuzer-tablet",
    1200,
    750,
    [600, 900, 1200],
    "Al-Abuzer Perfumes on a tablet: the gold logo above the full-bleed product video and an Explore Collection button.",
  ),
  cqDesktop: shot(
    "cq-desktop",
    2880,
    1800,
    [640, 960, 1440, 1920],
    "The Cleaning Queens preview: headline “Feel like royalty in your own home” beside an instant estimate card for a three-bed deep clean.",
  ),
  cqMobile: shot(
    "cq-mobile",
    1170,
    2532,
    [360, 540, 780],
    "The Cleaning Queens preview on a phone, with the design-preview banner across the top.",
  ),
  cqEstimator: shot(
    "cq-estimator",
    1130,
    1130,
    [480, 720, 1000],
    "Close-up of the instant estimator: home size, service and frequency, with a Build my estimate button.",
  ),
  oakDesktop: shot(
    "oak-desktop",
    2880,
    1800,
    [640, 960, 1440, 1920],
    "Oak Tree Garden Maintenance preview: headline “Your garden, properly looked after” with the owner’s quote about word-of-mouth work.",
  ),
  oakMobile: shot(
    "oak-mobile",
    1170,
    2532,
    [360, 540, 780],
    "Oak Tree Garden Maintenance preview on a phone, with the design-preview banner across the top.",
  ),
  deanDesktop: shot(
    "dean-desktop",
    2880,
    1800,
    [640, 960, 1440, 1920],
    "Dean the Decorator preview: headline “A neat job, and your house left as you found it” beside a quote from Dean.",
  ),
  deanMobile: shot(
    "dean-mobile",
    1170,
    2532,
    [360, 540, 780],
    "Dean the Decorator preview on a phone, with the design-preview banner across the top.",
  ),
} as const satisfies Record<string, Shot>;
