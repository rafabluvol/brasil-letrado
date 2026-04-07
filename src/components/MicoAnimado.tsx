import { useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { motion } from "framer-motion";

import araraHanging from "@/assets/arara-hanging.png";

export interface MicoAnimadoHandle {
  jumpTo: (targetRef: React.RefObject<HTMLElement | null>) => Promise<void>;
}

const MicoAnimado = forwardRef<MicoAnimadoHandle, { size?: number }>(({ size = 34 }, ref) => {
  const [swinging, setSwinging] = useState(false);

  const triggerSwing = useCallback(() => {
    if (swinging) return;
    setSwinging(true);
    setTimeout(() => setSwinging(false), 2000);
  }, [swinging]);

  const jumpTo = useCallback(async () => {
    triggerSwing();
  }, [triggerSwing]);

  useImperativeHandle(ref, () => ({ jumpTo }), [jumpTo]);

  return (
    <motion.div
      onMouseEnter={triggerSwing}
      className="relative z-20 cursor-pointer"
      style={{
        width: size,
        height: size * 1.4,
        transformOrigin: "50% 2%", // pivot exactly at beak tip
      }}
      animate={
        swinging
          ? { rotate: [0, -25, 22, -15, 12, -6, 3, 0] }
          : { rotate: 0 }
      }
      transition={
        swinging
          ? { duration: 1.8, ease: [0.35, 0, 0.25, 1] }
          : { duration: 0.3 }
      }
    >
      <img
        src={araraHanging}
        alt="Arara pendurada"
        className="block"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.2))",
          transform: "perspective(300px) rotateY(50deg)",
        }}
      />
    </motion.div>
  );
});

MicoAnimado.displayName = "MicoAnimado";
export default MicoAnimado;
