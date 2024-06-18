import express  from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";


// app config
const app = express()
const port = process.env.PORT || 4000;


// middlewares
app.use(express.json())
app.use(cors())

//DB connection
connectDB();


//api end point
app.use("/api/food",foodRouter);
app.use("/images",express.static('uploads'))

app.get("/", (req, res) => {
    res.send("API is Working")
  });

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))


