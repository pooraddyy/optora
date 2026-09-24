/* ImageMarquee — an infinite, gently sliding gallery of generated brand
   imagery. Pure CSS animation (translateX -50% loop on a duplicated track),
   pauses on hover, degrades to horizontal scroll under reduced motion. */
import { useMemo } from "react";

type Slide = { src: string; alt: string; caption: string; index: string };

const SLIDES: Slide[] = [
  {
    src: "/assets/showcase-key.webp",
    alt: "Translucent glass key resting on dark obsidian stone",
    caption: "Issued, never guessed",
    index: "01",
  },
  {
    src: "/assets/showcase-seal.webp",
    alt: "Sealed black envelope with a deep blue wax seal",
    caption: "Every delivery, signed",
    index: "02",
  },
  {
    src: "/assets/showcase-trails.webp",
    alt: "Elegant blue light trails flowing across black",
    caption: "Expiry, handled gracefully",
    index: "03",
  },
  {
    src: "/assets/showcase-print.webp",
    alt: "Fingerprint ridges etched in black glass with blue edge light",
    caption: "Identity, confirmed",
    index: "04",
  },
];

export default function ImageMarquee() {
  const doubled = useMemo(() => [...SLIDES, ...SLIDES], []);
  return (
    <div className="marquee" role="list" aria-label="Optora craft gallery">
      <div className="marquee-track">
        {doubled.map((s, i) => (
          <figure
            className="marquee-card"
            key={`${s.index}-${i}`}
            role="listitem"
            aria-hidden={i >= SLIDES.length}
          >
            <div className="marquee-img">
              <img
                src={s.src}
                alt={i < SLIDES.length ? s.alt : ""}
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
