import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./Config/MongoDb.js"
import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/imageRoute.js";

const port = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // or your frontend domain
  credentials: true,
}));
connectDB()
app.use('/api/user',userRouter)
app.use('/api/image',imageRouter)

app.listen(port, () => {
  console.log(`Server is listing on port ${port}`);
});
