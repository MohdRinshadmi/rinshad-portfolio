import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Button — server component, no event handlers.
   - internal href  → next/link
   - external http(s) href → <a target="_blank" rel="noreferrer">
   - no href → <button type>
   Formix-style pill: when `iconRight` is set it renders inside a circular chip
   at the trailing edge. Animate transform/colors only.
   -------------------------------------------------------------------------- */

const buttonVariants = cva(
  "group/btn inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap " +
    "transition-[transform,color,background-color,border-color,box-shadow] duration-200 ease-out " +
    "will-change-transform hover:-translate-y-0.5 active:translate-y-0 " +
    "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Formix primary = near-black pill, cream text
        primary: "bg-text text-bg shadow-card hover:bg-text/90",
        // Ember CTA (used sparingly when we want the accent)
        accent: "bg-accent text-accent-fg shadow-glow hover:bg-accent-hover",
        ghost: "border border-border-strong text-text hover:border-text/35 hover:bg-surface",
        subtle: "bg-surface border border-border text-text-secondary hover:text-text hover:border-border-strong",
      },
      size: {
        sm: "h-9 gap-1.5 text-sm",
        md: "h-11 gap-2 text-sm",
        lg: "h-13 gap-2.5 text-base",
      },
      /* horizontal padding flexes based on whether a trailing icon chip is shown */
      pad: {
        text: "",
        chip: "",
      },
    },
    compoundVariants: [
      { size: "sm", pad: "text", className: "px-4" },
      { size: "md", pad: "text", className: "px-6" },
      { size: "lg", pad: "text", className: "px-7" },
      { size: "sm", pad: "chip", className: "pl-4 pr-1.5" },
      { size: "md", pad: "chip", className: "pl-5 pr-1.5" },
      { size: "lg", pad: "chip", className: "pl-7 pr-2" },
    ],
    defaultVariants: { variant: "primary", size: "md", pad: "text" },
  },
);

const chipVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-out group-hover/btn:translate-x-0.5 group-hover/btn:rotate-12",
  {
    variants: {
      variant: {
        primary: "bg-bg/20 text-bg",
        accent: "bg-white/20 text-accent-fg",
        ghost: "border border-border-strong text-text",
        subtle: "bg-bg text-text",
      },
      size: {
        sm: "size-6",
        md: "size-7",
        lg: "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "accent" | "ghost" | "subtle";
  size?: NonNullable<ButtonVariants["size"]>;
  iconRight?: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

function isExternal(href: string): boolean {
  return /^https?:/i.test(href);
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  iconRight,
  type = "button",
  disabled = false,
  className,
  ariaLabel,
}: ButtonProps) {
  const hasChip = Boolean(iconRight);
  const classes = cn(
    buttonVariants({ variant, size, pad: hasChip ? "chip" : "text" }),
    className,
  );

  const inner = (
    <>
      <span>{children}</span>
      {iconRight ? (
        <span aria-hidden="true" className={chipVariants({ variant, size })}>
          {iconRight}
        </span>
      ) : null}
    </>
  );

  if (href && isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={ariaLabel} className={classes}>
        {inner}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} aria-label={ariaLabel} className={classes}>
      {inner}
    </button>
  );
}
