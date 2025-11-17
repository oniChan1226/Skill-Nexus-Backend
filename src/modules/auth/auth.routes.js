import { Router } from "express";
import { validateRequest, verifyJwt } from "../../middlewares/index.js";
import { login, logOut, me, refreshAccessToken, signup } from "./auth.controller.js";
import { loginSchema, signupSchema } from "./auth.validator.js";

const router = Router();

router.get("/me", verifyJwt, me);

router.get("/refresh", refreshAccessToken);

router.post("/signup", validateRequest(signupSchema), signup);

router.post("/login", validateRequest(loginSchema), login);

router.post("/logout", verifyJwt, logOut);

export default router;