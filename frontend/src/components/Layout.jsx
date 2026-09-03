import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-icon">📚</span>
          <span>Public Library</span>
        </Link>
        <Link to="/books/add" className="button button-primary">
          + Add Book
        </Link>
      </header>
      <main className="page-container">{children}</main>
    </div>
  );
}
