import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, apiBlob } from "../services/api";

export default function Reader() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    async function loadReader() {
      try {
        setLoading(true);
        setError("");

        // Get book information
        const data = await api(`/ebooks/${id}`);

        if (!active) return;

        const currentBook = data.book;
        setBook(currentBook);

        /*
         * First check whether the current user
         * has permission to read the book.
         */
        const access = await api(`/ebooks/${currentBook._id}/access`);

        if (!access.canRead) {
          throw new Error(
            access.message || "Purchase this book before reading it.",
          );
        }

        /*
         * Written books don't have a PDF.
         * Their content is stored directly in the database.
         */
        if (currentBook.content) {
          await api(`/users/history/${currentBook._id}`, {
            method: "POST",
          });

          setLoading(false);
          return;
        }

        /*
         * Uploaded PDF/EPUB books still use
         * the protected /read endpoint.
         */
        const blob = await apiBlob(
          `/ebooks/${currentBook._id}/read`,
        );

        objectUrl = URL.createObjectURL(blob);

        if (active) {
          setPdfUrl(objectUrl);
        }

        await api(`/users/history/${currentBook._id}`, {
          method: "POST",
        });

        setLoading(false);
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to open this book.");
          setLoading(false);
        }
      }
    }

    loadReader();

    return () => {
      active = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id]);

  /*
   * Error state
   */
  if (error) {
    return (
      <section className="section center-page">
        <h1>Reading is not available</h1>

        <p>{error}</p>

        <div className="confirm-actions">
          <Link
            className="dark-btn"
            to={`/checkout/${id}`}
          >
            Purchase Book
          </Link>

          <Link
            className="outline-btn"
            to={`/books/${id}`}
          >
            Back to Book
          </Link>
        </div>
      </section>
    );
  }

  /*
   * Loading state
   */
  if (loading || !book) {
    return (
      <div className="center-page">
        Opening reader…
      </div>
    );
  }

  /*
   * Written book
   */
  if (book.content) {
    return (
      <section className="reader-page written-reader">
        <div className="reader-toolbar">
          <div>
            <Link
              className="back"
              to={`/books/${book._id}`}
            >
              ← Back to Book
            </Link>

            <h1>{book.title}</h1>

            <p>
              by{" "}
              {book.author?.name ||
                book.author?.username ||
                "Author"}
            </p>
          </div>
        </div>

        <article className="book-content">
          <div
            dangerouslySetInnerHTML={{
              __html: book.content,
            }}
          />
        </article>
      </section>
    );
  }

  /*
   * PDF book
   */
  if (pdfUrl) {
    return (
      <section className="reader-page">
        <div className="reader-toolbar">
          <div>
            <Link
              className="back"
              to={`/books/${book._id}`}
            >
              ← Back to Book
            </Link>

            <h1>{book.title}</h1>

            <p>
              by{" "}
              {book.author?.name ||
                book.author?.username ||
                "Author"}
            </p>
          </div>

          <a
            className="outline-btn"
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open PDF
          </a>
        </div>

        <div className="pdf-frame-wrap">
          <iframe
            className="pdf-frame"
            src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
            title={`Reading ${book.title}`}
          />
        </div>
      </section>
    );
  }

  return (
    <div className="center-page">
      <h2>Reading content is unavailable.</h2>

      <Link
        className="outline-btn"
        to={`/books/${book._id}`}
      >
        Back to Book
      </Link>
    </div>
  );
}