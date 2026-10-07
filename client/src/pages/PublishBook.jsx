import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";

export default function PublishBook() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const draftId = searchParams.get("draft");

  const [cats, setCats] = useState([]);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [f, setF] = useState({
    title: "",
    description: "",
    pages: "",
    price: "",
    pricingType: "paid",
    genres: [],
    keywords: "",
    alias: "",
    publisher: "",
    category: "",
  });

  const [cover, setCover] = useState(null);
  const [file, setFile] = useState(null);
  const [genre, setGenre] = useState("");

  /*
   * Load categories
   */
  useEffect(() => {
    api("/ebooks/categories")
      .then(setCats)
      .catch((err) => {
        console.error("Failed to load categories:", err);
      });
  }, []);

  /*
   * If this is a written-book draft,
   * load the draft information.
   */
  useEffect(() => {
    if (!draftId) return;

    const loadDraft = async () => {
      try {
        setLoadingDraft(true);

        const draft = await api(`/drafts/${draftId}`);

        setF((prev) => ({
          ...prev,
          title: draft.title || "",
        }));
      } catch (error) {
        console.error("Failed to load draft:", error);
        alert(error.message || "Unable to load draft.");
        nav("/creator/write");
      } finally {
        setLoadingDraft(false);
      }
    };

    loadDraft();
  }, [draftId, nav]);

  /*
   * Add custom genre
   */
  const addGenre = () => {
    const value = genre.trim();

    if (!value) return;

    if (!f.genres.includes(value)) {
      setF((prev) => ({
        ...prev,
        genres: [...prev.genres, value],
      }));
    }

    setGenre("");
  };

  /*
   * Normal publishing
   */
  const submitNormalBook = async () => {
    const fd = new FormData();

    Object.entries(f).forEach(([key, value]) => {
      fd.append(
        key,
        Array.isArray(value) ? value.join(", ") : value
      );
    });

    if (cover) {
      fd.append("coverImage", cover);
    }

    if (file) {
      fd.append("bookFile", file);
    }

    await api("/ebooks/publish", {
      method: "POST",
      body: fd,
    });
  };

  /*
   * Publish written draft
   */
  const submitWrittenBook = async () => {
    if (!draftId) return;

    const fd = new FormData();

    Object.entries(f).forEach(([key, value]) => {
      fd.append(
        key,
        Array.isArray(value) ? value.join(", ") : value
      );
    });

    if (cover) {
      fd.append("coverImage", cover);
    }

    await api(`/drafts/${draftId}/publish`, {
      method: "POST",
      body: fd,
    });
  };

  /*
   * Submit
   */
  const submit = async (e) => {
    e.preventDefault();

    if (!cover) {
      alert("Please upload a book cover.");
      return;
    }

    if (f.pricingType === "paid" && !f.price) {
      alert("Please enter the book price.");
      return;
    }

    if (!f.genres.length) {
      alert("Please select at least one genre.");
      return;
    }

    if (!f.keywords.trim()) {
      alert("Please enter some keywords.");
      return;
    }

    try {
      setPublishing(true);

      if (draftId) {
        await submitWrittenBook();

        alert("Your written book has been published successfully!");

        nav("/creator/books");
      } else {
        await submitNormalBook();

        nav("/creator/books");
      }
    } catch (error) {
      console.error("Publishing failed:", error);

      alert(
        error.message ||
          "Unable to publish the book. Please try again."
      );
    } finally {
      setPublishing(false);
    }
  };

  if (loadingDraft) {
    return (
      <section className="publish-page">
        <div className="publish-card">
          <p>Loading your written book...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="publish-page">
      <div className="publish-card">
        <p className="eyebrow">Creator Studio</p>

        <h1>
          {draftId ? "Publish Your Written Book" : "Publish Your Book"}
        </h1>

        {draftId && (
          <p className="publish-info">
            Your written content is ready. Add the remaining book
            details before publishing.
          </p>
        )}

        <form onSubmit={submit}>
          {/* TITLE */}

          <label>
            Book Title*
            <input
              required
              value={f.title}
              onChange={(e) =>
                setF({
                  ...f,
                  title: e.target.value,
                })
              }
            />
          </label>

          {/* DESCRIPTION */}

          <label>
            Book Description*
            <textarea
              required
              value={f.description}
              onChange={(e) =>
                setF({
                  ...f,
                  description: e.target.value,
                })
              }
              placeholder="Tell readers what your book is about..."
            />
          </label>

          {/* PAGES */}

          <label>
            Number of Pages
            <input
              type="number"
              min="1"
              value={f.pages}
              onChange={(e) =>
                setF({
                  ...f,
                  pages: e.target.value,
                })
              }
            />

            <small>
              Enter the approximate number of pages in your book.
            </small>
          </label>

          {/* COVER */}

          <label>
            Book Cover Image*
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) =>
                setCover(e.target.files?.[0] || null)
              }
            />

            <small>
              Recommended: 1600×2400, JPG/PNG.
            </small>

            {cover && (
              <small>
                Selected: {cover.name}
              </small>
            )}
          </label>

          {/* ONLY SHOW BOOK FILE FOR NORMAL UPLOAD */}

          {!draftId && (
            <label>
              Book File*
              <input
                type="file"
                accept=".pdf,.epub,.mobi"
                required
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
              />

              <small>
                Max 100MB. Supported formats: PDF, EPUB, MOBI.
              </small>

              {file && (
                <small>
                  File size:{" "}
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </small>
              )}
            </label>
          )}

          {/* PRICING */}

          <div className="pricing">
            <b>Pricing Type*</b>

            <label className="radio">
              <input
                type="radio"
                checked={f.pricingType === "paid"}
                onChange={() =>
                  setF({
                    ...f,
                    pricingType: "paid",
                  })
                }
              />

              Paid
            </label>

            <label className="radio">
              <input
                type="radio"
                checked={f.pricingType === "free"}
                onChange={() =>
                  setF({
                    ...f,
                    pricingType: "free",
                    price: "",
                  })
                }
              />

              Free
            </label>
          </div>

          {/* PRICE */}

          {f.pricingType === "paid" && (
            <label>
              Price ($)*
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={f.price}
                onChange={(e) =>
                  setF({
                    ...f,
                    price: e.target.value,
                  })
                }
              />
            </label>
          )}

          {/* GENRES */}

          <label>
            Genres*
            <select
              multiple
              value={f.genres}
              onChange={(e) =>
                setF({
                  ...f,
                  genres: [
                    ...e.target.selectedOptions,
                  ].map((x) => x.value),
                })
              }
            >
              {[
                "Fiction",
                "Non-Fiction",
                "Mystery",
                "Science Fiction",
                "Romance",
                "Thriller",
                "Horror",
                ...f.genres.filter(
                  (g) =>
                    ![
                      "Fiction",
                      "Non-Fiction",
                      "Mystery",
                      "Science Fiction",
                      "Romance",
                      "Thriller",
                      "Horror",
                    ].includes(g)
                ),
              ].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>

          {/* CUSTOM GENRE */}

          <div className="add-genre">
            <input
              value={genre}
              onChange={(e) =>
                setGenre(e.target.value)
              }
              placeholder="Add custom genre"
            />

            <button
              type="button"
              className="outline-btn"
              onClick={addGenre}
            >
              Add Genre
            </button>
          </div>

          {/* KEYWORDS */}

          <label>
            Keywords (comma separated)*
            <input
              required
              value={f.keywords}
              onChange={(e) =>
                setF({
                  ...f,
                  keywords: e.target.value,
                })
              }
              placeholder="adventure, magic, young adult"
            />
          </label>

          {/* ALIAS */}

          <label>
            Author Alias
            <input
              value={f.alias}
              onChange={(e) =>
                setF({
                  ...f,
                  alias: e.target.value,
                })
              }
              placeholder="Your pen name"
            />
          </label>

          {/* CATEGORY */}

          <label>
            Category
            <select
              value={f.category}
              onChange={(e) =>
                setF({
                  ...f,
                  category: e.target.value,
                })
              }
            >
              <option value="">
                Select category
              </option>

              {cats.map((c) => (
                <option
                  value={c._id}
                  key={c._id}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {/* BUTTONS */}

          <div className="form-buttons">
            <button
              type="submit"
              className="dark-btn"
              disabled={publishing}
            >
              {publishing
                ? "Publishing..."
                : "Publish Book"}
            </button>

            <button
              type="button"
              className="outline-btn"
              onClick={() =>
                draftId
                  ? nav(`/creator/write/${draftId}`)
                  : nav("/creator")
              }
            >
              {draftId
                ? "Back to Writing"
                : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}