import { motion } from "framer-motion";

export function CoinBurst({ trigger }: { trigger: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`${trigger}-${i}`}
          className="absolute left-1/2 top-1/2 text-xl"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: (i - 5) * 25, y: -120 - i * 8, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          🪙
        </motion.div>
      ))}
    </div>
  );
}

export function StarBlast({ trigger }: { trigger: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={`${trigger}-star-${i}`}
          className="absolute left-1/2 top-1/2 text-lg"
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: Math.sin(i) * 140, y: Math.cos(i) * 120, opacity: 0 }}
          transition={{ duration: 0.65 }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}

export function ConfettiRain({ trigger }: { trigger: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={`${trigger}-confetti-${i}`}
          className="absolute top-0 text-sm"
          style={{ left: `${(i / 18) * 100}%` }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: 260, rotate: 240, opacity: 0 }}
          transition={{ duration: 1 + (i % 4) * 0.2 }}
        >
          🎉
        </motion.div>
      ))}
    </div>
  );
}
