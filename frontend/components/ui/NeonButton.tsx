"use client";

import clsx from "clsx";

export function NeonButton({ className, ...props }: any) {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded-full bg-accent text-black hover:bg-accent-soft transition",
        className
      )}
      {...props}
    />
  );
}
