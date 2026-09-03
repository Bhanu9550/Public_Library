const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();    

const PORT = process.env.PORT || 5000;

const cors = require("cors");
app.use(cors({
    origin: process.env.FRONTEND_URL
}));

const { connectDB } = require("./config/db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//* bookController 
const bookRouter = require("./controllers/bookController");
app.use("/booksAPI", bookRouter);

//* borrowingController
const bookController = require("./controllers/borrowController")
app.use("/borrow", bookController) 


const startServer = async ()=>{
    try{
        await connectDB();
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1);
    }
}

startServer();
