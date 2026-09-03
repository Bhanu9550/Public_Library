import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BookDetails from "./pages/BookDetails";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/books/:id" element={<BookDetails />} />
      <Route path="/books/add" element={<AddBook />} />
      <Route path="/books/:id/edit" element={<EditBook />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
