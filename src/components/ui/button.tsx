import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
};

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50";
  const styles =
    variant === "ghost"
      ? "bg-transparent hover:bg-slate-100 text-slate-900"
      : "bg-slate-900 text-white hover:bg-slate-800";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
