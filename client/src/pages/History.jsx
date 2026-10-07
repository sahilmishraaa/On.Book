import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, asset } from "../services/api";
export default function History() {
  const [h, setH] = useState([]);
  useEffect(() => {
    api("/users/history").then(setH);
  }, []);
  return (
    <section className="section">
      <div className="page-header left">
        <p>Pick up where you left off</p>
        <h1>Reading History</h1>
      </div>
      <div className="list-grid">
        {h.map((x) => (
          <article className="library-card" key={x._id}>
            <img src={asset(x.ebook?.coverImage)} />
            <div>
              <h2>{x.ebook?.title}</h2>
              <p>Last read {new Date(x.lastReadAt).toLocaleString()}</p>
              <Link className="dark-btn" to={`/books/${x.ebook?._id}`}>
                Continue
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!h.length && (
        <div className="empty">Your reading history will appear here.</div>
      )}
    </section>
  );
}
