import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Extra classes applied to the wrapper. */
  className?: string;
  /** Delay (ms) before the reveal transition starts — handy for staggering. */
  delay?: number;
  /** Distance/direction the element travels in while fading in. */
  from?: "up" | "down" | "left" | "right" | "none";
}

const hiddenTransform: Record<NonNullable<RevealProps["from"]>, string> = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "translate-x-8",
  right: "-translate-x-8",
  none: "",
};

/**
 * Lightweight scroll-reveal wrapper built on IntersectionObserver.
 * Purely presentational — adds a fade/slide-in once the element enters the viewport.
 * Reuse it to animate any section or card without touching app logic.
 */
export default function Reveal({ children, className = "", delay = 0, from = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Start visible when IntersectionObserver is unavailable (e.g. SSR) so content never stays hidden.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-[opacity,transform] ${
        visible ? "translate-x-0 translate-y-0 opacity-100" : `opacity-0 ${hiddenTransform[from]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
