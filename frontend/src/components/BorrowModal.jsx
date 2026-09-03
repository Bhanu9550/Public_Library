import { useState } from "react";
import { borrowBook } from "../api/api";

export default function BorrowModal({ book, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    unique_id: "",
    promised_return_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.address || !form.unique_id || !form.promised_return_date) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await borrowBook(book.id, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Could not borrow this book.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal modal-wide">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Borrow book</p>
            <h2>{book.title}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>×</button>
        </div>

        <p className="muted">
          New borrower? Create a unique ID. Returning borrower? Enter the same ID used previously.
        </p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label className="field">
            <span>Name</span>
            <input name="name" value={form.name} onChange={updateField} placeholder="Your name" />
          </label>

          <label className="field">
            <span>Address</span>
            <input name="address" value={form.address} onChange={updateField} placeholder="Your address" />
          </label>

          <label className="field">
            <span>Unique ID</span>
            <input name="unique_id" value={form.unique_id} onChange={updateField} placeholder="Create / enter your library ID" />
          </label>

          <label className="field">
            <span>Expected return date</span>
            <input
              type="date"
              name="promised_return_date"
              value={form.promised_return_date}
              onChange={updateField}
            />
          </label>

          {error && <p className="form-error form-grid-full">{error}</p>}

          <div className="modal-actions form-grid-full">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="button button-primary" disabled={loading}>
              {loading ? "Borrowing..." : "Borrow Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
