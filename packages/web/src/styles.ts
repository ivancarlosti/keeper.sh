import { tv } from "tailwind-variants";

export const button = tv({
  base: "inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium no-underline cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-300",
  variants: {
    variant: {
      primary:
        "bg-gray-900 border border-gray-900 text-white hover:bg-gray-700 hover:border-gray-700 disabled:hover:bg-gray-900 disabled:hover:border-gray-900",
      secondary:
        "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
      danger:
        "bg-transparent border border-red-300 text-red-600 hover:bg-red-50",
    },
    skeleton: {
      true: "opacity-0",
    },
  },
});

export const input = tv({
  base: "w-full py-2.5 px-3 border border-gray-300 rounded-md text-base transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-gray-900 focus:ring-3 focus:ring-black/10",
  variants: {
    readonly: {
      true: "bg-gray-50 text-gray-600",
    },
  },
});

export const dialogPopup = tv({
  base: "fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full",
  variants: {
    size: {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
