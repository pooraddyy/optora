/* Tilt — transitions.dev "3D tilt": pointer-driven 3D tilt with a cursor
   glare that follows the light. The card itself never moves the layout. */
import { useRef, useState, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function Tilt({
  children,
  className = "",
  max = 7,
  glareClass = "console-glare",
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glareClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [glare, setGlare] = useState<CSSProperties>({});
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 20, mass: 0.6 });
  const sry = useSpring(ry, { stiffness: 220, damping: 20, mass: 0.6 });
  const transform = useTransform([srx, sry], ([x, y]) => `rotateX(${x}deg) rotateY(${y}deg)`);

  const onMove = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * max * 2);
    rx.set((0.5 - py) * max * 2);
    setGlare({ "--gx": `${px * 100}%`, "--gy": `${py * 100}%` } as CSSProperties);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transform, transformStyle: "preserve-3d" }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
      <div className={glareClass} style={glare} aria-hidden="true" />
    </motion.div>
  );
}
