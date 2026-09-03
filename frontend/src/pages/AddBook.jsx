import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PinModal from "../components/PinModal";
import { addBook } from "../api/api";

const initialForm = {
  title: "",
  author: "",
  category: "",
  description: "",
  isbn: "",
};

export default function AddBook() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!Object.values(form).every(Boolean)) {
      setError("Please fill in all book fields.");
      return;
    }

    setShowPin(true);
  }

  async function handlePinSuccess(pin) {
    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (image) formData.append("image", image);

      const result = await addBook(formData);
      navigate(`/books/${result.bookId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not add the book.");
      setShowPin(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="form-page">
        <div className="page-heading">
          <p className="eyebrow">Library management</p>
          <h1>Add a new book</h1>
          <p>Add the book details and a cover image. Librarian PIN verification is required before saving.</p>
        </div>

        <form className="editor-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Title</span>
              <input name="title" value={form.title} onChange={updateField} />
            </label>

            <label className="field">
              <span>Author</span>
              <input name="author" value={form.author} onChange={updateField} />
            </label>

            <label className="field">
              <span>Category</span>
              <input name="category" value={form.category} onChange={updateField} />
            </label>

            <label className="field">
              <span>ISBN</span>
              <input name="isbn" value={form.isbn} onChange={updateField} />
            </label>

            <label className="field form-grid-full">
              <span>Description</span>
              <textarea name="description" rows="6" value={form.description} onChange={updateField} />
            </label>

            <label className="field form-grid-full">
              <span>Book image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
              {image && <small>{image.name}</small>}
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="editor-actions">
            <button type="button" className="button button-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button className="button button-primary" disabled={loading}>
              {loading ? "Adding Book..." : "Add Book"}
            </button>
          </div>
        </form>
      </div>

      {showPin && (
        <PinModal
          title="Verify before adding book"
          onClose={() => setShowPin(false)}
          onSuccess={handlePinSuccess}
        />
      )}
    </Layout>
  );
}
