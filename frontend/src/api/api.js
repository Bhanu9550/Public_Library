import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

export async function getBooks() {
  const { data } = await api.get("/booksAPI/getBooks");
  return data;
}

// These two endpoints should be added to the backend.
export async function getBook(id) {
  const { data } = await api.get(`/booksAPI/getBook/${id}`);
  return data;
}

export async function getBorrowHistory(bookId) {
  const { data } = await api.get(`/borrow/history/${bookId}`);
  return data;
}

export async function verifyPin(pin) {
  const { data } = await api.post("/booksAPI/verifyPin", { pin });
  return data;
}

export async function addBook(formData) {
  const { data } = await api.post("/booksAPI/addBook", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function updateBook(id, payload) {
  const { data } = await api.patch(`/booksAPI/updateBook/${id}`, payload);
  return data;
}

export async function deleteBook(id) {
  const { data } = await api.delete(`/booksAPI/deleteBook/${id}`);
  return data;
}

export async function borrowBook(bookId, payload) {
  const { data } = await api.post(`/borrow/book/${bookId}`, payload);
  return data;
}

export default api;
