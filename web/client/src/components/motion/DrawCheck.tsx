/* DrawCheck — transitions.dev "Checkbox check": the check draws itself with a
   stroke path when it scrolls into view. */
import { motion } from "framer-motion";

export default function DrawCheck({
  size = 18,
  color = "#41d97e",
  strokeWidth = 2.6,
  delay = 0,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  delay?: number;
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      initial={{ opacity: 0.4 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      aria-hidden="true"
    >
      <motion.path
        d="M4.5 12.5 L10 18 L19.5 6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  );
}
