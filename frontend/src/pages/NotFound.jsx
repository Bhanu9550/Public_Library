import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="state-message">
        <h1>Page not found</h1>
        <Link to="/" className="button button-primary">Back to library</Link>
      </div>
    </Layout>
  );
}
