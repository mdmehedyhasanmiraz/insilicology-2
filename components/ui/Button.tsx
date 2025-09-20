// components/ui/Button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cnButton } from "@/utils/buttonUtil";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-yellow-400 text-black hover:bg-yellow-500",
        outline: "border border-black border-2 text-black hover:bg-black hover:text-white",
        outlineArrow: "border border-black border-2 text-black hover:bg-black hover:text-white",
        ghost: "bg-transparent text-black hover:bg-gray-100",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 py-3 text-md",
        sm: "h-8 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  children?: React.ReactNode;
}

interface ButtonAsButton extends ButtonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  href?: undefined;
}

interface ButtonAsLink extends ButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> {
  href: string;
}

type CombinedButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  className,
  variant,
  size,
  href,
  children,
  ...props
}: CombinedButtonProps) {
  const classes = cnButton(buttonVariants({ variant, size, className }));

  const content = (
    <>
      {children}
      {variant === "outlineArrow" && (
        <ArrowRight className="ml-2 h-4 w-4" />
      )}
    </>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        className={classes} 
        {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button 
      className={classes} 
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}
