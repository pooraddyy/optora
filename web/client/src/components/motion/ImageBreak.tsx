/* ImageBreak — full-bleed visual break with a scroll-driven parallax drift
   on the background image. Respects reduced motion via CSS (the transform
   simply stops mattering when animations are disabled). */
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";

type Props = {
  src: string;
  alt: string;
  kicker: string;
  line: string;
  sub: string;
};

export default function ImageBreak({ src, alt, kicker, line, sub }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section className="image-break" aria-label={kicker} ref={ref}>
      <motion.img
        className="bg-img parallax-img"
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ y }}
      />
      <div className="veil" aria-hidden="true" />
      <div className="site-shell image-break-inner">
        <Reveal>
          <p className="kicker" style={{ color: "var(--ivory-dim)" }}>{kicker}</p>
          <p className="serif-line">{line}</p>
          <p className="break-sub">{sub}</p>
        </Reveal>
      </div>
    </section>
  );
}
