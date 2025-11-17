import { Router } from "express";
import { updateUserProfile } from "./user.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";

const router = Router();

router.put("/update", verifyJwt, updateUserProfile);

export default router;
