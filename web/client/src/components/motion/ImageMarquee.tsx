/* ImageMarquee — an infinite, gently sliding gallery row of generated brand
   imagery. Pure CSS animation (translateX -50% loop on a duplicated track),
   pauses on hover, supports reverse direction for counter-sliding rows,
   degrades to horizontal scroll under reduced motion. */
import { useMemo } from "react";

export type Slide = { src: string; alt: string; caption: string; index: string };

export const OTP_SLIDES: Slide[] = [
  {
    src: "/assets/otp-phone.webp",
    alt: "Smartphone glowing in the dark with a received verification code message",
    caption: "Delivered in seconds",
    index: "01",
  },
  {
    src: "/assets/otp-digits.webp",
    alt: "Six glass verification digits floating above a dark reflective surface",
    caption: "Six digits, one window",
    index: "02",
  },
  {
    src: "/assets/otp-entry.webp",
    alt: "Hands typing a verification code on a backlit keyboard in a dark room",
    caption: "Confirmed by hand",
    index: "03",
  },
  {
    src: "/assets/otp-seal.webp",
    alt: "Black envelope sealed with a glowing blue verification emblem",
    caption: "Sealed and signed",
    index: "04",
  },
];

export const CRAFT_SLIDES: Slide[] = [
  {
    src: "/assets/showcase-key.webp",
    alt: "Translucent glass key resting on dark obsidian stone",
    caption: "Issued, never guessed",
    index: "05",
  },
  {
    src: "/assets/showcase-trails.webp",
    alt: "Elegant blue light trails flowing across black",
    caption: "Expiry, handled gracefully",
    index: "06",
  },
  {
    src: "/assets/showcase-print.webp",
    alt: "Fingerprint ridges etched in black glass with blue edge light",
    caption: "Identity, confirmed",
    index: "07",
  },
  {
    src: "/assets/showcase-monolith.webp",
    alt: "Dark obsidian monolith with a thin blue edge of light",
    caption: "Quiet by design",
    index: "08",
  },
];

type Props = {
  slides: Slide[];
  label: string;
  reverse?: boolean;
  duration?: number;
  className?: string;
};

export default function ImageMarquee({
  slides,
  label,
  reverse = false,
  duration = 48,
  className = "",
}: Props) {
  const doubled = useMemo(() => [...slides, ...slides], [slides]);
  return (
    <div className={`marquee ${className}`} role="list" aria-label={label}>
      <div
        className={`marquee-track${reverse ? " reverse" : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((s, i) => (
          <figure
            className="marquee-card"
            key={`${s.index}-${i}`}
            role="listitem"
            aria-hidden={i >= slides.length}
          >
            <div className="marquee-img">
              <img
                src={s.src}
                alt={i < slides.length ? s.alt : ""}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="marquee-cap">
              <span className="mono">{s.caption}</span>
              <span className="idx">{s.index}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
