import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { asset, api } from "../services/api";

export default function BookCard({ book }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check whether this book is already in the wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const wishlist = await api("/users/wishlist");

        const exists = wishlist.some((item) => item._id === book._id);

        setSaved(exists);
      } catch (error) {
        console.error("Could not load wishlist:", error);
      }
    };

    checkWishlist();
  }, [book._id]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);

      const result = await api(`/users/wishlist/${book._id}`, {
        method: "POST",
      });

      setSaved(result.saved);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="book-card">
      <div className="book-cover">
        <Link to={`/books/${book._id || book.slug}`}>
          <img src={asset(book.coverImage)} alt={book.title} />
        </Link>

        <button
          className={`wishlist-btn ${saved ? "saved" : ""}`}
          onClick={toggleWishlist}
          disabled={loading}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>

      <div className="book-card-info">
        <Link to={`/books/${book._id || book.slug}`}>
          <h3>{book.title}</h3>
        </Link>

        <p>
          By{" "}
          {book.author?.name ||
            book.author?.username ||
            book.publisher ||
            "Unknown"}
        </p>

        <div className="card-row">
          <b>
            {book.isPaid && book.price > 0
              ? `$${Number(book.price).toFixed(2)}`
              : "Free"}
          </b>

          <span className="stars">★ {Number(book.rating || 0).toFixed(1)}</span>
        </div>
      </div>
    </article>
  );
}
