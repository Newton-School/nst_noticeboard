"use client";

import React from "react";
import Image from "next/image";

interface FooterProps {
  className?: string;
  src?: string;
}

export function Footer({ className = "", src = "/footer.png" }: FooterProps) {
  return (
    <footer className={`w-full relative overflow-visible leading-none -mt-25 sm:-mt-26 lg:-mt-30 z-30 pointer-events-none ${className}`}>
      {/* Decorative Footer Landscape Cutout Banner Overlapping Cards */}
      <div className="w-full relative leading-none flex justify-center">
        <Image
          src={src}
          alt="Campus Landscape Footer"
          width={3310}
          height={1248}
          className="w-full max-w-[1480px] h-auto object-cover object-bottom pointer-events-none select-none drop-shadow-md"
        />
      </div>
    </footer>
  );
}

export default Footer;



