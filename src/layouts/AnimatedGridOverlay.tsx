import React, { useEffect, useRef } from "react";

export default function AnimatedGridOverlay() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let p5Instance: any;

    const sketch = (p: any) => {
      const gridSpacing = 48;
      const nodeSize = 1;

      p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent(canvasRef.current);
        p.noFill();
        p.frameRate(60);
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };

      p.draw = () => {
        p.clear();
        p.stroke(255, 255, 255, 18);
        for (let x = 0; x <= p.width; x += gridSpacing) {
          p.line(x, 0, x, p.height);
        }
        for (let y = 0; y <= p.height; y += gridSpacing) {
          p.line(0, y, p.width, y);
        }

        let t = p.millis() / 1500.0;
        for (let x = 0; x <= p.width; x += gridSpacing) {
          for (let y = 0; y <= p.height; y += gridSpacing) {
            let base = t + (x + y) / 500;
            let swirl = t * 0.8 + p.dist(x, y, p.width/2, p.height/2) / 140;
            let ripple = t * 1.7 + x / 120 - y / 160;
            let sparkle = (
                0.40 * Math.sin(base) +
                0.25 * Math.sin(swirl) +
                0.20 * Math.sin(ripple)
            );
            sparkle = p.constrain(sparkle, -1, 1);
            sparkle = p.map(sparkle, -1, 1, 0.12, 0.7);

            p.noStroke();
            p.fill(255, 255, 255, 140 * sparkle);
            p.ellipse(x, y, nodeSize * sparkle + 1.4, nodeSize * sparkle + 1.4);
          }
        }
      };
    };

    import("p5").then((p5) => {
      p5Instance = new p5.default(sketch);
    });

    return () => {
      if (p5Instance) p5Instance.remove();
    };
  }, []);

  // Give this a CSS class if you want, or inline styles
  return (
    <div
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
