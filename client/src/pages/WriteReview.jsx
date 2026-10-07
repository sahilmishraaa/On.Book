import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

export default function WriteReview() {
  const { id } = useParams();
  const nav = useNavigate();

  const [f, setF] = useState({
    rating: 5,
    title: "",
    text: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await api(`/ebooks/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify(f),
      });

      // Go back to the reviews page after successful submission
      nav(`/reviews/${id}`);
    } catch (err) {
      console.error("Review submission failed:", err);

      setError(
        err.message || "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="review-write">
      <div className="review-write-card">

        <p className="eyebrow">
          Share your thoughts
        </p>

        <h1>Write a Review</h1>

        {error && (
          <div className="notice error">
            {error}
          </div>
        )}

        <form onSubmit={submit}>

          {/* STAR RATING */}

          <label>
            Rating
          </label>

          <div className="star-input">
            {[5, 4, 3, 2, 1].map((n) => (
              <span
                key={n}
                className={
                  f.rating >= n
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setF({
                    ...f,
                    rating: n,
                  })
                }
              >
                ★
              </span>
            ))}
          </div>

          {/* TITLE */}

          <label>
            Review Title

            <input
              required
              maxLength={100}
              value={f.title}
              placeholder="Give your review a title"
              onChange={(e) =>
                setF({
                  ...f,
                  title: e.target.value,
                })
              }
            />
          </label>

          {/* REVIEW */}

          <label>
            Your Review

            <textarea
              required
              maxLength={2000}
              value={f.text}
              placeholder="What did you think about this book?"
              onChange={(e) =>
                setF({
                  ...f,
                  text: e.target.value,
                })
              }
            />
          </label>

          {/* ACTIONS */}

          <div className="confirm-actions">

            <button
              className="dark-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Review"}
            </button>

            <button
              type="button"
              className="outline-btn"
              onClick={() => nav(-1)}
              disabled={submitting}
            >
              Go Back
            </button>

          </div>

        </form>

      </div>
    </section>
  );
}