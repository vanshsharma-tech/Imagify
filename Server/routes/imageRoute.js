import { Router } from "express";
import generateImage from "../controllers/imageController.js";
import userAuth from "../middleware/auth.js";
const imageRouter = Router();

imageRouter.post("/generate-image", userAuth, generateImage);

export default imageRouter;
