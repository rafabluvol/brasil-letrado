import { useImperativeHandle, forwardRef, useCallback, useState, useRef, useEffect } from "react";

const ONCA_VIDEO_URL = "/onca-walk-loop.mp4";

export interface MicoAnimadoHandle {
  jumpTo: (targetRef: React.RefObject<HTMLElement | null>) => Promise<void>;
}

interface Props {
  size?: number;
  walkWidth?: number;
  walkDuration?: number;
}

const MicoAnimado = forwardRef<MicoAnimadoHandle, Props>(
  ({ size = 60, walkWidth, walkDuration = 45 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [facingRight, setFacingRight] = useState(true);

    const jumpTo = useCallback(async () => {}, []);
    useImperativeHandle(ref, () => ({ jumpTo }), [jumpTo]);

    const height = size;
    const width = size * 1.78;

    useEffect(() => {
      const el = containerRef.current;
      if (!el || !walkWidth) return;

      const margin = 10;
      const maxX = walkWidth - width - margin * 2;

      // Simple linear back and forth - video is pure walking so no sync issues
      const anim = el.animate(
        [
          { transform: `translateX(${margin}px)` },
          { transform: `translateX(${maxX + margin}px)` },
          { transform: `translateX(${margin}px)` },
        ],
        {
          duration: walkDuration * 1000,
          iterations: Infinity,
          easing: "linear",
        }
      );

      let lastX = margin;
      let rafId: number;
      const checkDirection = () => {
        const rect = el.getBoundingClientRect();
        const parentRect = el.parentElement?.getBoundingClientRect();
        if (parentRect) {
          const currentX = rect.left - parentRect.left;
          if (currentX > lastX + 0.5) setFacingRight(true);
          else if (currentX < lastX - 0.5) setFacingRight(false);
          lastX = currentX;
        }
        rafId = requestAnimationFrame(checkDirection);
      };
      rafId = requestAnimationFrame(checkDirection);

      return () => {
        anim.cancel();
        cancelAnimationFrame(rafId);
      };
    }, [walkWidth, walkDuration, width]);

    return (
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          bottom: -14,
          left: 0,
          width,
          height,
          willChange: "transform",
          isolation: "isolate",
        }}
      >
        <video
          src={ONCA_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            mixBlendMode: "multiply",
            background: "transparent",
            boxShadow: "none",
            border: "none",
            outline: "none",
            filter: "contrast(1.2) brightness(1.15)",
            transform: facingRight ? "scaleX(1)" : "scaleX(-1)",
            transition: "transform 0.15s ease",
          }}
        />
      </div>
    );
  }
);

MicoAnimado.displayName = "MicoAnimado";
export default MicoAnimado;
