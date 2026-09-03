import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import PinModal from "../components/PinModal";
import BorrowModal from "../components/BorrowModal";
import { deleteBook, getBook, getBorrowHistory } from "../api/api";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pinAction, setPinAction] = useState(null);
  const [verifiedPin, setVerifiedPin] = useState("");
  const [showBorrow, setShowBorrow] = useState(false);

  async function loadBook() {
    try {
      setLoading(true);
      const [bookData, historyData] = await Promise.all([
        getBook(id),
        getBorrowHistory(id),
      ]);
      setBook(bookData);
      setHistory(historyData);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load book details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBook();
  }, [id]);

  function handlePinSuccess(pin) {
    setVerifiedPin(pin);

    if (pinAction === "edit") {
      navigate(`/books/${id}/edit`, { state: { pin } });
    }

    if (pinAction === "delete") {
      handleDelete();
    }

    setPinAction(null);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this book?"
    );

    if (!confirmed) return;

    try {
      await deleteBook(id);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete the book.");
    }
  }

  if (loading) {
    return <Layout><p className="state-message">Loading book...</p></Layout>;
  }

  if (error || !book) {
    return (
      <Layout>
        <p className="state-message error-state">{error || "Book not found."}</p>
        <Link to="/" className="button button-secondary">Back to library</Link>
      </Layout>
    );
  }

  const currentBorrow = history.find(
    (record) => record.returned_at === null && record.status !== true
  );

  return (
    <Layout>
      <Link to="/" className="back-link">← Back to library</Link>

      <section className="book-detail-layout">
        <div className="book-main-card">
          <div className="detail-cover">
            {book.image_url ? (
              <img src={book.image_url} alt={book.title} />
            ) : (
              <div className="book-placeholder large">📖</div>
            )}
          </div>

          <div className="detail-info">
            <div className="detail-actions">
              <button
                className="button button-secondary"
                onClick={() => setPinAction("edit")}
              >
                Edit
              </button>
              <button
                className="button button-danger"
                onClick={() => setPinAction("delete")}
              >
                Delete
              </button>
            </div>

            <p className="eyebrow">{book.category}</p>
            <h1>{book.title}</h1>
            <p className="book-author">by {book.author}</p>

            <div className="availability-box">
              <span className={`status-dot ${book.available ? "green" : "red"}`} />
              <div>
                <strong>{book.available ? "Available" : "Currently borrowed"}</strong>
                <span>
                  {book.available
                    ? "This book is available to borrow."
                    : currentBorrow
                      ? `Currently with ${currentBorrow.borrower_name || "a borrower"}.`
                      : "This book is not currently available."}
                </span>
              </div>

              <button
                className="button button-primary"
                disabled={!book.available}
                onClick={() => setShowBorrow(true)}
              >
                Borrow Book
              </button>
            </div>

            <div className="book-description">
              <h3>About this book</h3>
              <p>{book.description}</p>
            </div>

            <dl className="book-meta">
              <div><dt>ISBN</dt><dd>{book.isbn}</dd></div>
            </dl>
          </div>
        </div>

        <aside className="history-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Records</p>
              <h2>Borrow History</h2>
            </div>
            <span className="history-count">{history.length}</span>
          </div>

          {history.length === 0 ? (
            <p className="muted">No borrowing history yet.</p>
          ) : (
            <div className="history-list">
              {history.map((record) => (
                <div className="history-item" key={record.id}>
                  <div className="history-top">
                    <strong>{record.borrower_name || "Unknown borrower"}</strong>
                    <span className={`status-badge ${record.returned_at ? "available" : "borrowed"}`}>
                      {record.returned_at ? "Returned" : "Borrowed"}
                    </span>
                  </div>
                  <div className="history-grid">
                    <span>Borrowed</span>
                    <strong>{formatDate(record.borrowed_at)}</strong>
                    <span>Expected return</span>
                    <strong>{formatDate(record.promised_return_date)}</strong>
                    <span>Returned</span>
                    <strong>{formatDate(record.returned_at)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>

      {pinAction && (
        <PinModal
          title={pinAction === "edit" ? "Verify before editing" : "Verify before deleting"}
          onClose={() => setPinAction(null)}
          onSuccess={handlePinSuccess}
        />
      )}

      {showBorrow && (
        <BorrowModal
          book={book}
          onClose={() => setShowBorrow(false)}
          onSuccess={() => {
            setShowBorrow(false);
            loadBook();
          }}
        />
      )}
    </Layout>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}
