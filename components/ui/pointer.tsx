"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  HTMLMotionProps,
  motion,
  useMotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";

/**
 * A custom pointer component that displays an animated cursor.
 * Add this as a child to any component to enable a custom pointer when hovering.
 * You can pass custom children to render as the pointer.
 *
 * @component
 * @param {HTMLMotionProps<"div">} props - The component props
 */
export function Pointer({
  className,
  style,
  children,
  ...props
}: HTMLMotionProps<"div">): React.ReactNode {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && containerRef.current) {
      // Get the parent element directly from the ref
      const parentElement = containerRef.current.parentElement;

      if (parentElement) {
        // Add cursor-none to parent
        parentElement.style.cursor = "none";

        // Add event listeners to parent
        const updateCursorPosition = (e: MouseEvent) => {
          const rect = parentElement.getBoundingClientRect();
          x.set(e.clientX - rect.left);
          y.set(e.clientY - rect.top);
        };

        const handleMouseMove = (e: MouseEvent) => {
          updateCursorPosition(e);
        };

        const handleMouseEnter = (e: MouseEvent) => {
          updateCursorPosition(e);
          setIsActive(true);
        };

        const handleMouseLeave = () => {
          setIsActive(false);
        };

        const handleScroll = (e: Event) => {
          // Check if mouse is still over the element during scroll
          const mouseEvent = new MouseEvent("mousemove", {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: (window as any).lastMouseX || 0,
            clientY: (window as any).lastMouseY || 0,
          });

          const rect = parentElement.getBoundingClientRect();
          const isInside =
            (window as any).lastMouseX >= rect.left &&
            (window as any).lastMouseX <= rect.right &&
            (window as any).lastMouseY >= rect.top &&
            (window as any).lastMouseY <= rect.bottom;

          if (!isInside) {
            setIsActive(false);
          } else if ((window as any).lastMouseX && (window as any).lastMouseY) {
            x.set((window as any).lastMouseX - rect.left);
            y.set((window as any).lastMouseY - rect.top);
          }
        };

        const trackMousePosition = (e: MouseEvent) => {
          (window as any).lastMouseX = e.clientX;
          (window as any).lastMouseY = e.clientY;
        };

        window.addEventListener("mousemove", trackMousePosition);
        parentElement.addEventListener("mousemove", handleMouseMove);
        parentElement.addEventListener("mouseenter", handleMouseEnter);
        parentElement.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
          parentElement.style.cursor = "";
          window.removeEventListener("mousemove", trackMousePosition);
          parentElement.removeEventListener("mousemove", handleMouseMove);
          parentElement.removeEventListener("mouseenter", handleMouseEnter);
          parentElement.removeEventListener("mouseleave", handleMouseLeave);
          window.removeEventListener("scroll", handleScroll, true);
        };
      }
    }
  }, [x, y]);

  return (
    <>
      <div ref={containerRef} />
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2"
            style={{
              top: y,
              left: x,
              ...style,
            }}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            {...props}
          >
            {children || (
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="1"
                viewBox="0 0 16 16"
                height="24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  "rotate-[-70deg] stroke-white text-black",
                  className
                )}
              >
                <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
              </svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
