import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import BookCard from "../components/BookCard";
import { getBooks } from "../api/api";

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await getBooks();
        setBooks(data);
      } catch (err) {
        setError(err.response?.data?.error || "Could not load books.");
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return books;

    return books.filter((book) =>
      [book.title, book.author, book.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [books, search]);

  return (
    <Layout>
      <section className="hero">
        <div>
          <p className="eyebrow">Open to everyone</p>
          <h1>Find your next book.</h1>
          <p className="hero-copy">
            Search the library collection, check availability, and view borrowing history.
          </p>
        </div>
        <div className="hero-stat">
          <strong>{books.length}</strong>
          <span>Books in library</span>
        </div>
      </section>

      <section className="toolbar">
        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, or category..."
        />
      </section>

      {loading && <p className="state-message">Loading books...</p>}
      {error && <p className="state-message error-state">{error}</p>}

      {!loading && !error && filteredBooks.length === 0 && (
        <p className="state-message">No books found.</p>
      )}

      <section className="book-grid">
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </section>
    </Layout>
  );
}
