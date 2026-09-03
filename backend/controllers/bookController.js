const express = require("express")
const bookRouter = express.Router()

const multer = require("multer");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const { verifyPin } = require("../middleware/verifyPin")
const { pool } = require("../config/db")

bookRouter.post("/verifyPin", verifyPin, (req, res) => {
    res.status(200).json({ message: "Welcome to the Book API" })
});


const storage = multer.memoryStorage();
const upload = multer({
    storage
});

bookRouter.post("/addBook", upload.single("image"), async (req, res) => {
        try {
            const { title, author, category, description, isbn } = req.body;
            if ( !title || !author || !category || !description || !isbn) {
                return res.status(400).json({
                    error: "All fields are required"
                });
            }
            // Get uploaded image
            const imageFile = req.file || null;
            let imageUrl = null;
            let imagePublicId = null;
            // Upload image to Cloudinary
            if (imageFile) {
                const imageResult = await uploadToCloudinary(
                    imageFile.buffer,
                    "public-library/books"
                );
                imageUrl = imageResult.secure_url;
                imagePublicId = imageResult.public_id;
            }

            const [result] = await pool.query(
                `INSERT INTO books
                ( title, author, category, description, isbn, image_url, image_public_id )
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [ title, author, category, description, isbn, imageUrl, imagePublicId]);

            res.status(201).json({
                message: "Book added successfully",
                bookId: result.insertId,
                imageUrl
            });
        } catch (err) {
            console.error("Error adding book:", err);
            res.status(500).json({
                error: "Internal Server Error"
            });
        }
    }
);

bookRouter.get("/getBooks", async(req, res) => {
    try{
        const [rows] = await pool.query("SELECT * FROM books");
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching books:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

bookRouter.get( "/getBook/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `SELECT 
                b.id,
                b.title,
                b.author,
                b.category,
                b.description,
                b.isbn,
                b.image_url,
                b.image_public_id,
                b.created_at,

                bh.id AS borrow_history_id,
                bh.borrowed_at,
                bh.promised_return_date,
                bh.returned_at,
                bh.status,

                br.id AS borrower_id,
                br.name AS borrower_name,
                br.address AS borrower_address,
                br.unique_id AS borrower_unique_id

            FROM books b

            LEFT JOIN borrow_history bh
                ON b.id = bh.book_id
                AND bh.returned_at IS NULL

            LEFT JOIN borrowers br
                ON bh.borrower_id = br.id

            WHERE b.id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({
                error: "Book not found"
            });
        }
        const book = rows[0];
        res.status(200).json({
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category,
            description: book.description,
            isbn: book.isbn,
            image_url: book.image_url,
            image_public_id: book.image_public_id,
            created_at: book.created_at,
            available: !book.borrow_history_id,
            currentBorrower: book.borrow_history_id
                ? {
                    id: book.borrower_id,
                    name: book.borrower_name,
                    address: book.borrower_address,
                    unique_id: book.borrower_unique_id,
                    borrowed_at: book.borrowed_at,
                    promised_return_date: book.promised_return_date,
                    status: book.status
                }
                : null
        });
    } catch (err) {
        console.error("Error getting book:", err);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

bookRouter.patch("/updateBook/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const { title, author, category, description, isbn, available } = req.body;
        const updates = [];
        const values = [];
        if (title !== undefined) {
            updates.push("title = ?");
            values.push(title);
        }
        if (author !== undefined) {
            updates.push("author = ?");
            values.push(author);
        }
        if (category !== undefined) {
            updates.push("category = ?");
            values.push(category);
        }
        if (description !== undefined) {
            updates.push("description = ?");
            values.push(description);
        }
        if (isbn !== undefined) {
            updates.push("isbn = ?");
            values.push(isbn);
        }
        if (available !== undefined) {
            updates.push("available = ?");
            values.push(available);
        }
        if (updates.length === 0) {
            return res.status(400).json({
                error: "No fields provided to update"
            });
        }
        values.push(id);
        const [result] = await pool.query(
            `UPDATE books
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Book not found"
            });
        }
        if (available === true) {
            await pool.query(
                `UPDATE borrow_history
                 SET returned_at = CURRENT_TIMESTAMP,
                     status = TRUE
                 WHERE book_id = ?
                 AND returned_at IS NULL`,
                [id]
            );
        }
        res.status(200).json({
            message: "Book updated successfully"
        });
    } catch (err) {
        console.error("Error updating book:", err);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

bookRouter.delete("/deleteBook/:id", async(req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
            `DELETE FROM borrow_history
             WHERE book_id = ?`,
            [id]
        );
        const [result] = await pool.query(
            `DELETE FROM books
             WHERE id = ?`,
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Book not Found"
            });
        }
        res.status(200).json({
            message: "Book successfully deleted"
        });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({
            error: "Internal Server error"
        });
    }
});

module.exports = bookRouter;