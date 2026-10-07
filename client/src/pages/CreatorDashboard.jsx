import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, asset } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CreatorDashboard() {
  const [books, setBooks] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);

      const [booksData, draftsData, analyticsData] = await Promise.all([
        api("/ebooks/mine"),
        api("/drafts"),
        api("/ebooks/creator/analytics"),
      ]);

      setBooks(booksData || []);
      setDrafts(draftsData || []);
      setAnalytics(analyticsData || {});
    } catch (error) {
      console.error("Failed to load creator dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteDraft = async (draftId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this draft?",
    );

    if (!confirmed) return;

    try {
      await api(`/drafts/${draftId}`, {
        method: "DELETE",
      });

      setDrafts((prev) => prev.filter((draft) => draft._id !== draftId));
    } catch (error) {
      alert(error.message || "Unable to delete draft.");
    }
  };

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

          {user?.bio && <p className="creator-bio">{user.bio}</p>}
        </div>

        <div className="creator-actions">
          <Link className="creator-card" to="/creator/write">
            <h2>Write a Book</h2>

            <p>
              Start writing your next masterpiece using our built-in writing
              tools.
            </p>

            <b>Start Writing →</b>
          </Link>

          <Link className="creator-card" to="/creator/publish">
            <h2>Publish a Book</h2>

            <p>Already have a book ready? Publish it now.</p>

            <b>Publish Now →</b>
          </Link>
        </div>
      </div>

      {/* CREATOR ANALYTICS */}
      <div className="creator-section analytics-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Your performance</p>
            <h2>Creator Analytics</h2>
          </div>
        </div>

        {loading ? (
          <div className="empty">Loading analytics...</div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="analytics-stats">
              <div className="analytics-stat">
                <span>Total Earnings</span>
                <strong>
                  ₹{Number(analytics?.totalEarnings || 0).toLocaleString()}
                </strong>
                <small>From successful book sales</small>
              </div>

              <div className="analytics-stat">
                <span>Total Sales</span>
                <strong>{analytics?.totalSales || 0}</strong>
                <small>Books sold</small>
              </div>

              <div className="analytics-stat">
                <span>Published Books</span>
                <strong>{analytics?.publishedBooks || 0}</strong>
                <small>Your published titles</small>
              </div>
            </div>

            {/* TOP SELLING BOOKS */}
            <div className="analytics-grid">
              <div className="analytics-panel">
                <div className="analytics-panel-head">
                  <div>
                    <p className="eyebrow">Performance</p>
                    <h3>Top Selling Books</h3>
                  </div>
                </div>

                {analytics?.topSellingBooks?.length ? (
                  <div className="top-books">
                    {analytics.topSellingBooks
                      .slice(0, 5)
                      .map((book, index) => (
                        <div className="top-book" key={book._id}>
                          <span className="top-book-rank">{index + 1}</span>

                          <img src={asset(book.coverImage)} alt={book.title} />

                          <div className="top-book-info">
                            <h4>{book.title}</h4>

                            <p>
                              {book.sales} {book.sales === 1 ? "sale" : "sales"}
                            </p>
                          </div>

                          <strong>
                            ₹{Number(book.earnings || 0).toLocaleString()}
                          </strong>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="empty">
                    <h3>No sales yet</h3>
                    <p>
                      Your book sales will appear here once readers purchase
                      your books.
                    </p>
                  </div>
                )}
              </div>

              {/* BEST SELLER */}
              <div className="analytics-panel bestseller-panel">
                <p className="eyebrow">Your #1 Book</p>

                <h3>Best Seller</h3>

                {analytics?.topSellingBooks?.[0] ? (
                  <>
                    <img
                      className="creator-best-cover"
                      src={asset(analytics.topSellingBooks[0].coverImage)}
                      alt={analytics.topSellingBooks[0].title}
                    />

                    <h4>{analytics.topSellingBooks[0].title}</h4>

                    <p>{analytics.topSellingBooks[0].sales} sales</p>

                    <strong>
                      ₹
                      {Number(
                        analytics.topSellingBooks[0].earnings || 0,
                      ).toLocaleString()}{" "}
                      earned
                    </strong>

                    <Link
                      to={`/books/${analytics.topSellingBooks[0]._id}`}
                      className="outline-btn"
                    >
                      View Book →
                    </Link>
                  </>
                ) : (
                  <div className="empty">No bestseller yet.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* DRAFTS */}
      <div className="creator-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Continue your work</p>
            <h2>Your Drafts</h2>
          </div>

          <Link to="/creator/write" className="dark-btn">
            + Write New Book
          </Link>
        </div>

        {loading ? (
          <div className="empty">Loading drafts...</div>
        ) : drafts.length === 0 ? (
          <div className="empty">
            <h3>No drafts yet</h3>

            <p>
              Start writing a book and your unfinished work will appear here.
            </p>

            <Link to="/creator/write" className="dark-btn">
              Start Writing
            </Link>
          </div>
        ) : (
          <div className="draft-grid">
            {drafts.map((draft) => {
              const wordCount = (draft.chapters || []).reduce(
                (total, chapter) =>
                  total +
                  (chapter.content || "").trim().split(/\s+/).filter(Boolean)
                    .length,
                0,
              );

              return (
                <div className="draft-card" key={draft._id}>
                  <div className="draft-card-top">
                    <span className="draft-badge">Draft</span>

                    <button
                      type="button"
                      className="draft-delete"
                      onClick={() => deleteDraft(draft._id)}
                    >
                      Delete
                    </button>
                  </div>

                  <h3>{draft.title || "Untitled Book"}</h3>

                  <p>
                    {draft.chapters?.length || 0}{" "}
                    {draft.chapters?.length === 1 ? "chapter" : "chapters"}
                    {" · "}
                    {wordCount} words
                  </p>

                  <p className="draft-date">
                    Last saved{" "}
                    {draft.updatedAt
                      ? new Date(draft.updatedAt).toLocaleDateString()
                      : "recently"}
                  </p>

                  <Link
                    to={`/creator/write/${draft._id}`}
                    className="outline-btn"
                  >
                    Continue Writing →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PUBLISHED BOOKS */}
      <div className="creator-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Published work</p>
            <h2>Your Books</h2>
          </div>

          <Link to="/creator/books">Manage all →</Link>
        </div>

        <div className="book-grid">
          {books.slice(0, 4).map((book) => (
            <div className="mini-book" key={book._id}>
              <img src={asset(book.coverImage)} alt={book.title} />

              <div>
                <h3>{book.title}</h3>

                <p>
                  {book.status} · {book.purchaseCount || 0} purchases
                </p>

                <Link to={`/books/${book._id}`}>View</Link>
              </div>
            </div>
          ))}
        </div>

        {!loading && !books.length && (
          <div className="empty">You haven't published any books yet.</div>
        )}
      </div>
    </section>
  );
}
