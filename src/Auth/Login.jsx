import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import colors from "../utils/Colors";
import { login, signup } from "../services/auth/authServices";
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [cuid, setCuid] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!cuid.trim() || !password) {
            setError("Please enter both CUID and password.");
            return;
        }

        try {
            const response = await login({ cuid, password });
            console.log("Login successful:", response.user);
            localStorage.setItem("authToken", JSON.stringify(response.user));

            navigate('/'); // ⬅️ redirect here
            // You can redirect here, e.g., using navigate or window.location
        } catch (err) {
            console.error("Login failed:", err);
            setError("Invalid CUID or password. Please try again.");
            return
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
            <div className="rounded-2xl shadow-lg p-8 max-w-sm w-full" style={{ backgroundColor: colors.surface }}>
                <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.textPrimary }}>Welcome Back</h2>
                <form  >
                    <div className="mb-4">
                        <label className="block text-sm font-medium" style={{ color: colors.textSecondary }}>CUID</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cuid}
                                onChange={(e) => setCuid(e.target.value)}
                                className="mt-1 w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2"
                                style={{ border: `1px solid ${colors.border}`, color: colors.textPrimary }}
                                placeholder="Enter your CUID"
                            />
                            <FontAwesomeIcon icon={faUser} className="absolute top-3.5 left-3" style={{ color: colors.icon }} />
                        </div>
                    </div>
                    <div className="mb-4 relative">
                        <label className="block text-sm font-medium" style={{ color: colors.textSecondary }}>Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full pl-10 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2"
                                style={{ border: `1px solid ${colors.border}`, color: colors.textPrimary }}
                                placeholder="Enter your password"
                            />
                            <FontAwesomeIcon icon={faLock} className="absolute top-3.5 left-3" style={{ color: colors.icon }} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-3.5 right-3"
                                style={{ color: colors.icon }}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 px-4 font-semibold rounded-xl transition duration-200"
                        style={{ backgroundColor: colors.primary, color: colors.buttonText }}
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
