"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

/**
 * Site-wide motion settings: honour the OS "reduce motion" preference
 * (transforms and layout animation are skipped, opacity fades remain).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
