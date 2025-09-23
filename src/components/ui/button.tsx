
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg border border-white/10 backdrop-blur-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl shadow-lg border border-white/10 backdrop-blur-sm",
        outline:
          "border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/30 text-white rounded-xl shadow-lg",
        secondary:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 rounded-xl shadow-lg",
        ghost: "hover:bg-white/10 hover:backdrop-blur-md text-white rounded-xl transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline rounded-lg",
        // iOS Liquid Glass styled variants
        amsterdam: "bg-gradient-to-br from-[#e04e39]/80 to-[#c74433]/80 backdrop-blur-lg border border-white/20 text-white hover:from-[#e04e39]/90 hover:to-[#c74433]/90 hover:shadow-xl hover:shadow-[#e04e39]/20 hover:-translate-y-0.5 rounded-2xl shadow-lg transition-all duration-300",
        canal: "bg-gradient-to-br from-[#1e88e5]/80 to-[#1976d2]/80 backdrop-blur-lg border border-white/20 text-white hover:from-[#1e88e5]/90 hover:to-[#1976d2]/90 hover:shadow-xl hover:shadow-[#1e88e5]/20 hover:-translate-y-0.5 rounded-2xl shadow-lg transition-all duration-300",
        glass: "bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:shadow-xl hover:-translate-y-0.5 rounded-2xl shadow-lg transition-all duration-300",
        glassOrange: "bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg border border-orange-200/30 text-white hover:from-orange-500/30 hover:to-red-500/30 hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-0.5 rounded-2xl shadow-lg transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl",
        sm: "h-9 px-3 rounded-lg text-sm",
        lg: "h-11 px-6 sm:px-8 rounded-xl text-base",
        xl: "h-12 px-6 sm:px-8 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
        // Mobile-friendly touch targets with glass styling
        mobile: "h-12 w-full px-6 text-base min-h-[48px] rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
