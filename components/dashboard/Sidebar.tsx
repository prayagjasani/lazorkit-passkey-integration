"use client";

import React, { Dispatch, SetStateAction, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronsRight,
  Home,
  Send,
  Download,
  Zap,
  FileText,
  Book,
  Search,
  Lock,
} from "lucide-react";
import Image from "next/image";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  items: NavItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const selected = items.find((item) => item.href === pathname)?.label || items[0]?.label || "";

  const handleNavigation = React.useCallback((href: string) => {
    if (pathname !== href) {
      router.push(href);
    }
  }, [router, pathname]);

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen shrink-0 border-r border-[#e5e5ea] bg-white p-2"
      style={{
        width: open ? "225px" : "fit-content",
      }}
    >
      <TitleSection open={open} />

      <div className="space-y-1">
        {items.map((item) => (
          <Option
            key={item.href}
            Icon={item.icon}
            title={item.label}
            href={item.href}
            selected={selected}
            open={open}
            onClick={() => handleNavigation(item.href)}
          />
        ))}
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
}

const Option = ({
  Icon,
  title,
  href,
  selected,
  open,
  onClick,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  href: string;
  selected: string;
  open: boolean;
  onClick: () => void;
}) => {
  const isSelected = selected === title;

  return (
    <motion.button
      layout
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
        isSelected
          ? "bg-[#7454f7]/10 text-[#7454f7]"
          : "text-[#8e8e93] hover:bg-[#f2f2f7]"
      }`}
    >
      <motion.div
        layout
        className="grid h-full w-10 place-content-center text-lg"
      >
        <Icon />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-xs font-medium"
        >
          {title}
        </motion.span>
      )}
    </motion.button>
  );
};

const TitleSection = ({ open }: { open: boolean }) => {
  return (
    <div className="mb-3 border-b border-[#e5e5ea] pb-3">
      <div className="flex items-center gap-2">
        <div className="grid size-10 shrink-0 place-content-center rounded-md bg-[#7454f7] overflow-hidden p-1.5">
          <Image
            src="/images/logo.svg"
            alt="LazorKey Logo"
            width={28}
            height={28}
            className="object-contain brightness-0 invert"
            priority
          />
        </div>
        {open && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
          >
            <span className="block text-xs font-semibold text-black">LazorKey</span>
            <span className="block text-xs text-[#8e8e93]">Devnet</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const ToggleClose = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((pv) => !pv)}
      className="absolute bottom-0 left-0 right-0 border-t border-[#e5e5ea] transition-colors hover:bg-[#f2f2f7]"
    >
      <div className="flex items-center p-2">
        <motion.div
          layout
          className="grid size-10 place-content-center text-lg text-[#8e8e93]"
        >
          <ChevronsRight
            className={`transition-transform ${open && "rotate-180"}`}
          />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium text-[#8e8e93]"
          >
            Hide
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

