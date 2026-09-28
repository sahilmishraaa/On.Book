import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function BecomeCreator() {
    const { user, updateUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const becomeCreator = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await api(
                "/users/become-creator",
                {
                    method: "POST",
                }
            );

            updateUser(result.user);

            navigate("/creator");
        } catch (e) {
            setError(
                e.message ||
                    "Unable to become a creator."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="about-page">
            <div className="about-hero">
                <div className="about-hero-content">
                    <p className="eyebrow">
                        BECOME A CREATOR
                    </p>

                    <h1>
                        Your story deserves
                        <br />
                        to be discovered.
                    </h1>

                    <p className="about-hero-text">
                        Share your ideas, publish your
                        stories and reach readers through
                        On.Book.
                    </p>

                    {user?.role === "reader" && (
                        <button
                            className="dark-btn"
                            onClick={becomeCreator}
                            disabled={loading}
                        >
                            {loading
                                ? "Setting up..."
                                : "Become a Creator"}
                        </button>
                    )}

                    {error && (
                        <p className="creator-error">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}