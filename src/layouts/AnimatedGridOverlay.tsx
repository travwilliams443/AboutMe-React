import React, { useEffect, useRef } from "react";

interface AnimatedGridOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const AnimatedGridOverlay: React.FC<AnimatedGridOverlayProps> = ({ containerRef }) => {
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef   = useRef<any>(null);

  /* ------------- p5 bootstrap ------------- */
  useEffect(() => {
    const sketch = (p: any) => {
      const gridSpacing = 48;
      const nodeSize    = 1;

      const getSize = () => {
        const width  = window.innerWidth;
        const height =
          containerRef.current?.getBoundingClientRect().height ?? window.innerHeight;
        return { width, height };
      };

      p.setup = () => {
        const { width, height } = getSize();
        p.createCanvas(width, height).parent(canvasHolderRef.current);
        p.frameRate(60);
      };

      /* ✨ we do **not** define p.windowResized – that keeps the Zod‑spam away */

      p.draw = () => {
        p.clear();

        /* faint grid lines */
        p.stroke(255, 255, 255, 18);
        for (let x = 0; x <= p.width; x += gridSpacing) p.line(x, 0, x, p.height);
        for (let y = 0; y <= p.height; y += gridSpacing) p.line(0, y, p.width, y);

        /* gentle sparkles */
        const t = p.millis() / 1500.0;
        for (let x = 0; x <= p.width; x += gridSpacing) {
          for (let y = 0; y <= p.height; y += gridSpacing) {
            const base   = t + (x + y) / 500;
            const swirl  = t * 0.8 + p.dist(x, y, p.width / 2, p.height / 2) / 140;
            const ripple = t * 1.7 + x / 120 - y / 160;

            let sparkle = 0.4 * Math.sin(base)
                        + 0.25 * Math.sin(swirl)
                        + 0.20 * Math.sin(ripple);

            sparkle = p.constrain(sparkle, -1, 1);
            sparkle = p.map(sparkle, -1, 1, 0.12, 0.7);

            p.noStroke();
            p.fill(255, 255, 255, 140 * sparkle);
            p.ellipse(x, y, nodeSize * sparkle + 1.4, nodeSize * sparkle + 1.4);
          }
        }
      };
    };

    import("p5").then(({ default: P5 }) => {
      p5InstanceRef.current = new P5(sketch);
    });

    return () => p5InstanceRef.current?.remove();
  }, [containerRef]);
  /* ---------------------------------------- */

  /* ------------- ResizeObserver ------------ */
  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver(() => {
      const inst = p5InstanceRef.current;
      if (!inst) return;
      const width  = window.innerWidth;
      const height = containerRef.current!.getBoundingClientRect().height;
      inst.resizeCanvas(width, height);      // no p.windowResized call -> no Zod errors
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef]);
  /* ---------------------------------------- */

  return (
    <div
      ref={canvasHolderRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100vw",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
    />
  );
};

export default AnimatedGridOverlay;
