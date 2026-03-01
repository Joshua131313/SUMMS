import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = ({
    label,
    error,
    className,
    ...props
}: InputProps) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <input
                {...props}
                className={clsx(
                    "w-full rounded-xl border bg-white/70 px-4 py-2.5 text-sm transition",
                    "focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent",
                    error
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-300",
                    className
                )}
            />

            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}
export default Input;