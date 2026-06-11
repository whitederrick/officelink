"use client";

import { useEffect } from "react";
import { registerSW } from "@/lib/pwa";

export function SWRegister() {
  useEffect(() => {
    registerSW().then((reg) => {
      if (reg) {
        // Check for updates every 1h
        setInterval(() => reg.update(), 60 * 60 * 1000);
      }
    });
  }, []);
  return null;
}
