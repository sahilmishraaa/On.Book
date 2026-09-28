import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, asset } from "../services/api";

export default function CreatorDashboard() {
  const [books, setBooks] = useState([]);
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    api("/ebooks/mine")
      .then(setBooks)
      .catch((err) => console.error("Failed to load books:", err));

    api("/drafts")
      .then(setDrafts)
      .catch((err) => console.error("Failed to load drafts:", err));
  }, []);

  return (
    <section className="creator">
      {/* HERO */}
      <div className="creator-hero">
        <div>
          <p className="eyebrow">Creator Studio</p>

          <h1>Author Dashboard</h1>

          <p>
            Write your next masterpiece or publish a finished book and share it
            with readers worldwide.
          </p>
        </div>

        <div className="creator-actions">
          {/* WRITE BOOK */}
          <Link className="creator-card" to="/creator/write">
            <h2>Write a Book</h2>

            <p>
              Start writing your next masterpiece using our built-in writing
              tools.
            </p>

            <b>Start Writing →</b>
          </Link>

          {/* PUBLISH BOOK */}
          <Link className="creator-card" to="/creator/publish">
            <h2>Publish a Book</h2>

            <p>
              Already have a book ready? Publish it now.
            </p>

            <b>Publish Now →</b>
          </Link>
        </div>
      </div>

      {/* SAVED DRAFTS */}
      <div className="creator-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Your Writing</p>
            <h2>Saved Drafts</h2>
          </div>

          <Link to="/creator/write" className="dark-btn">
            + Write New Book
          </Link>
        </div>

        {drafts.length > 0 ? (
          <div className="drafts-grid">
            {drafts.map((draft) => (
              <article className="draft-card" key={draft._id}>
                <div className="draft-card-content">
                  <p className="eyebrow">Draft</p>

                  <h3>
                    {draft.title || "Untitled Book"}
                  </h3>

                  <p>
                    {draft.chapters?.length || 0}{" "}
                    {draft.chapters?.length === 1
                      ? "chapter"
                      : "chapters"}
                  </p>

                  <small>
                    Last saved{" "}
                    {draft.lastSavedAt
                      ? new Date(
                          draft.lastSavedAt
                        ).toLocaleDateString()
                      : "Recently"}
                  </small>
                </div>

                <Link
                  to={`/creator/write/${draft._id}`}
                  className="outline-btn"
                >
                  Continue Writing
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <p>You don't have any saved drafts yet.</p>

            <Link to="/creator/write" className="dark-btn">
              Start Writing
            </Link>
          </div>
        )}
      </div>

      {/* PUBLISHED BOOKS */}
      <div className="creator-section">
        <div className="section-head">
          <h2>Your Books</h2>

          <Link to="/creator/books">
            Manage all →
          </Link>
        </div>

        <div className="book-grid">
          {books.slice(0, 4).map((b) => (
            <div className="mini-book" key={b._id}>
              <img
                src={asset(b.coverImage)}
                alt={b.title}
              />

              <div>
                <h3>{b.title}</h3>

                <p>
                  {b.status} · {b.purchaseCount} purchases
                </p>

                <Link to={`/books/${b._id}`}>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>

        {!books.length && (
          <div className="empty">
            You haven't published any books yet.
          </div>
        )}
      </div>
    </section>
  );
}