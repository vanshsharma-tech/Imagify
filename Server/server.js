import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./Config/MongoDb.js"
import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/imageRoute.js";

const port = process.env.PORT || 4000;
const app = express();
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "https://imagifyin.netlify.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
connectDB()
app.use('/api/user',userRouter)
app.use('/api/image',imageRouter)

app.listen(port, () => {
  console.log(`Server is listing on port ${port}`);
});
