"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FaGear, FaKey, FaVideo, FaWandMagicSparkles } from "react-icons/fa6";

import { cn } from "@acme/ui";

const LINKS = [
  {
    label: "Generate",
    icon: <FaWandMagicSparkles size={14} />,
    href: "/dashboard",
  },
  {
    label: "Videos",
    icon: <FaVideo />,
    href: "/dashboard/videos",
  },
  // {
  //   label: "API",
  //   icon: <FaKey size={14} />,
  //   href: "/dashboard/api",
  // },
  {
    label: "Settings",
    icon: <FaGear size={14} />,
    href: "/dashboard/settings",
  },
];

const Navigation = () => {
  const pathname = usePathname();

  const getIsActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="flex w-full items-center space-x-6 overflow-x-scroll lg:overflow-x-hidden">
      {LINKS.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className={cn(
            "relative flex items-center gap-2 pb-0.5 text-sm font-medium transition-colors",
            getIsActive(link.href) ? "text-primary" : "text-muted-foreground",
          )}
        >
          {link.icon}
          <span>{link.label}</span>

          {getIsActive(link.href) && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
            ></motion.div>
          )}
        </Link>
      ))}
    </div>
  );
};

export default Navigation;
