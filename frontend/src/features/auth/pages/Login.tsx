import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayou";
import Input from "../../../components/ui/Input/Input";
import Button from "../../../components/ui/Button/Button";
import { authService } from "../services/authServices";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate()

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await authService.login(email, password);
            console.log("Login successful");
            navigate("/");
        }
        catch (e: any) {
            setError(e.message || "Login failed")
        }
        finally {
            setLoading(false);
        }

    }

    return (
        <AuthLayout
            title="Sign In"
            subtitle="Welcome back! Access your rides, parking, and transit instantly."
            footerText="Don't have an account?"
            footerLinkText="Register"
            footerLinkTo="/register"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    required
                    error={error}
                />
                <div className="text-right text-sm">
                    <Link
                        to="/forgot-password"
                        className="text-gray-600 hover:text-black transition"
                    >
                        Forgot password?
                    </Link>
                </div>
                <Button type="submit" fullWidth loading={loading}>
                    Sign in
                </Button>
            </form>
        </AuthLayout>
    );
}
export default Login;