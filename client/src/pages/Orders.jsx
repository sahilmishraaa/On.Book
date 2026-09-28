import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asset } from '../services/api';

export default function Orders() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/users/orders').then(setBooks).catch(err => setError(err.message));
  }, []);

  return (
    <section className="section">
      <div className="page-header left">
        <p>Your purchased and free books</p>
        <h1>My Books</h1>
      </div>
      {error && <p className="muted">{error}</p>}
      <div className="list-grid">
        {books.map(o => (
          <article className="library-card" key={o._id}>
            <img src={asset(o.ebook?.coverImage)} />
            <div>
              <h2>{o.ebook?.title || o.title}</h2>
              <p>{o.amount > 0 ? `Purchased · $${Number(o.amount).toFixed(2)}` : 'Free book'} · {new Date(o.purchasedAt).toLocaleDateString()}</p>
              <div className="confirm-actions">
                <Link className="outline-btn" to={`/books/${o.ebook?._id}`}>View Book</Link>
                <Link className="dark-btn" to={`/books/${o.ebook?._id}/read`}>Read Book</Link>
              </div>
            </div>
          </article>
        ))}
        {!books.length && <div className="empty">Your My Books library is empty. Add a free book or purchase a paid book to see it here.</div>}
      </div>
    </section>
  );
}
