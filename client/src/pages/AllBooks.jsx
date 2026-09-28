import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, asset } from "../services/api";
export default function AllBooks() {
  const [b, setB] = useState([]);
  const load = () => api("/ebooks/mine").then(setB);
  useEffect(() => {
    load();
  }, []);
  const remove = async (id) => {
    if (confirm("Remove this book?")) {
      await api(`/ebooks/${id}`, { method: "DELETE" });
      load();
    }
  };
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Creator Studio</p>
          <h1>All Books</h1>
        </div>
        <Link className="dark-btn" to="/creator/publish">
          Publish New
        </Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Status</th>
              <th>Price</th>
              <th>Purchases</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {b.map((x) => (
              <tr key={x._id}>
                <td>
                  <div className="table-book">
                    <img src={asset(x.coverImage)} />
                    <b>{x.title}</b>
                  </div>
                </td>
                <td>{x.status}</td>
                <td>{x.isPaid ? `$${x.price}` : "Free"}</td>
                <td>{x.purchaseCount}</td>
                <td>
                  <Link to={`/books/${x._id}`}>View</Link>{" "}
                  <button onClick={() => remove(x._id)} className="danger-text">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!b.length && <div className="empty">No books yet.</div>}
    </section>
  );
}
