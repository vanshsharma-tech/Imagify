import Router from "express";
import { loginUser, registerUser, userCredits } from "../controllers/userController.js";
import userAuth from "../middleware/auth.js";
const userRouter = Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/credits",userAuth, userCredits);
export default userRouter;
