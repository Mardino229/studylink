import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const move = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const clickable = target.closest("a, button, [role='button'], input, textarea, select");
      setIsActive(Boolean(clickable));
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: isActive ? 30 : 18,
        height: isActive ? 30 : 18,
        marginLeft: -8,
        marginTop: -8,
        borderRadius: "9999px",
        pointerEvents: "none",
        zIndex: 999999,
        background:
          isActive
            ? "radial-gradient(35% 35% at 50% 50%, rgba(59,130,246,0.25), rgba(168,85,247,0.25))"
            : "rgba(59,130,246,0.2)",
        boxShadow: isActive
          ? "0 0 24px rgba(59,130,246,0.35), 0 0 32px rgba(168,85,247,0.25)"
          : "0 0 16px rgba(59,130,246,0.25)",
        transition: "width 120ms ease, height 120ms ease, box-shadow 120ms ease, background 120ms ease",
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform, width, height, box-shadow, background",
        mixBlendMode: "normal",
      }}
    />
  );
}
