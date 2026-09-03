import { useState } from "react";
import { verifyPin } from "../api/api";

export default function PinModal({
  title = "Librarian Verification",
  onSuccess,
  onClose
}) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!pin.trim()) {
      setError("Please enter the librarian PIN.");
      return;
    }

    try {
      // Disable buttons immediately
      setLoading(true);
      setError("");

      // Verify PIN
      await verifyPin(pin);

      // PIN is correct
      onSuccess(pin);

    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid librarian PIN."
      );
    } finally {
      // Enable buttons again if modal is still open
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">

      <div className="modal">

        <div className="modal-header">

          <div>
            <p className="eyebrow">Protected action</p>
            <h2>{title}</h2>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          <label className="field">

            <span>Enter librarian PIN</span>

            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              autoFocus
              disabled={loading}
            />

          </label>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <div className="modal-actions">

            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}