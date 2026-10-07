import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, asset } from "../services/api";

export default function Reviews() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    setError("");

    api(`/ebooks/${id}`)
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        console.error("Failed to load reviews:", err);
        setError(err.message || "Failed to load reviews.");
      });
  }, [id]);

  const list = useMemo(() => {
    let reviews = [...(data?.reviews || [])];

    if (filter !== "all") {
      reviews = reviews.filter(
        (review) => Number(review.rating) === Number(filter)
      );
    }

    if (sort === "highest") {
      reviews.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "lowest") {
      reviews.sort((a, b) => a.rating - b.rating);
    }

    if (sort === "recent") {
      reviews.sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return reviews;
  }, [data, filter, sort]);

  // Error state
  if (error) {
    return (
      <section className="reviews-page">
        <button
          className="back-btn"
          onClick={() => nav(`/books/${id}`)}
        >
          ← Back to Book
        </button>

        <div className="empty">
          <h2>Unable to load reviews</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  // Loading state
  if (!data) {
    return (
      <div className="center-page">
        Loading…
      </div>
    );
  }

  const { book, reviews = [] } = data;
  const avg = Number(book.rating || 0);

  return (
    <section className="reviews-page">

      {/* Back button */}
      <button
        className="back-btn"
        onClick={() => nav(`/books/${id}`)}
      >
        ← Back to Book
      </button>

      {/* Header */}
      <div className="reviews-header">

        <div>
          <p className="eyebrow">
            Reader Reviews
          </p>

          <h1>
            Reviews for “{book.title}”
          </h1>
        </div>

        <Link
          className="dark-btn"
          to={`/reviews/${id}/write`}
        >
          Write a Review
        </Link>

      </div>

      {/* Rating summary */}
      <div className="review-summary">

        <div className="rating-number">
          <b>{avg.toFixed(1)}</b>

          <span className="stars">
            {"★".repeat(Math.round(avg))}
            {"☆".repeat(5 - Math.round(avg))}
          </span>

          <span>
            {reviews.length}{" "}
            {reviews.length === 1
              ? "review"
              : "reviews"}
          </span>
        </div>

      </div>

      {/* Filters */}
      <div className="review-filters">

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="recent">
            Most Recent
          </option>

          <option value="highest">
            Highest Rated
          </option>

          <option value="lowest">
            Lowest Rated
          </option>
        </select>

        {["all", 5, 4, 3, 2, 1].map((s) => (
          <button
            className={
              filter === String(s)
                ? "active"
                : ""
            }
            key={s}
            onClick={() => setFilter(String(s))}
          >
            {s === "all"
              ? "All"
              : `${s} Star${s > 1 ? "s" : ""}`}
          </button>
        ))}

      </div>

      {/* Reviews */}
      <div className="reviews-list">

        {list.map((r) => {

          // Your backend populates "author".
          // user is kept as a fallback for older data.
          const author = r.author || r.user || {};

          const displayName =
            author.name ||
            author.username ||
            "Anonymous User";

          const initial =
            displayName.charAt(0).toUpperCase();

          return (
            <article
              className="review-card"
              key={r._id}
            >

              {/* Reviewer information */}
              <div className="review-head">

                {author.avatar ? (
                  <img
                    className="avatar review-avatar"
                    src={asset(author.avatar)}
                    alt={displayName}
                  />
                ) : (
                  <div className="avatar">
                    {initial}
                  </div>
                )}

                <div>
                  <h3>
                    {displayName}
                  </h3>

                  <div className="review-meta">

                    <span className="stars">
                      {"★".repeat(
                        Number(r.rating)
                      )}

                      {"☆".repeat(
                        5 - Number(r.rating)
                      )}
                    </span>

                    <small>
                      Verified Purchase ·{" "}
                      {new Date(
                        r.createdAt
                      ).toLocaleDateString()}
                    </small>

                  </div>
                </div>

              </div>

              {/* Review content */}
              <h3 className="review-title">
                {r.title}
              </h3>

              <p className="review-text">
                {r.text}
              </p>

              {/* Helpful buttons */}
              <div className="helpful">

                <button
                  onClick={() =>
                    api(
                      `/ebooks/${id}/reviews/${r._id}/helpful`,
                      {
                        method: "POST",
                        body: JSON.stringify({
                          type: "helpful",
                        }),
                      }
                    )
                  }
                >
                  👍 Helpful ({r.helpful || 0})
                </button>

                <button
                  onClick={() =>
                    api(
                      `/ebooks/${id}/reviews/${r._id}/helpful`,
                      {
                        method: "POST",
                        body: JSON.stringify({
                          type: "notHelpful",
                        }),
                      }
                    )
                  }
                >
                  👎 Not Helpful (
                  {r.notHelpful || 0})
                </button>

              </div>

            </article>
          );
        })}

      </div>

      {/* No reviews */}
      {!list.length && (
        <div className="empty">
          No reviews match this filter.
        </div>
      )}

    </section>
  );
}