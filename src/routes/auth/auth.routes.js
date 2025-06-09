import { Router } from "express";
import { validateRequest, verifyJwt } from "../../middlewares/index.js";
import { signUpSchema, loginSchema } from "../../validators/auth.schema.js"
import { login, logOut, me, signup, validateUsername } from "../../controllers/auth/auth.controller.js";

const router = Router();

router.route("/me").get(verifyJwt, me);

router.route("/signup").post(validateRequest(signUpSchema), signup);

router.route("/login").post(validateRequest(loginSchema), login);

router.route("/logout").post(verifyJwt, logOut);

router.route("/check-username").get(validateUsername);

export default router;