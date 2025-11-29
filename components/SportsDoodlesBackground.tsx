"use client";

import { useEffect, useState } from "react";

const sportsDoodles = [
  "⚽",
  "🏀",
  "🏈",
  "⚾",
  "🎾","⛹️‍♂️", "🥎", "🏏", "🎱", "🎳", "🚵‍♀️", "⛳", "🏁", "🏅", "🏇", "🏂", "🏄‍♀️", "🏄",
  "🏐",
  "🏓",
  "🏸",
  "🏑",
  "🏒",
  "🥊",
  "🥋",
  "🤸",
  "🏋️",
  "🚴",
  "🏊",
  "🤾",
  "🏹",
  "🥅",
  "🏆"
];

interface Doodle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
  moveX: number;
  moveY: number;
}

export default function SportsDoodlesBackground() {
  const [doodles, setDoodles] = useState<Doodle[]>([]);

  useEffect(() => {
    const generatedDoodles: Doodle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      emoji: sportsDoodles[Math.floor(Math.random() * sportsDoodles.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 30 + 20,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5,
      rotate: Math.random() * 360,
      moveX: (Math.random() - 0.5) * 100,
      moveY: (Math.random() - 0.5) * 100,
    }));
    setDoodles(generatedDoodles);
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {doodles.map((doodle) => (
          <div
            key={doodle.id}
            className="absolute animate-float-smooth opacity-[0.15] dark:opacity-[0.25]"
            style={{
              left: `${doodle.x}%`,
              top: `${doodle.y}%`,
              fontSize: `${doodle.size}px`,
              animationDuration: `${doodle.duration}s`,
              animationDelay: `${doodle.delay}s`,
              transform: `rotate(${doodle.rotate}deg)`,
              // @ts-ignore
              "--move-x": `${doodle.moveX}px`,
              "--move-y": `${doodle.moveY}px`,
            }}
          >
            {doodle.emoji}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes float-smooth {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(var(--move-x), calc(var(--move-y) * 0.5))
              rotate(90deg);
          }
          50% {
            transform: translate(calc(var(--move-x) * 0.7), var(--move-y))
              rotate(180deg);
          }
          75% {
            transform: translate(
                calc(var(--move-x) * -0.3),
                calc(var(--move-y) * 0.8)
              )
              rotate(270deg);
          }
        }
        .animate-float-smooth {
          animation: float-smooth infinite ease-in-out;
        }
      `}</style>
    </>
  );
}
