import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

type BaseButtonProps = {
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type LinkButtonProps = BaseButtonProps &
  {
    href: string;
    prefetch?: boolean;
  };

type NativeButtonProps = BaseButtonProps &
  Pick<ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "onClick" | "type"> & {
    href?: undefined;
  };

type ButtonProps = LinkButtonProps | NativeButtonProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-civic-600 text-white shadow-sm hover:bg-civic-700",
  secondary: "border border-slate-200 bg-white text-slate-900 hover:border-civic-200 hover:text-civic-700",
  ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm"
};

export function Button(props: ButtonProps) {
  const { className, size = "md", variant = "primary" } = props;
  const isDisabled = "disabled" in props && props.disabled;
  const classes = cn(
    "inline-flex items-center justify-center rounded-md font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-500",
    sizeClasses[size],
    variantClasses[variant],
    isDisabled && "cursor-not-allowed opacity-60",
    className
  );

  if ("href" in props && props.href) {
    return (
      <Link className={classes} href={props.href} prefetch={props.prefetch}>
        {props.children}
      </Link>
    );
  }

  const nativeProps = props as NativeButtonProps;

  return (
    <button className={classes} disabled={nativeProps.disabled} onClick={nativeProps.onClick} type={nativeProps.type}>
      {nativeProps.children}
    </button>
  );
}
