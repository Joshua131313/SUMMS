import { Link } from "react-router-dom";

interface Props {
    title: string;
    subtitle?: string;
    footerText?: string;
    footerLinkText?: string;
    footerLinkTo?: string;
    children: React.ReactNode;
}

const AuthLayout = ({
    title,
    subtitle,
    footerText,
    footerLinkText,
    footerLinkTo,
    children,
}: Props) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-blue-100 to-white" />

            <div className="absolute inset-0 backdrop-blur-[2px]" />

            <div className="relative w-full max-w-md px-8 py-10 rounded-3xl
                      bg-white/70 backdrop-blur-xl
                      border border-white/40
                      shadow-[0_20px_50px_rgba(0,0,0,0.15)]">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-2 text-sm text-gray-600">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="space-y-5">
                    {children}
                </div>

                {footerText && footerLinkText && footerLinkTo && (
                    <div className="mt-8 text-center text-sm text-gray-600">
                        {footerText}{" "}
                        <Link
                            to={footerLinkTo}
                            className="font-medium text-gray-800 hover:text-black transition"
                        >
                            {footerLinkText}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
export default AuthLayout;