import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Nav() {
    const { user, logout } = useAuth();
    const [q, setQ] = useState("");
    const nav = useNavigate();

    const submit = (e) => {
        e.preventDefault();
        nav(`/books?q=${encodeURIComponent(q)}`);
    };

    return (
        <nav className="nav">
            <Link className="logo" to="/">
                On.Book
            </Link>

            <div className="navlinks">
                <Link to="/books">Books</Link>

                <Link to="/categories">
                    Categories
                </Link>

                <Link to="/wishlist">
                    Wishlist
                </Link>

                {user && (
                    <Link to="/my-books">
                        My Books
                    </Link>
                )}

                <Link to="/about">
                    About Us
                </Link>

                {/* Normal reader */}
                {user?.role === "reader" && (
                    <Link to="/become-creator">
                        Become a Creator
                    </Link>
                )}

                {/* Creator / Admin */}
                {(user?.role === "creator" ||
                    user?.role === "admin") && (
                    <Link to="/creator">
                        Creator
                    </Link>
                )}
            </div>

            <div className="navright">
                <form onSubmit={submit}>
                    <input
                        value={q}
                        onChange={(e) =>
                            setQ(e.target.value)
                        }
                        placeholder="Search book..."
                    />
                </form>

                <span>|</span>

                {user ? (
                    <div className="user-menu">
                        <Link to="/account">
                            Hello, {user.username}
                        </Link>

                        <button onClick={logout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login">
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
}