const express = require("express")
const { pool } = require("../config/db")
const borrowingRouter = express.Router()

borrowingRouter.post("/book/:id", async (req, res) => {
    const { id } = req.params;
    const { name, address, unique_id, promised_return_date} = req.body;

    try {
        const [books] = await pool.query(
            `SELECT id, available
             FROM books
             WHERE id = ?`,
            [id]
        );
        if (books.length === 0) {
            return res.status(404).json({
                error: "Book not found"
            });
        }
        if (!books[0].available) {
            return res.status(400).json({
                error: "Book is currently not available"
            });
        }

        const [borrowers] = await pool.query(
            `SELECT id
             FROM borrowers
             WHERE unique_id = ?`,
            [unique_id]
        );

        let borrowerId;
        if (borrowers.length > 0) {
            borrowerId = borrowers[0].id;
        } else { 
            const [newBorrower] = await pool.query(
                `INSERT INTO borrowers
                (name, address, unique_id)
                VALUES (?, ?, ?)`,
                [name, address, unique_id]
            );
            borrowerId = newBorrower.insertId;
        }
        await pool.query(
            `INSERT INTO borrow_history
            (book_id, borrower_id, promised_return_date)
            VALUES (?, ?, ?)`,
            [id, borrowerId, promised_return_date]
        );
        await pool.query(
            `UPDATE books
             SET available = FALSE
             WHERE id = ?`,
            [id]
        );
        res.status(201).json({
            message: "Book borrowed successfully"
        });
    } catch (err) {
        console.error("Error borrowing book:", err);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

borrowingRouter.get( "/history/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;
        const [rows] = await pool.query(
            `SELECT
                bh.id,

                br.id AS borrower_id,
                br.name AS borrower_name,
                br.address AS borrower_address,
                br.unique_id AS borrower_unique_id,

                bh.borrowed_at,
                bh.promised_return_date,
                bh.returned_at,
                bh.status

            FROM borrow_history bh

            INNER JOIN borrowers br
                ON bh.borrower_id = br.id

            WHERE bh.book_id = ?

            ORDER BY bh.borrowed_at DESC`,
            [bookId]
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error getting borrow history:", err);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

module.exports = borrowingRouter