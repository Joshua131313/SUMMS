import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    loading?: boolean;
}

const Button = ({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    className,
    disabled,
    ...props
}: ButtonProps) => {
    const isDisabled = disabled || loading;

    return (
        <button
            {...props}
            disabled={isDisabled}
            className={clsx(
                "relative flex items-center justify-center rounded-xl font-medium transition active:scale-[0.98] cursor-pointer",
                fullWidth && "w-full",
                isDisabled && "opacity-70 cursor-not-allowed",

                // Variants
                {
                    "bg-black text-white hover:bg-gray-800 shadow-md":
                        variant === "primary",

                    "bg-sky-500 text-white hover:bg-sky-600 shadow-md":
                        variant === "secondary",

                    "border border-gray-300 text-gray-700 hover:bg-gray-100":
                        variant === "outline",

                    "text-gray-700 hover:bg-gray-100":
                        variant === "ghost",
                },

                // Sizes
                {
                    "px-3 py-1.5 text-sm": size === "sm",
                    "px-4 py-2.5 text-sm": size === "md",
                    "px-6 py-3 text-base": size === "lg",
                },

                className
            )}
        >
            {loading && (
                <span className="absolute ac">
                    <Spinner />
                </span>
            )}

            <span className={clsx(loading && "opacity-0")}>
                {children}
            </span>
        </button>
    );
}
export default Button;

const Spinner = () => {
    return (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
    );
}