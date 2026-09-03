const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectDB = async()=>{
    try{
        const connection = await pool.getConnection();  
        console.log("Database connected successfully");
        connection.release();
    }catch(err){
        console.error("Error connecting to the database:", err);
        process.exit(1);
    }
}

module.exports = { pool, connectDB };