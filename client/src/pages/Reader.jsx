import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, apiBlob } from '../services/api';

export default function Reader() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    async function loadReader() {
      try {
        const data = await api(`/ebooks/${id}`);
        if (!active) return;
        setBook(data.book);

        // The backend decides whether this user can read the book.
        const blob = await apiBlob(`/ebooks/${data.book._id}/read`);
        objectUrl = URL.createObjectURL(blob);
        if (active) setPdfUrl(objectUrl);

        await api(`/users/history/${data.book._id}`, { method: 'POST' });
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadReader();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  if (error) {
    return (
      <section className="section center-page">
        <h1>Reading is not available</h1>
        <p>{error}</p>
        <div className="confirm-actions">
          <Link className="dark-btn" to={`/checkout/${id}`}>Purchase Book</Link>
          <Link className="outline-btn" to={`/books/${id}`}>Back to Book</Link>
        </div>
      </section>
    );
  }

  if (!book || !pdfUrl) return <div className="center-page">Opening reader…</div>;

  return (
    <section className="reader-page">
      <div className="reader-toolbar">
        <div>
          <Link className="back" to={`/books/${book._id}`}>← Back to Book</Link>
          <h1>{book.title}</h1>
          <p>by {book.author?.name || book.author?.username || 'Author'}</p>
        </div>
        <a className="outline-btn" href={pdfUrl} target="_blank" rel="noreferrer">Open PDF</a>
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
