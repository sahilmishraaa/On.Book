import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, asset } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function BookDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [access, setAccess] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api(`/ebooks/${id}`)
      .then(setData)
      .catch((err) => setMessage(err.message));
  }, [id]);

  useEffect(() => {
    if (!user) {
      setAccess(null);
      return;
    }
    api(`/ebooks/${id}/access`)
      .then(setAccess)
      .catch(() => setAccess(null));
  }, [id, user]);

  if (!data) return <div className="center-page">Loading…</div>;
  const { book, reviews } = data;
  const paid = book.isPaid && Number(book.price) > 0;
  const canRead = access?.canRead === true;

  const buy = async () => {
    if (!user) return nav("/login");
    if (!paid) {
      setBusy(true);
      try {
        await api(`/ebooks/${book._id}/buy`, { method: "POST" });
        nav("/my-books");
      } catch (err) {
        setMessage(err.message);
      } finally {
        setBusy(false);
      }
      return;
    }
    nav(`/checkout/${book._id}`);
  };

  const read = () => {
    if (!user) return nav("/login");
    if (!paid || canRead) return nav(`/books/${book._id}/read`);
    nav(`/checkout/${book._id}`);
  };

  return (
    <section className="detail section">
      <Link className="back" to="/books">
        ← Back to Books
      </Link>
      <div className="detail-grid">
        <img className="detail-cover" src={asset(book.coverImage)} />
        <div>
          <p className="eyebrow">{book.category?.name || "Featured Book"}</p>
          <h1>{book.title}</h1>
          <div className="book-author">
            {book.author?.avatar ? (
              <img
                src={asset(book.author.avatar)}
                alt={book.author.username}
                className="author-avatar"
              />
            ) : (
              <div className="author-avatar-placeholder">
                {book.author?.username?.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <p className="eyebrow">Written by</p>

              <h3>{book.author?.name || book.author?.username}</h3>

              {book.author?.bio && (
                <p className="author-bio">{book.author.bio}</p>
              )}
            </div>
          </div>
          <div className="rating-line">
            ★ {Number(book.rating || 0).toFixed(1)} ·{" "}
            {book.reviewCount || reviews.length} reviews
          </div>
          <p className="detail-description">{book.description}</p>
          <div className="price-large">
            {paid ? `$${Number(book.price).toFixed(2)}` : "Free"}
          </div>

          {message && <p className="muted">{message}</p>}
          {paid && user && !canRead && (
            <p className="muted">
              Purchase this book to unlock reading access.
            </p>
          )}
          {!paid && (
            <p className="muted">
              This book is free to read. Add it to My Books to keep it in your
              library.
            </p>
          )}

          <div className="detail-actions">
            {!paid && !canRead && (
              <button className="dark-btn big" onClick={buy} disabled={busy}>
                {busy ? "Adding…" : "Add to My Books"}
              </button>
            )}
            {paid && !canRead && (
              <button className="dark-btn big" onClick={buy}>
                Buy Now
              </button>
            )}
            {canRead && (
              <button className="dark-btn big" onClick={read}>
                Read Book
              </button>
            )}
            {!user && (
              <button className="dark-btn big" onClick={() => nav("/login")}>
                Sign In to Read
              </button>
            )}
            <Link className="outline-btn" to={`/reviews/${book._id}`}>
              Read Reviews
            </Link>
          </div>
          <Link className="small-link" to={`/reviews/${book._id}/write`}>
            Write a review
          </Link>
        </div>
      </div>
    </section>
  );
}
