import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <div className="book-cover">
        {book.image_url ? (
          <img src={book.image_url} alt={book.title} />
        ) : (
          <div className="book-placeholder">📖</div>
        )}
      </div>
      <div className="book-card-body">
        <span className={`status-badge ${book.available ? "available" : "borrowed"}`}>
          {book.available ? "Available" : "Borrowed"}
        </span>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
      </div>
    </Link>
  );
}
