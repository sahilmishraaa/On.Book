import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import BookCard from "../components/BookCard";

export default function Books() {
    const [params, setParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [cats, setCats] = useState([]);
    const [q, setQ] = useState(params.get("q") || "");
    const [paid, setPaid] = useState(params.get("paid") || "");

    useEffect(() => {
        api("/ebooks/categories").then(setCats);
        load();
    }, [params.toString()]);

    const load = () =>
        api(
            `/ebooks?q=${encodeURIComponent(
                params.get("q") || ""
            )}&category=${params.get("category") || ""}&paid=${
                params.get("paid") || ""
            }&sort=${params.get("sort") || "latest"}`
        ).then(setBooks);

    const submit = (e) => {
        e.preventDefault();

        setParams((p) => {
            p.set("q", q);
            return p;
        });
    };

    return (
        <section className="catalog">
            <header className="page-header">
                <p>Explore your favorite books</p>

                <h1>Categories & Books</h1>

                <form
                    onSubmit={submit}
                    className="large-search"
                >
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search your favorite books..."
                    />

                    <button>⌕</button>
                </form>
            </header>

            <div className="filters">
                <button
                    className={
                        !params.get("category")
                            ? "active"
                            : ""
                    }
                    onClick={() => {
                        params.delete("category");
                        setParams(params);
                    }}
                >
                    All
                </button>

                {cats.slice(0, 5).map((c) => (
                    <button
                        className={
                            params.get("category") === c._id
                                ? "active"
                                : ""
                        }
                        key={c._id}
                        onClick={() =>
                            setParams((p) => {
                                p.set("category", c._id);
                                return p;
                            })
                        }
                    >
                        {c.name}
                    </button>
                ))}

                <select
                    value={paid}
                    onChange={(e) => {
                        setPaid(e.target.value);

                        setParams((p) => {
                            if (e.target.value) {
                                p.set(
                                    "paid",
                                    e.target.value
                                );
                            } else {
                                p.delete("paid");
                            }

                            return p;
                        });
                    }}
                >
                    <option value="">All types</option>
                    <option value="false">Free</option>
                    <option value="true">Paid</option>
                </select>
            </div>

            <div className="book-grid catalog-grid">
                {books.map((b) => (
                    <BookCard
                        key={b._id}
                        book={b}
                    />
                ))}
            </div>

            {!books.length && (
                <div className="empty">
                    No books found.
                </div>
            )}
        </section>
    );
}