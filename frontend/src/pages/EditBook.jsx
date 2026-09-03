import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { getBook, updateBook } from "../api/api";

export default function EditBook() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const pin = location.state?.pin || "";

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load book
  useEffect(() => {
    async function load() {
      try {
        const book = await getBook(id);

        setForm({
          title: book.title || "",
          author: book.author || "",
          category: book.category || "",
          description: book.description || "",
          isbn: book.isbn || "",
          available: book.available ?? true,
        });
      } catch (err) {
        setError(
          err.response?.data?.error || "Could not load book."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // Handle input changes
  function updateField(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Submit updated book
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateBook(id, form);

      navigate(`/books/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not update the book."
      );
    } finally {
      setSaving(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <Layout>
        <p className="state-message">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="form-page">

        {/* Page heading */}

        <div className="page-heading">
          <p className="eyebrow">Library management</p>
          <h1>Edit book</h1>
        </div>

        {/* Error */}

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {/* Edit form */}

        {form && (
          <form
            className="editor-card"
            onSubmit={handleSubmit}
          >

            <div className="form-grid">

              {/* Title, Author, Category, ISBN */}

              {["title", "author", "category", "isbn"].map(
                (field) => (
                  <label
                    className="field"
                    key={field}
                  >
                    <span>
                      {field
                        .replace("_", " ")
                        .replace(
                          /\b\w/g,
                          (c) => c.toUpperCase()
                        )}
                    </span>

                    <input
                      name={field}
                      value={form[field]}
                      onChange={updateField}
                    />
                  </label>
                )
              )}

              {/* Description */}

              <label className="field form-grid-full">
                <span>Description</span>

                <textarea
                  name="description"
                  rows="7"
                  value={form.description}
                  onChange={updateField}
                />
              </label>

              {/* Availability */}

              <label className="availability-field">

                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={updateField}
                />

                <span>
                  Book is available
                </span>

              </label>

            </div>

            {/* Buttons */}

            <div className="editor-actions">

              <button
                type="button"
                className="button button-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>
        )}

      </div>
    </Layout>
  );
}